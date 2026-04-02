// src/pages/AuctionDetail.jsx
import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getAuction, placeBid, toggleWatch } from '../lib/api'
import { money, timeRemaining, formatDate } from '../lib/utils'
import { useAuth } from '../lib/AuthContext'

const MIN_BID_INCREMENT = 0.50

export default function AuctionDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [bidAmount, setBidAmount] = useState('')
  const [bidMsg, setBidMsg] = useState(null)
  const [bidding, setBidding] = useState(false)
  const [watching, setWatching] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [countdown, setCountdown] = useState('')
  const [heroImg, setHeroImg] = useState(null)

  useEffect(() => {
    getAuction(id)
      .then(d => {
        setData(d)
        setWatching(d.watching)
        if (d.images?.length) setHeroImg(`/uploads/${d.images[0].filename}`)
        const minBid = d.auction.bid_count > 0
          ? parseFloat(d.auction.current_bid) + MIN_BID_INCREMENT
          : parseFloat(d.auction.starting_price)
        setBidAmount(minBid.toFixed(2))
      })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!data?.auction?.end_time) return
    const t = setInterval(() => setCountdown(timeRemaining(data.auction.end_time)), 1000)
    setCountdown(timeRemaining(data.auction.end_time))
    return () => clearInterval(t)
  }, [data?.auction?.end_time])

  async function handleBid(e) {
    e.preventDefault()
    if (!user) { navigate('/login'); return }
    setBidding(true)
    setBidMsg(null)
    try {
      await placeBid(id, parseFloat(bidAmount))
      setBidMsg({ type: 'success', text: 'Bid placed successfully!' })
      const d = await getAuction(id)
      setData(d)
    } catch (err) {
      setBidMsg({ type: 'error', text: err.message })
    } finally {
      setBidding(false)
    }
  }

  async function handleWatch() {
    if (!user) { navigate('/login'); return }
    try {
      const res = await toggleWatch(id)
      setWatching(res.watching)
    } catch {}
  }

  if (loading) return <div className="loading">Loading…</div>
  if (!data) return <div className="container"><h1>Auction not found.</h1></div>

  const { auction, images, bids } = data
  const isEnded   = ['ended', 'sold', 'cancelled'].includes(auction.status)
  const isSeller  = user?.id === auction.seller_id
  const isWinner  = user?.id === auction.winner_id
  const minBid    = auction.bid_count > 0
    ? parseFloat(auction.current_bid) + MIN_BID_INCREMENT
    : parseFloat(auction.starting_price)

  return (
    <div className="container auction-page">
      <div className="auction-layout">
        {/* Gallery */}
        <div className="auction-gallery">
          <div className="gallery-main">
            <img id="gallery-hero" src={heroImg || '/no-image.svg'} alt={auction.title} />
          </div>
          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <img
                  key={img.id}
                  src={`/uploads/${img.filename}`}
                  className={`gallery-thumb${heroImg === `/uploads/${img.filename}` ? ' active' : ''}`}
                  onClick={() => setHeroImg(`/uploads/${img.filename}`)}
                  alt={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bid panel */}
        <div className="auction-panel">
          <p className="auction-category">
            <Link to={`/auctions?category=${auction.category_slug}`}>{auction.category_name}</Link>
          </p>
          <h1 className="auction-title">{auction.title}</h1>

          <div className="auction-price-block">
            <div className="current-bid">
              <span className="bid-label">{auction.bid_count > 0 ? 'Current Bid' : 'Starting Price'}</span>
              <span className="bid-amount bid-amount--lg">
                {money(auction.current_bid || auction.starting_price)}
              </span>
              {auction.reserve_price && parseFloat(auction.current_bid) < parseFloat(auction.reserve_price) && (
                <span className="reserve-note">Reserve not met</span>
              )}
            </div>
            <div className={`auction-timer${isEnded ? '' : ''}`}>
              {isEnded ? (
                <span className="timer-label">Auction {auction.status}</span>
              ) : (
                <>
                  <span className="timer-label">Ends in</span>
                  <span className="timer-value">{countdown}</span>
                </>
              )}
            </div>
          </div>

          <div className="bid-stats">
            <span>{auction.bid_count} bid{auction.bid_count !== 1 ? 's' : ''}</span>
            <span>Ends {formatDate(auction.end_time)}</span>
          </div>

          {isWinner && <div className="winner-banner">🎉 You won this auction!</div>}

          {bidMsg && (
            <div className={`flash flash--${bidMsg.type}`}>{bidMsg.text}</div>
          )}

          {!isEnded && !isSeller && (
            user ? (
              <>
                <form onSubmit={handleBid} className="bid-form">
                  <div className="bid-input-group">
                    <span className="bid-prefix">$</span>
                    <input
                      type="number"
                      className="bid-input"
                      value={bidAmount}
                      min={minBid}
                      step="0.01"
                      onChange={e => setBidAmount(e.target.value)}
                    />
                  </div>
                  <p className="bid-hint">Minimum bid: {money(minBid)}</p>
                  <button type="submit" className="btn btn--primary btn--block btn--lg" disabled={bidding}>
                    {bidding ? 'Placing Bid…' : 'Place Bid'}
                  </button>
                </form>

                {auction.buy_now_price && (
                  <button
                    className="btn btn--accent btn--block"
                    onClick={() => { setBidAmount(auction.buy_now_price); }}
                    style={{ marginTop: 8 }}
                  >
                    Buy Now — {money(auction.buy_now_price)}
                  </button>
                )}

                <button
                  className={`btn btn--ghost btn--block watch-toggle${watching ? ' watch-btn--active' : ''}`}
                  onClick={handleWatch}
                  style={{ marginTop: 8 }}
                >
                  {watching ? '★ Watching' : '☆ Add to Watchlist'}
                </button>
              </>
            ) : (
              <div className="login-prompt">
                <Link to="/login" className="btn btn--primary btn--block btn--lg">Log in to Bid</Link>
                <p>or <Link to="/register">create a free account</Link></p>
              </div>
            )
          )}

          <div className="seller-box">
            <p className="seller-label">Sold by</p>
            <Link to={`/profile/${auction.seller_name}`} className="seller-link">
              <span className="avatar avatar--sm avatar--initials">
                {auction.seller_name?.[0]?.toUpperCase()}
              </span>
              {auction.seller_name}
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="auction-tabs">
        <div className="tabs">
          <button className={`tab-btn${activeTab === 'description' ? ' active' : ''}`} onClick={() => setActiveTab('description')}>
            Description
          </button>
          <button className={`tab-btn${activeTab === 'bids' ? ' active' : ''}`} onClick={() => setActiveTab('bids')}>
            Bid History ({bids.length})
          </button>
        </div>

        {activeTab === 'description' && (
          <div className="tab-panel active">
            {auction.condition_notes && (
              <p className="condition-note"><strong>Condition:</strong> {auction.condition_notes}</p>
            )}
            <div className="description-text">
              {auction.description.split('\n').map((line, i) => <p key={i}>{line}</p>)}
            </div>
          </div>
        )}

        {activeTab === 'bids' && (
          <div className="tab-panel active">
            {bids.length ? (
              <table className="bids-table">
                <thead><tr><th>Bidder</th><th>Amount</th><th>Time</th></tr></thead>
                <tbody>
                  {bids.map((b, i) => (
                    <tr key={i} className={i === 0 ? 'bid-row--winner' : ''}>
                      <td>{b.username}</td>
                      <td>{money(b.amount)}</td>
                      <td>{formatDate(b.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="empty-state">No bids yet. Be the first!</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
