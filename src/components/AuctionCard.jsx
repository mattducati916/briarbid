// src/components/AuctionCard.jsx
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { money, timeRemaining, isEndingSoon } from '../lib/utils'
import { toggleWatch } from '../lib/api'
import { useAuth } from '../lib/AuthContext'

export default function AuctionCard({ auction }) {
  const { user } = useAuth()
  const [timeLeft, setTimeLeft] = useState(timeRemaining(auction.end_time))
  const [watching, setWatching] = useState(false)
  const ending = isEndingSoon(auction.end_time)

  useEffect(() => {
    const t = setInterval(() => setTimeLeft(timeRemaining(auction.end_time)), 1000)
    return () => clearInterval(t)
  }, [auction.end_time])

  async function handleWatch(e) {
    e.preventDefault()
    if (!user) return
    try {
      const res = await toggleWatch(auction.id)
      setWatching(res.watching)
    } catch {}
  }

  const thumbSrc = auction.thumb
    ? `/uploads/${auction.thumb}`
    : '/no-image.svg'

  return (
    <article className={`auction-card${auction.featured ? ' auction-card--featured' : ''}`}>
      <Link to={`/auction/${auction.id}`} className="auction-card__img-wrap">
        <img src={thumbSrc} alt={auction.title} loading="lazy" className="auction-card__img" />
        {ending && <span className="badge badge--urgent">Ending Soon</span>}
        {!ending && auction.featured && <span className="badge badge--featured">Featured</span>}
        {auction.buy_now_price && <span className="badge badge--buynow">Buy Now</span>}
      </Link>
      <div className="auction-card__body">
        <p className="auction-card__category">{auction.category_name}</p>
        <h3 className="auction-card__title">
          <Link to={`/auction/${auction.id}`}>{auction.title}</Link>
        </h3>
        <div className="auction-card__meta">
          <div className="auction-card__bid">
            <span className="bid-label">{auction.bid_count > 0 ? 'Current Bid' : 'Starting at'}</span>
            <span className="bid-amount">{money(auction.current_bid || auction.starting_price)}</span>
          </div>
          <div className={`auction-card__time${ending ? ' auction-card__time--urgent' : ''}`}>
            ⏱ {timeLeft}
          </div>
        </div>
        <div className="auction-card__footer">
          <span className="auction-card__bids">{auction.bid_count} bid{auction.bid_count !== 1 ? 's' : ''}</span>
          {user && (
            <button
              className={`watch-btn${watching ? ' watch-btn--active' : ''}`}
              onClick={handleWatch}
              title={watching ? 'Unwatch' : 'Watch'}
            >
              {watching ? '★' : '☆'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
