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
 
  const audio = await request.json();
 
  const output = await replicate.predictions.create({
    version: "3ab86df6c8f54c11309d4d1f930ac292bad43ace52d10c80d87eb258b3c9f79c",
    input: {
        task: "transcribe",
        audio: audio.url,
        batch_size: 64
    },
    webhook: `https://replicate-webhook.vercel.app/api/webhooks/transcription`,
    webhook_events_filter: ["completed"],
  });
 
  if (output?.error) {
    return NextResponse.json({ detail: output.error }, { status: 500 });
  }
 
  return NextResponse.json(output, { status: 201 });
}