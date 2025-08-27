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
        image: conv.participantDetails[conv.partnerId]?.avatar,
        time: conv.lastActivity ? formatTime(conv.lastActivity.toDate()) : 'Ahora',
      }));
      setConversations(formattedConversations);

      const typingUpdate = {};
      loadedConversations.forEach(conv => {
        if (conv.typing) {
          typingUpdate[conv.id] = conv.typing;
        }
      });
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
  }, []);

  const stopListeningForMessages = useCallback((conversationId) => {
    messagingService.stopListeningForMessages(conversationId);
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
