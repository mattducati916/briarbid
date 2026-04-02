// netlify/functions/dashboard.js
const { query, queryOne } = require('./_db');
const { cors, err, getUserFromEvent } = require('./_auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({});

  const user = getUserFromEvent(event);
  if (!user) return err('Authentication required.', 401);

  const uid = user.id;

  const [myAuctions, myBids, stats, notifications] = await Promise.all([
    query(
      `SELECT id, title, slug, current_bid, starting_price, bid_count, status, end_time
         FROM auctions WHERE seller_id = $1 ORDER BY created_at DESC LIMIT 5`,
      [uid]
    ),
    query(
      `SELECT b.amount, a.title, a.id AS auction_id, a.end_time, a.status,
              a.current_bid, a.winner_id
         FROM bids b
         JOIN auctions a ON a.id = b.auction_id
        WHERE b.bidder_id = $1
        GROUP BY b.auction_id, b.amount, a.title, a.id, a.end_time, a.status, a.current_bid, a.winner_id
        ORDER BY b.amount DESC LIMIT 8`,
      [uid]
    ),
    Promise.all([
      queryOne('SELECT COUNT(*) AS n FROM auctions WHERE winner_id = $1', [uid]),
      queryOne('SELECT COUNT(DISTINCT auction_id) AS n FROM bids WHERE bidder_id = $1', [uid]),
      queryOne('SELECT COUNT(*) AS n FROM auctions WHERE seller_id = $1 AND status = \'sold\'', [uid]),
    ]),
    query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [uid]
    ),
  ]);

  // Mark notifications as read
  await queryOne('UPDATE notifications SET is_read = true WHERE user_id = $1', [uid]);

  return cors({
    myAuctions,
    myBids,
    stats: {
      won: parseInt(stats[0]?.n || 0),
      bids: parseInt(stats[1]?.n || 0),
      sold: parseInt(stats[2]?.n || 0),
      listings: myAuctions.length,
    },
    notifications,
  });
};
