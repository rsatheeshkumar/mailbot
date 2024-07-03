import { google } from 'googleapis';
import oAuth2Client from '../auth/gmailAuth.mjs';
import generateResponse from './gptResponse.mjs';
import sendEmail from './sendEmail.mjs';

const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
let lastMessageId = null;

async function listMessages() {
  const res = await gmail.users.messages.list({
    userId: 'me',
    q: 'is:unread',
  });
  return res.data.messages || [];
}

async function getMessage(messageId) {
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId,
  });
  return res.data;
}

async function markAsRead(messageId) {
  await gmail.users.messages.modify({
    userId: 'me',
    id: messageId,
    resource: {
      removeLabelIds: ['UNREAD'],
    },
  });
}

async function processEmails() {
  const messages = await listMessages();
  
  // Check if there are new unread messages
  if (messages.length === 0 || messages[0].id === lastMessageId) {
    console.log('No new unread emails. Skipping execution.');
    return;
  }

  for (const message of messages) {
    const email = await getMessage(message.id);
    const emailData = email.payload.parts.find(part => part.mimeType === 'text/plain');
    
    const emailText = Buffer.from(emailData.body.data, 'base64').toString('utf-8');
    console.log(`Email data : ${emailText}`)

    const fromHeader = email.payload.headers.find(header => header.name === 'From').value;
    const toEmail = fromHeader.match(/<(.*?)>/)[1];

    const response = await generateResponse(emailText, toEmail);
    console.log(`Gpt Response : ${response}`)
    
    const subject = `Re: ${email.payload.headers.find(header => header.name === 'Subject').value}`;

    await sendEmail(toEmail, subject, response);
    console.log(`Email sent to: ${toEmail}`);

    await markAsRead(message.id);
    console.log(`Marked email as read: ${email.id}`);
  }

  lastMessageId = messages[0].id;
}

setInterval(async () => {
  try {
    await processEmails();
  } catch (error) {
    console.error('Error processing emails:', error);
  }
}, 60000); 

export default processEmails;
