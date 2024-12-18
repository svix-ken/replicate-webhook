const crypto = require('crypto');

export async function POST(req) {
    const webhook_id = req.headers.get("webhook-id") ?? "";
    const webhook_timestamp = req.headers.get("webhook-timestamp") ?? "";
    const webhook_signature = req.headers.get("webhook-signature") ?? "";

    const body = await req.text();

    const signedContent = `${webhook_id}.${webhook_timestamp}.${body}`;
    const secret = process.env.WEBHOOK_SECRET;

    // Decode the secret
    const secretBytes = Buffer.from(secret.split('_')[1], "base64");
    const computedSignature = crypto
        .createHmac('sha256', secretBytes)
        .update(signedContent)
        .digest('base64');

    try {
        const expectedSignatures = webhook_signature.split(' ').map(sig => sig.split(',')[1]);
        const isValid = expectedSignatures.some(expectedSignature => expectedSignature === computedSignature);

        if (!isValid) {
            throw new Error("Invalid signature");
        }
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return new Response("Bad Request", { status: 400 });
    }

    // Parse the webhook payload
    try {
        const parsedBody = JSON.parse(body);
        console.log(parsedBody)
    
        return new Response('OK', { status: 200 });
      } catch (err) {
        console.error('Failed to parse webhook payload:', err.message);
        return new Response('Internal Server Error', { status: 500 });
      }
}
