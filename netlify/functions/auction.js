// netlify/functions/auction.js
const { queryOne, query } = require('./_db');
const { cors, err, getUserFromEvent } = require('./_auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({});

  const { id } = event.queryStringParameters || {};
  if (!id) return err('Auction ID required.');

  const auction = await queryOne(
    `SELECT a.*, u.username AS seller_name, u.avatar_url AS seller_avatar,
            c.name AS category_name, c.slug AS category_slug
       FROM auctions a
       JOIN users u ON u.id = a.seller_id
       JOIN categories c ON c.id = a.category_id
      WHERE a.id = $1`,
    [parseInt(id)]
  );

  if (!auction) return err('Auction not found.', 404);

  const images = await query(
    'SELECT * FROM auction_images WHERE auction_id = $1 ORDER BY sort_order',
    [auction.id]
  );

  const bids = await query(
    `SELECT b.amount, b.created_at, u.username
       FROM bids b JOIN users u ON u.id = b.bidder_id
      WHERE b.auction_id = $1
      ORDER BY b.amount DESC LIMIT 20`,
    [auction.id]
  );

  // Check if current user is watching
  const currentUser = getUserFromEvent(event);
  let watching = false;
  if (currentUser) {
    const w = await queryOne(
      'SELECT 1 FROM watchlist WHERE user_id = $1 AND auction_id = $2',
      [currentUser.id, auction.id]
    );
    watching = !!w;
  }

  return cors({ auction, images, bids, watching });
};
