import { env } from "bun";
import crypto from 'crypto';

if (!env.DISCORD_WEBHOOK) {
  throw new Error("DISCORD_WEBHOOK is required");
}

if (!env.HCBTHING_SECRET) {
  throw new Error("HCBTHING_SECRET is required");
}

const secret = env.HCBTHING_SECRET;
Bun.serve({
  async fetch(req) {
    const url = new URL(req.url);
    console.log(url.pathname);
    if (url.pathname === '/hcbthing') {
      const data = await req.text();
      const decrypted = decryptWithSecret(secret, data);
      if (!decrypted) {
        console.error('Invalid secret used for decryption');
        return new Response('Invalid secret', { status: 401 });
      }
      const parsed = JSON.parse(decrypted);
      if (parsed.event === 'new-donation') {
        console.log('NEW DONATION!!!!');

        const embed = {
          "content": null,
          "embeds": [
            {
              "title": "New Donation!!!!",
              "description": `**Amount**: **$${parsed.data.amount / 100}**\n**email**: ${parsed.data.donor_email}\n\n\"*${parsed.data.transaction_message}*"`,
              "color": 6611
            }
          ],
          "attachments": []
        }

        const response = await fetch(env.DISCORD_WEBHOOK!!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(embed)
        });

        if (!response.ok) {
          console.error('Failed to send message to discord');
          return new Response(undefined, { status: 500 });
        }
      }
      
      return new Response(undefined, { status: 200 });
    }

    return new Response(undefined, { status: 500 });
  },
  port: 3000
})


function decryptWithSecret(secret: string, data: string) {
  try {
    const decipher = crypto.createDecipher('aes-256-cbc', secret);
    let decrypted = decipher.update(data, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    console.error('Incorrect secret used for decryption');
  }
  return undefined;
}