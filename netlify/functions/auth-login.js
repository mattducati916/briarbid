// netlify/functions/auth-login.js
const bcrypt = require('bcryptjs');
const { queryOne } = require('./_db');
const { signToken, cors, err } = require('./_auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({});
  if (event.httpMethod !== 'POST') return err('Method not allowed', 405);

  const { email, password } = JSON.parse(event.body || '{}');
  if (!email || !password) return err('Email and password required.');

  const val = email.toLowerCase().trim();
  const user = val.includes('@')
    ? await queryOne('SELECT * FROM users WHERE email = $1', [val])
    : await queryOne('SELECT * FROM users WHERE username = $1', [val]);

  if (!user) return err('Invalid credentials.');
  if (user.is_banned) return err('Your account has been suspended.');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return err('Invalid credentials.');

  const token = signToken(user);
  const { password_hash, ...safeUser } = user;
  return cors({ token, user: safeUser });
};
