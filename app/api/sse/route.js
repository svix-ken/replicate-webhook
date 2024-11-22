// app/api/sse/route.js
import { addClient, removeClient } from '@/app/utils/sseConnections';

// Define the GET method for the SSE connection
export async function GET(req) {
  // Create a new response with the correct headers for SSE
  const headers = new Headers();
  headers.set('Content-Type', 'text/event-stream');
  headers.set('Cache-Control', 'no-cache');
  headers.set('Connection', 'keep-alive');

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // This is where we will listen to client disconnects
      const client = { res: controller };
      addClient(client);

      // Cleanup when the client disconnects
      req.signal.addEventListener('abort', () => {
        removeClient(client);
      });
    }
  });

  // Return the response with the stream and headers
  return new Response(stream, { headers });
}
