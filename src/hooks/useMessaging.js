import { useState, useEffect, useCallback } from 'react';
import { messagingService } from '../services/messagingService';

export const useMessaging = (currentUser) => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState({});

  useEffect(() => {
    if (!currentUser) {
      setConversations([]);
      setMessages([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    messagingService.initialize(currentUser);

    const unsubscribe = messagingService.listenForConversations((loadedConversations) => {
      const formattedConversations = loadedConversations.map(conv => ({
        ...conv,
        name: conv.partnerName,
        image: conv.partnerAvatar,
        time: conv.lastActivity ? formatTime(conv.lastActivity.toDate()) : 'Ahora',
      }));
      setConversations(formattedConversations);

      const typingUpdate = {};
      loadedConversations.forEach(conv => {
        console.log('🔍 Conversation', conv.id, 'typing data:', conv.typing);
        if (conv.typing) {
          // Verificar si algún participante que no soy yo está escribiendo
          const isPartnerTyping = Object.keys(conv.typing).some(userId => 
            userId !== currentUser.uid && conv.typing[userId] === true
          );
          if (isPartnerTyping) {
            typingUpdate[conv.id] = true;
            console.log('⌨️ Partner is typing in conversation:', conv.id);
          }
        }
      });
      console.log('⌨️ Final typing update:', typingUpdate);
      setTypingUsers(typingUpdate);

      setLoading(false);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      messagingService.disconnect();
    };
  }, [currentUser]);

  const listenForMessages = useCallback((conversationId) => {
    messagingService.listenForMessages(conversationId, (loadedMessages) => {
      setMessages(loadedMessages);
    });
    
    // Indicar que el usuario está viendo este chat
    messagingService.setUserViewingChat(conversationId, true);
  }, []);

  const stopListeningForMessages = useCallback((conversationId) => {
    messagingService.stopListeningForMessages(conversationId);
    
    // Indicar que el usuario ya no está viendo este chat
    messagingService.setUserViewingChat(conversationId, false);
    setMessages([]);
  }, []);

  const createConversation = useCallback(async (partner) => {
    if (!currentUser) return null;
    return await messagingService.createConversation(partner);
  }, [currentUser]);

  const sendMessage = useCallback(async (conversationId, messageData) => {
    if (!currentUser) return;
    await messagingService.sendMessage(conversationId, messageData);
  }, [currentUser]);

  const isUserOnline = useCallback((userId) => {
    return messagingService.isUserOnline(userId);
  }, []);

  const updateTypingStatus = useCallback(async (conversationId, isTyping) => {
    if (!currentUser) return;
    await messagingService.updateTypingStatus(conversationId, isTyping);
  }, [currentUser]);

  return {
    conversations,
    messages,
    loading,
    createConversation,
    sendMessage,
    listenForMessages,
    stopListeningForMessages,
    isUserOnline,
    typingUsers,
    updateTypingStatus,
  };
};

const formatTime = (date) => {
  if (!date) return '';
  const now = new Date();
  const diffInHours = (now - date) / (1000 * 60 * 60);

  if (diffInHours < 24 && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48 && date.getDate() === now.getDate() - 1) {
    return 'Ayer';
  } else {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
};
