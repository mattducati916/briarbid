// netlify/functions/auctions.js
const { query, queryOne } = require('./_db');
const { cors, err } = require('./_auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({});

  const p = event.queryStringParameters || {};
  const limit  = Math.min(parseInt(p.limit)  || 12, 50);
  const offset = parseInt(p.offset) || 0;

  const conditions = [`a.status = 'active'`, `a.end_time > NOW()`];
  const params = [];
  let i = 1;

  if (p.category) {
    conditions.push(`c.slug = $${i++}`);
    params.push(p.category);
  }
  if (p.search) {
    conditions.push(`(a.title ILIKE $${i} OR a.description ILIKE $${i})`);
    params.push(`%${p.search}%`);
    i++;
  }
  if (p.min_price) {
    conditions.push(`a.current_bid >= $${i++}`);
    params.push(parseFloat(p.min_price));
  }
  if (p.max_price) {
    conditions.push(`(a.current_bid <= $${i} OR a.bid_count = 0)`);
    params.push(parseFloat(p.max_price));
    i++;
  }

  const orderMap = {
    ending:   'a.end_time ASC',
    price_lo: 'a.current_bid ASC',
    price_hi: 'a.current_bid DESC',
    bids:     'a.bid_count DESC',
  };
  const order = orderMap[p.sort] || 'a.featured DESC, a.end_time ASC';
  const where = conditions.join(' AND ');

  const countRow = await queryOne(
    `SELECT COUNT(*) AS n FROM auctions a
     JOIN categories c ON c.id = a.category_id
     WHERE ${where}`,
    params
  );
  const total = parseInt(countRow?.n || 0);

  params.push(limit, offset);
  const auctions = await query(
    `SELECT a.id, a.title, a.slug, a.current_bid, a.starting_price,
            a.bid_count, a.end_time, a.buy_now_price, a.featured, a.status,
            c.name AS category_name, c.slug AS category_slug,
            u.username AS seller_name,
            (SELECT filename FROM auction_images WHERE auction_id = a.id ORDER BY sort_order LIMIT 1) AS thumb
       FROM auctions a
       JOIN categories c ON c.id = a.category_id
       JOIN users u ON u.id = a.seller_id
      WHERE ${where}
      ORDER BY ${order}
      LIMIT $${i} OFFSET $${i + 1}`,
    params
  );

  const categories = await query('SELECT * FROM categories ORDER BY sort_order');

  return cors({ auctions, total, categories });
};
