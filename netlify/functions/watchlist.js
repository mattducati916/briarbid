// netlify/functions/watchlist.js
const { queryOne, query, execute } = require('./_db');
const { cors, err, getUserFromEvent } = require('./_auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({});

  const user = getUserFromEvent(event);
  if (!user) return err('Authentication required.', 401);

  if (event.httpMethod === 'POST') {
    const { auction_id } = JSON.parse(event.body || '{}');
    if (!auction_id) return err('Auction ID required.');

    const existing = await queryOne(
      'SELECT 1 FROM watchlist WHERE user_id = $1 AND auction_id = $2',
      [user.id, parseInt(auction_id)]
    );

    if (existing) {
      await execute('DELETE FROM watchlist WHERE user_id = $1 AND auction_id = $2', [user.id, parseInt(auction_id)]);
      return cors({ watching: false });
    } else {
      await execute('INSERT INTO watchlist (user_id, auction_id) VALUES ($1, $2)', [user.id, parseInt(auction_id)]);
      return cors({ watching: true });
    }
  }

  // GET — return user's watchlist
  const items = await query(
    `SELECT a.id, a.title, a.slug, a.current_bid, a.starting_price,
            a.bid_count, a.end_time, a.status,
            c.name AS category_name,
            (SELECT filename FROM auction_images WHERE auction_id = a.id ORDER BY sort_order LIMIT 1) AS thumb
       FROM watchlist w
       JOIN auctions a ON a.id = w.auction_id
       JOIN categories c ON c.id = a.category_id
      WHERE w.user_id = $1
      ORDER BY w.added_at DESC`,
    [user.id]
  );

  return cors({ items });
};
