import { NextResponse } from "next/server";
import Replicate from "replicate";
 
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});
  
export async function POST(request) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error(
      'The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it.'
    );
  }
 
  const { prompt } = await request.json();
 
  const options = {
    version: '8beff3369e81422112d93b89ca01426147de542cd4684c244b673b105188fe5f',
    input: { prompt: prompt },
    webhook: `https://replicate-webhook.vercel.app/api/webhooks/image-generation`,
    webhook_events_filter: ["completed"],
  }
 
  // A prediction is the result you get when you run a model, including the input, output, and other details
  const prediction = await replicate.predictions.create(options);
 
  if (prediction?.error) {
    return NextResponse.json({ detail: prediction.error }, { status: 500 });
  }
 
  return NextResponse.json(prediction, { status: 201 });
}