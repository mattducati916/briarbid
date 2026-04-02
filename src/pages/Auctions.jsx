// src/pages/Auctions.jsx
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAuctions } from '../lib/api'
import AuctionCard from '../components/AuctionCard'

export default function Auctions() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [data, setData] = useState({ auctions: [], total: 0, categories: [] })
  const [loading, setLoading] = useState(true)

  const filters = {
    category:  searchParams.get('category')  || '',
    search:    searchParams.get('q')         || '',
    sort:      searchParams.get('sort')      || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    offset:    parseInt(searchParams.get('offset') || '0'),
  }

  useEffect(() => {
    setLoading(true)
    getAuctions({ ...filters, limit: 12 })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [searchParams.toString()])

  function applyFilter(key, val) {
    const next = new URLSearchParams(searchParams)
    if (val) next.set(key, val); else next.delete(key)
    next.delete('offset')
    setSearchParams(next)
  }

  function handleSubmit(e) {
    e.preventDefault()
    const fd = new FormData(e.target)
    const next = new URLSearchParams()
    for (const [k, v] of fd.entries()) if (v) next.set(k, v)
    setSearchParams(next)
  }

  const totalPages = Math.ceil(data.total / 12)
  const currentPage = Math.floor(filters.offset / 12) + 1

  return (
    <div className="container">
      <div className="page-header">
        <h1>
          {filters.search ? `Results for "${filters.search}"` :
           filters.category ? (data.categories?.find(c => c.slug === filters.category)?.name || 'Auctions') :
           'All Auctions'}
        </h1>
        <span className="result-count">{data.total.toLocaleString()} auction{data.total !== 1 ? 's' : ''}</span>
      </div>

      <div className="browse-layout">
        {/* Sidebar */}
        <aside className="filters-sidebar">
          <form onSubmit={handleSubmit}>
            <h3 className="filter-heading">Filter</h3>

            <div className="filter-group">
              <label>Search</label>
              <input type="text" name="q" defaultValue={filters.search} placeholder="Keywords…" />
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select name="category" defaultValue={filters.category}>
                <option value="">All Categories</option>
                {data.categories?.map(c => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>
              <div className="price-range">
                <input type="number" name="min_price" placeholder="Min $" defaultValue={filters.min_price} min="0" step="0.01" />
                <span>–</span>
                <input type="number" name="max_price" placeholder="Max $" defaultValue={filters.max_price} min="0" step="0.01" />
              </div>
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select name="sort" defaultValue={filters.sort}>
                <option value="">Featured</option>
                <option value="ending">Ending Soonest</option>
                <option value="price_lo">Price: Low to High</option>
                <option value="price_hi">Price: High to Low</option>
                <option value="bids">Most Bids</option>
              </select>
            </div>

            <button type="submit" className="btn btn--primary btn--block">Apply Filters</button>
            {(filters.search || filters.category || filters.min_price || filters.max_price) && (
              <button type="button" className="btn btn--ghost btn--block" onClick={() => setSearchParams({})}>
                Clear All
              </button>
            )}
          </form>
        </aside>

        {/* Results */}
        <div className="browse-results">
          {loading ? (
            <div className="loading">Loading…</div>
          ) : data.auctions.length ? (
            <>
              <div className="auction-grid">
                {data.auctions.map(a => <AuctionCard key={a.id} auction={a} />)}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="pagination">
                  {currentPage > 1 && (
                    <button className="btn btn--sm" onClick={() => applyFilter('offset', String((currentPage - 2) * 12))}>
                      &laquo; Prev
                    </button>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      className={`btn btn--sm${i + 1 === currentPage ? ' btn--primary' : ''}`}
                      onClick={() => applyFilter('offset', String(i * 12))}
                    >
                      {i + 1}
                    </button>
                  ))}
                  {currentPage < totalPages && (
                    <button className="btn btn--sm" onClick={() => applyFilter('offset', String(currentPage * 12))}>
                      Next &raquo;
                    </button>
                  )}
                </nav>
              )}
            </>
          ) : (
            <div className="empty-state">
              <p>No auctions found. Try adjusting your filters.</p>
              <button className="btn btn--outline" onClick={() => setSearchParams({})}>Clear Filters</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
