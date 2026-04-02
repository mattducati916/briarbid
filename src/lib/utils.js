// src/lib/utils.js

export function money(amount) {
  return '$' + parseFloat(amount || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export function timeRemaining(endTime) {
  const secs = Math.floor((new Date(endTime) - Date.now()) / 1000)
  if (secs <= 0) return 'Ended'
  const days  = Math.floor(secs / 86400)
  const hours = Math.floor((secs % 86400) / 3600)
  const mins  = Math.floor((secs % 3600) / 60)
  if (days > 0)  return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m ${secs % 60}s`
}

export function isEndingSoon(endTime) {
  const secs = (new Date(endTime) - Date.now()) / 1000
  return secs > 0 && secs < 86400
}

export function formatDate(dt, opts = {}) {
  return new Date(dt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
    ...opts,
  })
}

export function categoryEmoji(slug) {
  const map = {
    'pipes': '🪵',
    'pipe-tobacco': '🌿',
    'cigars': '💨',
    'cigar-accessories': '✂️',
    'pipe-accessories': '🔧',
    'lighters-matches': '🔥',
    'humidors-storage': '📦',
    'tobacco-tins-jars': '🫙',
    'books-literature': '📚',
  }
  return map[slug] || '🟫'
}

export function notifIcon(type) {
  const map = { outbid: '📢', won: '🏆', sold: '💰', ending_soon: '⏰' }
  return map[type] || '🔔'
}
