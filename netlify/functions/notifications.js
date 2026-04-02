// netlify/functions/notifications.js
const { query, execute } = require('./_db');
const { cors, err, getUserFromEvent } = require('./_auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({});

  const user = getUserFromEvent(event);
  if (!user) return err('Authentication required.', 401);

  const notifications = await query(
    `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
    [user.id]
  );

  await execute('UPDATE notifications SET is_read = true WHERE user_id = $1', [user.id]);

  return cors({ notifications });
};
