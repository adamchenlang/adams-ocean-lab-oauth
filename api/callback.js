// OAuth callback handler
export default async function handler(req, res) {
  const { code } = req.query;
  
  if (!code) {
    return res.redirect('/?error=no_code');
  }

  // Redirect to auth endpoint
  res.redirect(`/api/auth?code=${code}`);
}
