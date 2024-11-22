const crypto = require('crypto');

export async function POST(req) {
    // const webhook_id = req.headers.get("webhook-id") ?? "";
    // const webhook_timestamp = req.headers.get("webhook-timestamp") ?? "";
    // const webhook_signature = req.headers.get("webhook-signature") ?? "";

    const body = await req.text();
    // const signedContent = `${webhook_id}.${webhook_timestamp}.${body}`;
    // const secret = process.env.WEBHOOK_SECRET;

    // // Decode the secret
    // const secretBytes = Buffer.from(secret.split('_')[1], "base64");
    // const computedSignature = crypto
    //     .createHmac('sha256', secretBytes)
    //     .update(signedContent)
    //     .digest('base64');

    // try {
    //     const expectedSignatures = webhook_signature.split(' ').map(sig => sig.split(',')[1]);
    //     const isValid = expectedSignatures.some(expectedSignature => expectedSignature === computedSignature);

    //     if (!isValid) {
    //         throw new Error("Invalid signature");
    //     }
    // } catch (err) {
    //     console.error("Webhook signature verification failed:", err.message);
    //     return new Response("Bad Request", { status: 400 });
    // }

    // Parse the webhook payload
    const parsedBody = JSON.parse(body);

    if (parsedBody.status === "succeeded" && parsedBody.output?.text) {
        const transcription = parsedBody.output.text;

        console.log("Received Transcription:", transcription);

        try {
            // Trigger the image generation model
            const imageResponse = await fetch('https://api.replicate.com/v1/predictions', {
                method: 'POST',
                headers: {
                    Authorization: `Token ${process.env.REPLICATE_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    version: 'image-generation-model-version-id', // Replace with your image generation model version ID
                    input: { text: transcription },
                    webhook: `https://replicate-webhook.vercel.app/api/webhooks/image-generation`, // Webhook for image generation
                    webhook_events_filter: ['completed'], // Notify only when completed
                }),
            });

            const imageData = await imageResponse.json();
            console.log("Triggered Image Generation:", imageData.id);

        } catch (imageErr) {
            console.error("Error triggering image generation:", imageErr.message);
            return new Response("Error triggering image generation", { status: 500 });
        }
    } else {
        console.error("Invalid webhook payload or status not succeeded");
        return new Response("Bad Request", { status: 400 });
    }

    return new Response("OK", { status: 200 });
}
