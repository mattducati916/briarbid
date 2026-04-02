const { getStore } = require('@netlify/blobs');
const { cors, err } = require('./_auth');

exports.handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') return cors({});
  
  const key = event.queryStringParameters.key;
  if (!key) return err('Missing key', 400);

  try {
    const store = getStore('cms');
    const { data, metadata } = await store.getWithMetadata(key, { type: 'arrayBuffer' });
    
    if (!data) return err('Not found', 404);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': metadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000',
        'Access-Control-Allow-Origin': '*',
      },
      isBase64Encoded: true,
      body: Buffer.from(data).toString('base64'),
    };
  } catch (e) {
    console.error(e);
    return err('Failed to load asset', 500);
  }
};
