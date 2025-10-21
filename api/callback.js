// OAuth callback handler
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }

  try {
    const clientId = process.env.OAUTH_CLIENT_ID;
    const clientSecret = process.env.OAUTH_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'OAuth credentials not configured' });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await tokenResponse.json();

    if (data.error) {
      return res.status(400).json(data);
    }

    // Return token to CMS
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authorization Success</title>
        </head>
        <body>
          <script>
            (function() {
              window.opener.postMessage(
                'authorization:github:success:${JSON.stringify(data)}',
                '*'
              );
              window.close();
            })();
          </script>
          <p>Authorization successful! This window will close automatically.</p>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(content);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
