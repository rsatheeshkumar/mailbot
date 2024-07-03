import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import oAuth2Client from './auth/gmailAuth.mjs';
import processEmails from './email/readEmails.mjs';

dotenv.config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;
const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify'
];

app.get('/auth', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  res.redirect(authUrl);
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  const { tokens } = await oAuth2Client.getToken(code);
  oAuth2Client.setCredentials(tokens);
  console.log('Tokens acquired:', tokens);

  res.send('Authorization successful! You can close this window.');
  processEmails();
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Visit http://localhost:${PORT}/auth to initiate OAuth 2.0 flow`);
});