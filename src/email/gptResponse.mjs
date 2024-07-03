import OpenAI from 'openai';
import dotenv from 'dotenv';
import { getPolicyStatus, updateMobileNumber } from './dbUtils.mjs';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateResponse(prompt, toEmail) {

  const systemMessage = `Your request is being processed by Autonom8's automated system. Please find your response below:`;

  if (prompt.includes('get my policy status')) {
    try {
      const policyStatus = await getPolicyStatus(toEmail);
      return `Your policy status: ${policyStatus}`;
    } catch (error) {
      return 'Error fetching policy status.';
    }
  } else if (prompt.includes('my mobile no is changed')) {
    try {
      const newNumber = prompt.match(/\d+/)[0];
      const rowsUpdated = await updateMobileNumber(newNumber, toEmail);
      if (rowsUpdated > 0) {
        return `Your mobile number has been updated to ${newNumber}.`;
      } else {
        return 'Failed to update mobile number.';
      }
    } catch (error) {
      return 'Error updating mobile number.';
    }
  } else {
    const completion = await openai.chat.completions.create({
      temperature: 0.7,
      max_tokens: 100,
      model: "gpt-4",
      messages: [
        { "role": "system", "content": systemMessage },
        { "role": "user", "content": `${prompt}` }
      ],
    });
    return completion.choices[0].message.content;
  }
}

export default generateResponse;

