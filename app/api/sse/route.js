import { addClient, removeClient } from '@/app/utils/sseConnections';

export async function GET(req) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Define sendMessage inside the start method to access controller
      const sendMessage = (message) => {
        controller.enqueue(encoder.encode(`data: ${message}\n\n`));
      };

      // Add the client with a reference to this controller
      const client = { controller };

      addClient(client);

      console.log(`client added: ${client}`)

      // Send an initial message
      sendMessage('Connected to SSE');

      // Heartbeat to keep the connection alive
      const heartbeatInterval = setInterval(() => {
        sendMessage('keep-alive');
      }, 30000);

      // Cleanup on client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeatInterval);
        removeClient(client);
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
