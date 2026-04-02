// netlify/functions/home.js
const { query, queryOne } = require('./_db');
const { cors } = require('./_auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({});

  const [featured, endingSoon, categories, stats] = await Promise.all([
    query(
      `SELECT a.id, a.title, a.slug, a.current_bid, a.starting_price,
              a.bid_count, a.end_time, a.buy_now_price, a.featured,
              c.name AS category_name, c.slug AS category_slug,
              u.username AS seller_name,
              (SELECT filename FROM auction_images WHERE auction_id = a.id ORDER BY sort_order LIMIT 1) AS thumb
         FROM auctions a
         JOIN categories c ON c.id = a.category_id
         JOIN users u ON u.id = a.seller_id
        WHERE a.status = 'active' AND a.end_time > NOW()
        ORDER BY a.featured DESC, a.end_time ASC
        LIMIT 6`
    ),
    query(
      `SELECT a.id, a.title, a.slug, a.current_bid, a.starting_price,
              a.bid_count, a.end_time, a.buy_now_price, a.featured,
              c.name AS category_name, c.slug AS category_slug,
              u.username AS seller_name,
              (SELECT filename FROM auction_images WHERE auction_id = a.id ORDER BY sort_order LIMIT 1) AS thumb
         FROM auctions a
         JOIN categories c ON c.id = a.category_id
         JOIN users u ON u.id = a.seller_id
        WHERE a.status = 'active'
          AND a.end_time > NOW()
          AND a.end_time < NOW() + INTERVAL '24 hours'
        ORDER BY a.end_time ASC
        LIMIT 4`
    ),
    query('SELECT * FROM categories ORDER BY sort_order'),
    queryOne(
      `SELECT
         (SELECT COUNT(*) FROM auctions WHERE status = 'active') AS active,
         (SELECT COUNT(*) FROM users) AS members,
         (SELECT COUNT(*) FROM bids) AS total_bids`
    ),
  ]);

  return cors({ featured, endingSoon, categories, stats });
};
