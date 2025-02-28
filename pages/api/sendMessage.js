import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  console.log('Incoming request body:', req.body); // Debugging

  const { recipientPhone, message } = req.body; // Expect recipientPhone from frontend

  if (!recipientPhone || !message) {
    console.error('Missing recipientPhone or message:', { recipientPhone, message });
    return res.status(400).json({ error: 'Recipient phone number and message are required.' });
  }

  try {
    const response = await axios.post(
      'https://conversations.messagebird.com/v1/send',
      {
        to: recipientPhone, // Ensure the correct phone number is used
        from: process.env.MESSAGEBIRD_CHANNEL_ID,
        type: 'text',
        content: { text: message },
      },
      {
        headers: {
          Authorization: `AccessKey ${process.env.MESSAGEBIRD_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json({ success: true, response: response.data });
  } catch (error) {
    console.error('Message sending error:', error.response?.data || error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
