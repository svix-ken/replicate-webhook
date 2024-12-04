// utils/sseConnections.js
export const clients = [];

// Add a new client connection
export const addClient = (client) => {
  clients.push(client);
  console.log(`client connected: ${client}`)
};

// Remove a client connection
export const removeClient = (client) => {
  const index = clients.indexOf(client);
  if (index !== -1) {
    clients.splice(index, 1);
  }
};

// Broadcast data to all connected clients
export const broadcast = (data) => {
    if (clients.length === 0) {
      console.log('No clients connected to broadcast to');
    } else {
      console.log('broadcast data:', data);
      clients.forEach((client) => {
        // Write to the SSE client stream
        client.res.enqueue(`data: ${JSON.stringify(data)}\n\n`);
      });
    }
  };
  
