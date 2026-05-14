exports.handler = async function(event) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const auth = event.headers.authorization || event.headers.Authorization || '';
  if (!auth.startsWith('Bearer demo-token-')) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const username = Buffer.from(auth.replace('Bearer demo-token-', ''), 'base64').toString('utf8');
  return {
    statusCode: 200,
    body: JSON.stringify({ user: { username } })
  };
};
