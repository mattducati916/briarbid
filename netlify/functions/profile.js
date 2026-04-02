// netlify/functions/profile.js
const { queryOne, query } = require('./_db');
const { cors, err } = require('./_auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({});

  const { username } = event.queryStringParameters || {};
  if (!username) return err('Username required.');

  const user = await queryOne(
    `SELECT id, username, full_name, avatar_url, bio, created_at FROM users WHERE username = $1`,
    [username]
  );
  if (!user) return err('User not found.', 404);

  const [listings, reviews, stats] = await Promise.all([
    query(
      `SELECT id, title, slug, current_bid, starting_price, bid_count, status, end_time
         FROM auctions WHERE seller_id = $1 AND status IN ('active','sold')
         ORDER BY created_at DESC LIMIT 10`,
      [user.id]
    ),
    query(
      `SELECT r.rating, r.comment, r.created_at, u.username AS reviewer
         FROM reviews r JOIN users u ON u.id = r.reviewer_id
        WHERE r.reviewed_id = $1 ORDER BY r.created_at DESC LIMIT 10`,
      [user.id]
    ),
    queryOne(
      `SELECT
         (SELECT COUNT(*) FROM auctions WHERE seller_id = $1 AND status = 'sold') AS sold,
         (SELECT COUNT(*) FROM auctions WHERE seller_id = $1 AND status = 'active') AS active,
         (SELECT ROUND(AVG(rating),1) FROM reviews WHERE reviewed_id = $1) AS avg_rating`,
      [user.id]
    ),
  ]);

  return cors({ user, listings, reviews, stats });
};
