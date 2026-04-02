// netlify/functions/auth-register.js
const bcrypt = require('bcryptjs');
const { queryOne, execute } = require('./_db');
const { signToken, cors, err } = require('./_auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({});
  if (event.httpMethod !== 'POST') return err('Method not allowed', 405);

  const { username, email, password, full_name } = JSON.parse(event.body || '{}');

  if (!username || username.length < 3 || username.length > 50)
    return err('Username must be 3–50 characters.');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return err('Invalid email address.');
  if (!password || password.length < 8)
    return err('Password must be at least 8 characters.');

  const existingEmail = await queryOne('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existingEmail) return err('That email is already registered.');

  const existingUser = await queryOne('SELECT id FROM users WHERE username = $1', [username]);
  if (existingUser) return err('That username is taken.');

  const hash = await bcrypt.hash(password, 12);

  const user = await queryOne(
    `INSERT INTO users (username, email, password_hash, full_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, full_name, is_admin`,
    [username, email.toLowerCase(), hash, full_name || '']
  );

  const token = signToken(user);
  return cors({ token, user });
};
