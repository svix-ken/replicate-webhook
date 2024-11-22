// app/api/sse/route.js
import { addClient, removeClient } from '@/app/utils/sseConnections';

// Define the GET method for the SSE connection
export async function GET(req) {
  // Create a new response with the correct headers for SSE
  const headers = new Headers();
  headers.set('Content-Type', 'text/event-stream');
  headers.set('Cache-Control', 'no-cache');
  headers.set('Connection', 'keep-alive');

  const sendMessage = (message) => {
    controller.enqueue(encoder.encode(`data: ${message}\n\n`))
  }

  // Send an initial message
  sendMessage('Connected to SSE')

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      // This is where we will listen to client disconnects
      const client = { res: controller };
      addClient(client);

      // Cleanup when the client disconnects
      req.signal.addEventListener('abort', () => {
        console.log(client)
      });
    }
  });

  const heartbeatInterval = setInterval(() => {
    sendMessage('keep alive'); // Sending a comment to keep the connection alive
  }, 30000); // 30 seconds

  req.signal.addEventListener('abort', () => {
    clearInterval(heartbeatInterval);
  });

  // Return the response with the stream and headers
  return new Response(stream, { headers });
}
