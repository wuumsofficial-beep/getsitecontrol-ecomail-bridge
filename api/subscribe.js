export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, first_name, last_name, surname } = req.body;

    if (!email) {
      console.error('Missing email in payload:', req.body);
      return res.status(400).json({ error: 'Missing required field: email' });
    }

    const name = first_name || req.body.name || '';
    const resolvedSurname = surname || last_name || '';

    const ECOMAIL_API_KEY = process.env.ECOMAIL_API_KEY;
    const ECOMAIL_LIST_ID = process.env.ECOMAIL_LIST_ID;

    if (!ECOMAIL_API_KEY || !ECOMAIL_LIST_ID) {
      console.error('Missing environment variables ECOMAIL_API_KEY or ECOMAIL_LIST_ID');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const ecomailResponse = await fetch(
      `https://api2.ecomailapp.cz/lists/${ECOMAIL_LIST_ID}/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'key': ECOMAIL_API_KEY,
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          name: name.trim(),
          surname: resolvedSurname.trim(),
          skip_confirmation: true,
          update_existing: true,
          trigger_autoresponders: true,
        }),
      }
    );

    const data = await ecomailResponse.json();

    if (!ecomailResponse.ok) {
      console.error('Ecomail API error:', ecomailResponse.status, data);
      return res.status(502).json({ error: 'Ecomail API error', details: data });
    }

    console.log(`Successfully subscribed: ${email}`);
    return res.status(200).json({ success: true, data });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
