import 'dotenv/config';
import { google } from 'googleapis';
import http from 'http';
import { URL } from 'url';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3000/oauth/callback'
);

// Generate the authorization URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',                    // Force consent to always get refresh_token
  scope: ['https://www.googleapis.com/auth/calendar'],
});

console.log('\n🔗 Open this URL in your browser:\n');
console.log(authUrl);
console.log('\n⏳ Waiting for callback on http://localhost:3000/oauth/callback ...\n');

// Start a temporary server to catch the callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3000');

  if (url.pathname === '/oauth/callback') {
    const code = url.searchParams.get('code');

    if (!code) {
      res.end('❌ No authorization code received.');
      return;
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>✅ Success!</h1><p>You can close this tab and go back to your terminal.</p>');

      console.log('\n✅ Got tokens!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n👆 Copy the line above and paste it into your .env file\n');

      server.close();
      process.exit(0);
    } catch (err) {
      res.end('❌ Error exchanging code: ' + err.message);
      console.error('Error:', err.message);
    }
  }
});

server.listen(3000, () => {
  console.log('Temporary server listening on port 3000...');
});
