import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'
import { getCms, updateCms } from '../lib/api'

export default function Admin() {
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null) // base64 or 'clear'

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    getCms()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, navigate])

  if (loading) return <div className="loading">Loading…</div>
  if (!data) return <div className="error">Failed to load CMS data.</div>

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        heroTitle: data.heroTitle,
        heroSub: data.heroSub,
        whyItems: data.whyItems,
      }
      if (imageFile) {
        payload.imageFile = imageFile
      }
      await updateCms(payload)
      alert('CMS updated successfully!')
      setImageFile(null)
    } catch (err) {
      alert('Failed to update CMS: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setImageFile(event.target.result)
    }
    reader.readAsDataURL(file)
  }

  const updateWhyItem = (index, field, value) => {
    const newItems = [...data.whyItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setData({ ...data, whyItems: newItems })
  }

  return (
    <div className="container" style={{ padding: '40px 0', maxWidth: 800 }}>
      <h2>Admin: Website Page Data</h2>
      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: 20 }}>
        
        <div className="form-group">
          <label>Hero Title</label>
          <textarea
            value={data.heroTitle}
            onChange={e => setData({ ...data, heroTitle: e.target.value })}
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Hero Subtitle</label>
          <textarea
            value={data.heroSub}
            onChange={e => setData({ ...data, heroSub: e.target.value })}
            rows={2}
          />
        </div>

        <div className="form-group">
          <label>Hero Background Image</label>
          {data.heroBgUrl && !imageFile && (
            <div style={{ marginBottom: 10 }}>
              <img src={data.heroBgUrl} alt="Background" style={{ maxWidth: '100%', height: 100, objectFit: 'cover' }} />
              <br />
              <button type="button" className="btn btn--outline btn--sm" onClick={() => { setImageFile('clear'); setData({ ...data, heroBgUrl: null }) }}>Clear Image</button>
            </div>
          )}
          {imageFile && imageFile !== 'clear' && (
            <div style={{ marginBottom: 10 }}>
              <img src={imageFile} alt="Preview" style={{ maxWidth: '100%', height: 100, objectFit: 'cover' }} />
            </div>
          )}
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        <h3 style={{ marginTop: 20 }}>Why BriarBid? Items</h3>
        {data.whyItems.map((item, i) => (
          <div key={i} style={{ border: '1px solid #ddd', padding: 15, borderRadius: 8, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label>Icon (Emoji)</label>
              <input type="text" value={item.icon} onChange={e => updateWhyItem(i, 'icon', e.target.value)} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>Title</label>
              <input type="text" value={item.title} onChange={e => updateWhyItem(i, 'title', e.target.value)} style={{ width: '100%', padding: '8px' }} />
            </div>
            <div>
              <label>Description</label>
              <textarea value={item.desc} onChange={e => updateWhyItem(i, 'desc', e.target.value)} rows={2} style={{ width: '100%', padding: '8px' }} />
            </div>
          </div>
        ))}

        <button type="submit" className="btn btn--primary" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}
