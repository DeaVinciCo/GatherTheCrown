exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { username, password } = JSON.parse(event.body || '{}');
    if (!username || !password) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing username or password' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        user: { username },
        token: 'demo-token-' + Buffer.from(username).toString('base64')
      })
    };
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal Server Error' }) };
  }
};
