import { google } from 'googleapis';
import oAuth2Client from '../auth/gmailAuth.mjs';

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

async function sendEmail(to, subject, body) {
  const htmlBody = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6;">
        <p>${body}</p>
        <br>
        <p>Best Regards,<br/>Autonom8 Team<br/><a href="mailto:info@autonom8.com">info@autonom8.com</a></p>
      </body>
    </html>
  `;

  const messageParts = [
    `To: ${to}`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `Subject: ${subject}`,
    '',
    htmlBody,
  ];

  const message = messageParts.join('\n');

  const encodedMessage = Buffer.from(message)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
    },
  });
}

export default sendEmail;
