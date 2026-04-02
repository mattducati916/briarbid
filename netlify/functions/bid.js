// netlify/functions/bid.js
const { getPool, queryOne, execute } = require('./_db');
const { cors, err, getUserFromEvent } = require('./_auth');

const MIN_BID_INCREMENT = 0.50;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({});
  if (event.httpMethod !== 'POST') return err('Method not allowed', 405);

  const user = getUserFromEvent(event);
  if (!user) return err('Authentication required.', 401);

  const { auction_id, amount } = JSON.parse(event.body || '{}');
  if (!auction_id || !amount) return err('Auction ID and amount required.');

  const bidAmount = parseFloat(amount);
  if (isNaN(bidAmount) || bidAmount <= 0) return err('Invalid bid amount.');

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: [auction] } = await client.query(
      'SELECT * FROM auctions WHERE id = $1 FOR UPDATE',
      [parseInt(auction_id)]
    );

    if (!auction)                       throw new Error('Auction not found.');
    if (auction.status !== 'active')    throw new Error('This auction is not active.');
    if (new Date(auction.end_time) <= new Date()) throw new Error('This auction has ended.');
    if (auction.seller_id === user.id)  throw new Error('You cannot bid on your own auction.');

    const minBid = auction.bid_count === 0
      ? parseFloat(auction.starting_price)
      : parseFloat(auction.current_bid) + MIN_BID_INCREMENT;

    if (bidAmount < minBid)
      throw new Error(`Minimum bid is $${minBid.toFixed(2)}.`);

    const isBuyNow = auction.buy_now_price && bidAmount >= parseFloat(auction.buy_now_price);

    // Record bid
    await client.query(
      'INSERT INTO bids (auction_id, bidder_id, amount) VALUES ($1, $2, $3)',
      [auction.id, user.id, bidAmount]
    );

    // Update auction
    await client.query(
      `UPDATE auctions
         SET current_bid = $1,
             bid_count = bid_count + 1,
             status = CASE WHEN $2 THEN 'sold' ELSE status END,
             winner_id = CASE WHEN $2 THEN $3 ELSE winner_id END
       WHERE id = $4`,
      [bidAmount, isBuyNow, user.id, auction.id]
    );

    // Notify previous high bidder
    const { rows: [prevBid] } = await client.query(
      `SELECT bidder_id FROM bids
        WHERE auction_id = $1 AND bidder_id != $2
        ORDER BY amount DESC LIMIT 1`,
      [auction.id, user.id]
    );
    if (prevBid) {
      await client.query(
        `INSERT INTO notifications (user_id, type, auction_id, message)
         VALUES ($1, 'outbid', $2, $3)`,
        [prevBid.bidder_id, auction.id, `You've been outbid on "${auction.title}".`]
      );
    }

    await client.query('COMMIT');
    return cors({ success: true, isBuyNow });

  } catch (e) {
    await client.query('ROLLBACK');
    return err(e.message);
  } finally {
    client.release();
  }
};
