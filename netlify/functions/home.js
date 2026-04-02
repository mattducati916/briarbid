// netlify/functions/home.js
const { query, queryOne } = require('./_db');
const { cors } = require('./_auth');
const { getStore } = require('@netlify/blobs');

const defaultCmsData = {
  heroTitle: 'The Finest Tobacciana,\nAuctioned Daily.',
  heroSub: 'Rare pipes, aged tobaccos, vintage cigars and accessories — bid, sell, and collect with fellow enthusiasts.',
  heroBgUrl: null,
  whyItems: [
    { icon: '🎓', title: 'Enthusiast Community', desc: 'Built by and for pipe & cigar lovers. Every listing is reviewed for authenticity.' },
    { icon: '🔒', title: 'Trusted Transactions', desc: 'Verified sellers, transparent bid history, and buyer protection on every auction.' },
    { icon: '🌍', title: 'Rare Finds', desc: "Estate pipes, discontinued tobaccos, vintage humidors — things you won't find anywhere else." },
  ]
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({});

  const store = getStore('cms');
  let cmsData = defaultCmsData;
  try {
    const storedData = await store.get('home_data', { type: 'json' });
    if (storedData) cmsData = storedData;
  } catch (err) {
    console.error('Failed to load cms data', err);
  }

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

  return cors({ featured, endingSoon, categories, stats, cmsData });
};
