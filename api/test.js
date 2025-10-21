// Simple test endpoint
export default function handler(req, res) {
  res.status(200).json({ 
    message: 'OAuth server is working!',
    timestamp: new Date().toISOString()
  });
}
