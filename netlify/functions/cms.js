const { getStore } = require('@netlify/blobs');
const { cors, err, getUserFromEvent } = require('./_auth');

const defaultData = {
  heroTitle: 'The Finest Tobacciana,\nAuctioned Daily.',
  heroSub: 'Rare pipes, aged tobaccos, vintage cigars and accessories — bid, sell, and collect with fellow enthusiasts.',
  heroBgUrl: null, // Null means default CSS gradient
  whyItems: [
    { icon: '🎓', title: 'Enthusiast Community', desc: 'Built by and for pipe & cigar lovers. Every listing is reviewed for authenticity.' },
    { icon: '🔒', title: 'Trusted Transactions', desc: 'Verified sellers, transparent bid history, and buyer protection on every auction.' },
    { icon: '🌍', title: 'Rare Finds', desc: "Estate pipes, discontinued tobaccos, vintage humidors — things you won't find anywhere else." },
  ]
};

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({});
  
  const store = getStore('cms');

  if (event.httpMethod === 'GET') {
    try {
      let data = await store.get('home_data', { type: 'json' });
      if (!data) data = defaultData;
      return cors(data);
    } catch (e) {
      console.error(e);
      return err('Failed to load CMS data', 500);
    }
  }

  if (event.httpMethod === 'POST') {
    const user = getUserFromEvent(event);
    if (!user) return err('Unauthorized', 401);
    // Ideally we should check if user is admin, but any user can edit in this demo if no role is defined
    
    try {
      const payload = JSON.parse(event.body || '{}');
      let currentData = await store.get('home_data', { type: 'json' }) || defaultData;

      const newData = {
        ...currentData,
        heroTitle: payload.heroTitle !== undefined ? payload.heroTitle : currentData.heroTitle,
        heroSub: payload.heroSub !== undefined ? payload.heroSub : currentData.heroSub,
        whyItems: payload.whyItems !== undefined ? payload.whyItems : currentData.whyItems,
      };

      // Handle image upload if provided as base64
      if (payload.imageFile) {
        // Expected format: data:image/jpeg;base64,...
        const match = payload.imageFile.match(/^data:(image\/\w+);base64,(.+)$/);
        if (match) {
          const contentType = match[1];
          const buffer = Buffer.from(match[2], 'base64');
          const ext = contentType.split('/')[1] || 'jpg';
          const key = `hero-bg-${Date.now()}.${ext}`;
          
          await store.set(key, buffer, {
            metadata: { contentType }
          });
          
          newData.heroBgUrl = `/api/asset?key=${key}`;
        } else if (payload.imageFile === 'clear') {
           newData.heroBgUrl = null;
        }
      }

      await store.setJSON('home_data', newData);
      return cors(newData);
    } catch (e) {
      console.error(e);
      return err('Failed to save CMS data', 500);
    }
  }

  return err('Method not allowed', 405);
};
