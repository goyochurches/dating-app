import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

class MessagingService {
  constructor() {
    this.socket = null;
    this.currentUser = null;
    this.messageListeners = new Set();
    this.connectionListeners = new Set();
    this.conversations = new Map();
    this.isConnected = false;
    this.joiningRooms = new Set(); // Prevenir joins duplicados
  }


  // Inicializar conexión
  async initialize(user) {
    this.currentUser = user;

    // Conectar a servidor Socket.IO (realtime)
    try {
      this.socket = io('http://localhost:3001', {
        // Permitimos transports por defecto (polling y upgrade a websocket)
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        this.notifyConnectionListeners(true);
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        this.notifyConnectionListeners(false);
      });

      // Historial enviado por el servidor al unirse a una conversación
      this.socket.on('history', ({ conversationId, messages }) => {
        this._updateConversationMessages(conversationId, messages, true);
        this.joiningRooms.delete(conversationId); // Desbloquear
      });

      // Mensajes entrantes en tiempo real
      this.socket.on('message', (message) => {
        const { conversationId } = message || {};
        if (!conversationId) return;
        this._updateConversationMessages(conversationId, [message]);
      });
    } catch (error) {
      console.error('Socket connection error:', error);
    }

    await this.loadStoredConversations();

  }


  // Enviar mensaje
  async sendMessage(conversationId, message) {
    if (!this.currentUser) {
      throw new Error('Usuario no conectado');
    }

    const messageData = {
      id: uuidv4(),
      conversationId,
      senderId: this.currentUser.id,
      senderName: this.currentUser.name,
      text: message.text,
      media: message.media,
      mediaType: message.mediaType,
      timestamp: new Date().toISOString(),
      sent: true,
      isRead: false
    };

    // Emitir al servidor para sincronización en tiempo real.
    // El servidor se encargará de reenviar el mensaje a todos los clientes,
    // incluido el remitente. La UI se actualizará al recibirlo.
    if (this.socket && this.isConnected) {
      this.socket.emit('message', messageData);
    } else {
      // Opcional: manejar el caso sin conexión
      console.warn('Socket no conectado. El mensaje no se pudo enviar.');
      // Podríamos encolar el mensaje para enviarlo al reconectar
    }

    // Ya no guardamos localmente aquí para evitar duplicados.
    return messageData;
  }


  // Crear nueva conversación
  async createConversation(partnerId, partnerName) {
    if (!this.currentUser || !this.currentUser.id) {
      throw new Error('Current user is not defined');
    }
    // Generar un ID canónico para la conversación
    const conversationId = [this.currentUser.id, partnerId].sort().join('_');
    
    if (!this.conversations.has(conversationId)) {
      const conversation = {
        id: conversationId,
        partnerId,
        partnerName,
        messages: [],
        lastActivity: new Date().toISOString(),
        isActive: true,
        unreadCount: 0
      };

      this.conversations.set(conversationId, conversation);
      await this.storeConversation(conversation);

      // El mensaje de bienvenida ahora se gestiona del lado del servidor o 
      // se puede añadir una lógica más robusta si es necesario, 
      // pero eliminamos la emisión desde el cliente para evitar duplicados.
    }

    // La unión a la sala se gestionará a través de getConversationMessages
    // cuando el usuario entre explícitamente en el chat.

    return conversationId;
  }

  // Obtener mensajes de una conversación
  async getConversationMessages(conversationId) {
    // Prevenir joins duplicados si ya se está uniendo a esta sala
    if (this.joiningRooms.has(conversationId)) {
      const conversation = this.conversations.get(conversationId);
      return conversation?.messages || [];
    }

    if (this.socket && this.isConnected) {
      this.joiningRooms.add(conversationId); // Bloquear
      this.socket.emit('join', { conversationId, userId: this.currentUser?.id });
    }

    // Devolvemos los mensajes que ya tenemos en memoria (se actualizarán con 'history')
    const conversation = this.conversations.get(conversationId);
    return conversation?.messages || [];
  }

  // Obtener todas las conversaciones
  getConversations() {
    return Array.from(this.conversations.values());
  }

