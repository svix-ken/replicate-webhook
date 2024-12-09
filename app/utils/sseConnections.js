export const clients = [];

// Add a new client connection
export const addClient = (client) => {
  clients.push(client);
  console.log(`Client connected. Total clients: ${clients.length}`);
};

// Remove a client connection
export const removeClient = (client) => {
  const index = clients.indexOf(client);
  if (index !== -1) {
    clients.splice(index, 1);
    console.log(`Client disconnected. Total clients: ${clients.length}`);
  }
};

// Broadcast data to all connected clients
export const broadcast = (data) => {

  console.log(data)

  if (clients.length === 0) {
    console.log('No clients connected to broadcast to');
    return;
  }

  console.log("found clients")

  const message = `data: ${JSON.stringify(data)}\n\n`;
  const encoder = new TextEncoder();

  clients.forEach((client) => {
    try {
      client.controller.enqueue(encoder.encode(message));
    } catch (error) {
      console.error('Failed to send message to a client:', error);
    }
  });
};
