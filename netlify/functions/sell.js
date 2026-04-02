// netlify/functions/sell.js
const { queryOne, execute } = require('./_db');
const { cors, err, getUserFromEvent } = require('./_auth');

const MAX_AUCTION_DAYS = 30;

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({});
  if (event.httpMethod !== 'POST') return err('Method not allowed', 405);

  const user = getUserFromEvent(event);
  if (!user) return err('Authentication required.', 401);

  const {
    title, description, category_id, condition_notes,
    starting_price, reserve_price, buy_now_price, end_time,
  } = JSON.parse(event.body || '{}');

  // Validation
  if (!title || title.trim().length < 5) return err('Title must be at least 5 characters.');
  if (!description || description.trim().length < 20) return err('Description must be at least 20 characters.');
  if (!category_id) return err('Please choose a category.');
  if (!starting_price || parseFloat(starting_price) < 0.01) return err('Starting price must be at least $0.01.');
  if (!end_time) return err('End time is required.');

  const endDate = new Date(end_time);
  const now = new Date();
  const maxDate = new Date(now.getTime() + MAX_AUCTION_DAYS * 86400000);
  if (endDate <= now) return err('End time must be in the future.');
  if (endDate > maxDate) return err(`Auctions may not exceed ${MAX_AUCTION_DAYS} days.`);

  // Generate slug
  let slug = title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').substring(0, 180);
  let slugBase = slug;
  let i = 1;
  while (await queryOne('SELECT id FROM auctions WHERE slug = $1', [slug])) {
    slug = `${slugBase}-${i++}`;
  }

  const auction = await queryOne(
    `INSERT INTO auctions
       (seller_id, category_id, title, slug, description, condition_notes,
        starting_price, reserve_price, buy_now_price, current_bid, status, start_time, end_time)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'active',NOW(),$11)
     RETURNING id, slug`,
    [
      user.id,
      parseInt(category_id),
      title.trim(),
      slug,
      description.trim(),
      condition_notes?.trim() || null,
      parseFloat(starting_price),
      reserve_price ? parseFloat(reserve_price) : null,
      buy_now_price  ? parseFloat(buy_now_price)  : null,
      parseFloat(starting_price),
      end_time,
    ]
  );

  return cors({ auction });
};