  // Marcar mensajes como leídos
  async markAsRead(conversationId) {
    try {
      if (!this.conversations.has(conversationId)) {
        // Cargar la conversación si no está en memoria
        const conversationKey = `conversation_${conversationId}`;
        const stored = await AsyncStorage.getItem(conversationKey);
        if (!stored) return;
        
        const conversation = JSON.parse(stored);
        this.conversations.set(conversation.id, conversation);
      }
      
      const conversation = this.conversations.get(conversationId);
      
      // Actualizar solo los mensajes no leídos del usuario actual
      const updatedMessages = conversation.messages?.map(msg => 
        !msg.isRead && msg.senderId !== this.currentUser?.id
          ? { ...msg, isRead: true }
          : msg
      ) || [];
      
      // Actualizar la conversación
      const updatedConversation = {
        ...conversation,
        messages: updatedMessages,
        unreadCount: 0,
        lastRead: new Date().toISOString()
      };
      
      // Guardar los cambios
      await this.storeConversation(updatedConversation);
      
      // Notificar a los listeners
      this.notifyMessageListeners(conversationId, { 
        type: 'read',
        conversationId,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error marking as read:', error);
      return false;
    }
  }

  // Guardar una conversación
  async storeConversation(conversation) {
    try {
      const conversationKey = `conversation_${conversation.id}`;
      await AsyncStorage.setItem(conversationKey, JSON.stringify(conversation));
      this.conversations.set(conversation.id, conversation);
    } catch (error) {
      console.error('Error storing conversation:', error);
    }
  }

  // Método centralizado para actualizar mensajes de una conversación
  _updateConversationMessages(conversationId, newMessages, replace = false) {
    if (!this.conversations.has(conversationId) || !newMessages) return;

    const conversation = this.conversations.get(conversationId);
    const messageMap = new Map(conversation.messages.map(m => [m.id, m]));

    if (replace) {
      messageMap.clear();
    }

    newMessages.forEach(msg => {
      messageMap.set(msg.id, msg);
    });

    const updatedMessages = Array.from(messageMap.values()).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    conversation.messages = updatedMessages;

    if (updatedMessages.length > 0) {
      const lastMessage = updatedMessages[updatedMessages.length - 1];
      conversation.lastActivity = lastMessage.timestamp;
      conversation.lastMessage = lastMessage.text || 'Media';
    }

    this.storeConversation(conversation);
    this.notifyMessageListeners(conversationId, { type: 'batch_update', messages: updatedMessages });
  }

  // Listeners para mensajes
  addMessageListener(callback) {
    this.messageListeners.add(callback);
  }

  removeMessageListener(callback) {
    this.messageListeners.delete(callback);
  }

  notifyMessageListeners(conversationId, message) {
    this.messageListeners.forEach(callback => {
      try {
        callback(conversationId, message);
      } catch (error) {
        console.error('Error in message listener:', error);
      }
    });
  }

  // Listeners para conexión
  addConnectionListener(callback) {
    this.connectionListeners.add(callback);
  }

  removeConnectionListener(callback) {
    this.connectionListeners.delete(callback);
  }

  notifyConnectionListeners(isConnected, users = []) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(isConnected, users);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  // Desconectar
  // Cargar conversaciones desde AsyncStorage
  async loadStoredConversations() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const conversationKeys = keys.filter(k => k.startsWith('conversation_'));
      
      for (const key of conversationKeys) {
        const storedConv = await AsyncStorage.getItem(key);
        if (storedConv) {
          const conversation = JSON.parse(storedConv);
          // Limpiar mensajes cacheados para forzar la carga desde el servidor.
          // Esta es la corrección clave para evitar duplicados.
          conversation.messages = [];
          this.conversations.set(conversation.id, conversation);
        }
      }
    } catch (error) {
      console.error('Error loading stored conversations:', error);
    }
  }

  disconnect() {
    this.isConnected = false;
    this.currentUser = null;
    this.conversations.clear();
    this.messageListeners.clear();
    this.connectionListeners.clear();
    
    if (this.socket) {
      try { this.socket.disconnect(); } catch {}
      this.socket = null;
    }
  }

  // Verificar si un usuario está en línea
  isUserOnline(userId) {
    // Simular estado en línea basado en actividad reciente
    return Math.random() > 0.3; // 70% de probabilidad de estar en línea
  }

  // Marcar conversación como leída
  async markAsRead(conversationId) {
    if (this.conversations.has(conversationId)) {
      const conversation = this.conversations.get(conversationId);
      conversation.unreadCount = 0;
      await this.storeConversation(conversation);
    }
  }
}

export const messagingService = new MessagingService();
