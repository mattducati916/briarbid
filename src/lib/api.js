// src/lib/api.js — Thin wrapper around all Netlify Function calls

const BASE = '/api';

function getToken() {
  return localStorage.getItem('bb_token');
}

function authHeaders() {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Auth ──────────────────────────────────────────────────────
export const login = (email, password) =>
  request('/auth-login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const register = (payload) =>
  request('/auth-register', { method: 'POST', body: JSON.stringify(payload) });

// ── Home ──────────────────────────────────────────────────────
export const getHome = () => request('/home');

// ── Auctions ──────────────────────────────────────────────────
export const getAuctions = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null))
  ).toString();
  return request(`/auctions${qs ? '?' + qs : ''}`);
};

export const getAuction = (id) => request(`/auction?id=${id}`);

export const placeBid = (auction_id, amount) =>
  request('/bid', { method: 'POST', body: JSON.stringify({ auction_id, amount }) });

// ── Sell ──────────────────────────────────────────────────────
export const createAuction = (payload) =>
  request('/sell', { method: 'POST', body: JSON.stringify(payload) });

// ── Watchlist ─────────────────────────────────────────────────
export const getWatchlist = () => request('/watchlist');
export const toggleWatch = (auction_id) =>
  request('/watchlist', { method: 'POST', body: JSON.stringify({ auction_id }) });

// ── Dashboard ─────────────────────────────────────────────────
export const getDashboard = () => request('/dashboard');

// ── Notifications ─────────────────────────────────────────────
export const getNotifications = () => request('/notifications');

// ── Profile ───────────────────────────────────────────────────
export const getProfile = (username) => request(`/profile?username=${username}`);
