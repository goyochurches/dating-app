import { useState, useEffect, useCallback } from 'react';
import { messagingService } from '../services/messagingService';

export const useMessaging = (currentUser) => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState({});
  const [isConnected, setIsConnected] = useState(!!currentUser);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Inicializar servicio de mensajería
  useEffect(() => {
    if (currentUser) {
      setIsConnected(true);
      messagingService.initialize(currentUser);
    } else {
      setIsConnected(false);
    }

    return () => {
      messagingService.disconnect();
    };
  }, [currentUser]);

  // Listener para nuevos mensajes y actualizaciones
  useEffect(() => {
    const handleNewMessage = (conversationId, data) => {
      // Manejar la actualización por lotes enviada por el servicio
      if (data && data.type === 'batch_update') {
        const newMessages = data.messages || [];
        setMessages(prev => ({
          ...prev,
          [conversationId]: newMessages
        }));

        // Actualizar la lista de conversaciones con la información del último mensaje
        const lastMessage = newMessages.length > 0 ? newMessages[newMessages.length - 1] : null;
        if (lastMessage) {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === conversationId
                ? {
                    ...conv,
                    lastMessage: lastMessage.text || 'Media',
                    time: formatTime(lastMessage.timestamp),
                    lastActivity: lastMessage.timestamp
                  }
                : conv
            )
          );
        }
      } else if (data) {
        // Fallback para mensajes individuales si fuera necesario
        setMessages(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), data]
        }));
      }
    };

    const handleConnectionChange = (connected, users = []) => {
      setIsConnected(connected);
      setOnlineUsers(users);
    };

    messagingService.addMessageListener(handleNewMessage);
    messagingService.addConnectionListener(handleConnectionChange);

    return () => {
      messagingService.removeMessageListener(handleNewMessage);
      messagingService.removeConnectionListener(handleConnectionChange);
    };
  }, []);

  // Cargar conversaciones existentes
  useEffect(() => {
    const loadConversations = async () => {
      const existingConversations = messagingService.getConversations();
      
      // Las conversaciones se cargan, pero los mensajes se llenarán a través del listener
      // para evitar race conditions y duplicados.
      const conversationsWithMessages = existingConversations.map(conv => ({
        ...conv,
        lastMessage: conv.lastMessage || 'Nueva conversación',
        time: conv.lastActivity ? formatTime(conv.lastActivity) : 'Ahora',
        online: messagingService.isUserOnline(conv.partnerId)
      }));

      setConversations(conversationsWithMessages);
    };

    if (currentUser) {
      loadConversations();
    }
  }, [currentUser]);

  // Crear nueva conversación (cuando hay match)
  const createConversation = useCallback(async (partnerId, partnerName, partnerImage) => {
    try {
      const conversationId = await messagingService.createConversation(partnerId, partnerName);
      
      const newConversation = {
        id: conversationId,
        partnerId,
        name: partnerName,
        image: partnerImage,
        lastMessage: `¡Hola ${currentUser?.name}! ¡Tenemos un match! 🎉`,
        time: 'Ahora',
        online: messagingService.isUserOnline(partnerId),
        lastSeen: new Date().toISOString()
      };

      setConversations(prev => {
        const exists = prev.find(conv => conv.id === conversationId);
        if (exists) {
          return prev;
        }
        return [newConversation, ...prev];
      });

      // Cargar mensajes iniciales
      const initialMessages = await messagingService.getConversationMessages(conversationId);
      setMessages(prev => ({
        ...prev,
        [conversationId]: initialMessages
      }));

      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }, [currentUser]);

  // Enviar mensaje
  const sendMessage = useCallback(async (conversationId, messageData) => {
    try {
      const message = await messagingService.sendMessage(conversationId, messageData);
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, []);

  // Obtener mensajes de una conversación
  const getConversationMessages = useCallback((conversationId) => {
    return messages[conversationId] || [];
  }, [messages]);

  // Marcar conversación como leída
  const markAsRead = useCallback(async (conversationId) => {
    try {
      await messagingService.markAsRead(conversationId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, []);

  // Verificar si usuario está en línea
  const isUserOnline = useCallback((userId) => {
    return messagingService.isUserOnline(userId);
  }, []);

  return {
    conversations,
    messages,
    isConnected,
    onlineUsers,
    createConversation,
    sendMessage,
    getConversationMessages,
    markAsRead,
    isUserOnline
  };
};

// Función auxiliar para formatear tiempo
const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Ahora';
  } else if (diffInHours < 24) {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } else if (diffInHours < 48) {
    return 'Ayer';
  } else {
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short' 
    });
  }
};
