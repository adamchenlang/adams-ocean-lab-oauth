// Vercel Serverless Function for GitHub OAuth
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { code, provider } = req.query;
  
  // Initial auth request - redirect to GitHub
  if (!code && provider === 'github') {
    try {
      const clientId = process.env.OAUTH_CLIENT_ID;
      if (!clientId) {
        return res.status(500).json({ error: 'OAuth client ID not configured' });
      }
      
      const redirectUri = 'https://oauth-server-neon.vercel.app/api/callback';
      const scope = 'repo,user';
      
      const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
      
      return res.redirect(302, githubAuthUrl);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
  
  // Handle callback with code
  if (code) {
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
      return res.status(500).json({ error: error.message, stack: error.stack });
    }
  }
  
  return res.status(400).json({ error: 'Missing required parameters' });
}
