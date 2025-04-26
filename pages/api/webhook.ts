export default async function handler(req, res) {
    if (req.method === 'POST') {
      console.log('Incoming WhatsApp Message:', req.body);
  
      // Save message to a database or temporary store (optional)
      res.status(200).json({ message: 'Received' });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  }
  