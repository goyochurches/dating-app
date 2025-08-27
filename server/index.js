import { createServer } from 'http';
import { Server } from 'socket.io';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

// Almacenamiento en memoria: mensajes por conversationId
const roomsMessages = new Map(); // conversationId -> [messages]

io.on('connection', (socket) => {
  // Unirse a una conversación (room)
  socket.on('join', ({ conversationId, userId }) => {
    if (!conversationId) return;
    socket.join(String(conversationId));

    // Inicializar almacenamiento si no existe
    if (!roomsMessages.has(conversationId)) {
      roomsMessages.set(conversationId, []);
    }

    // Enviar historial al cliente que se une
    const history = roomsMessages.get(conversationId);
    socket.emit('history', { conversationId, messages: history });
  });

  // Mensaje enviado por un cliente
  socket.on('message', (message) => {
    try {
      const { conversationId } = message || {};
      if (!conversationId) return;

      if (!roomsMessages.has(conversationId)) {
        roomsMessages.set(conversationId, []);
      }

      const arr = roomsMessages.get(conversationId);
      // evitar duplicados por id
      if (!arr.some((m) => m.id === message.id)) {
        arr.push(message);
      }

      // reenviar a todos en la room
      io.to(String(conversationId)).emit('message', message);
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server listening on http://localhost:${PORT}`);
});
