import { addClient, removeClient, clients } from '@/app/utils/sseConnections';

export async function GET(req) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      console.log('New SSE connection established.');

      // Create a client object
      const client = { controller };

      // Add the client to the clients array
      addClient(client);
      console.log('Client added. Total clients:', clients.length);

      // Function to send a message to the client
      const sendMessage = (message) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(message)}\n\n`));
      };

      // Send an initial connection message
      sendMessage({ type: 'info', message: 'Connected to SSE' });

      // Heartbeat to keep the connection alive
      const heartbeatInterval = setInterval(() => {
        sendMessage({ type: 'heartbeat', message: 'keep-alive' });
      }, 30000);

      // Cleanup on disconnect
      req.signal.addEventListener('abort', () => {
        console.log('SSE client disconnected.');
        clearInterval(heartbeatInterval);
        removeClient(client);
        console.log('Client removed. Total clients:', clients.length);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
