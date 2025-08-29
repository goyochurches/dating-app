import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, getDocs, getDoc, query, where, orderBy, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

class MessagingService {
  constructor() {
    this.currentUser = null;
    this.conversationsUnsubscribe = null;
    this.messageListeners = {};
    this.processedMessages = new Set();
    this.activeChats = new Set();
  }

  initialize(user) {
    this.currentUser = user;
  }

  listenForConversations(callback) {
    if (this.conversationsUnsubscribe) {
      this.conversationsUnsubscribe();
    }
    if (!this.currentUser?.uid) return;

    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('participants', 'array-contains', this.currentUser.uid));

    this.conversationsUnsubscribe = onSnapshot(q, (snapshot) => {
      const conversations = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const partnerUid = data.participants.find(p => p !== this.currentUser.uid);
        const isPartnerOnline = this.isUserOnline(partnerUid);
        // Verificar si el partner está escribiendo
        const typingData = data.typing || {};
        console.log('🔍 Raw typing data for conversation', doc.id, ':', typingData);
        const isPartnerTyping = typingData[partnerUid] === true;
        console.log('🔍 Partner', partnerUid, 'is typing:', isPartnerTyping);
        
        conversations.push({ 
          id: doc.id, 
          ...data,
          partnerUid,
          partnerName: data.participantDetails[partnerUid]?.name,
          partnerAvatar: data.participantDetails[partnerUid]?.avatar,
          partnerIsOnline: isPartnerOnline,
          typing: typingData
        });
      });
      callback(conversations);
    });
  }

  async sendMessage(conversationId, message) {
    if (!this.currentUser?.uid) throw new Error('User not authenticated');

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const conversationRef = doc(db, 'conversations', conversationId);

    // Verificar si ambos usuarios están viendo la conversación
    const isOtherUserViewing = await this.isOtherUserViewingChat(conversationId);
    const isCurrentUserViewing = this.activeChats.has(conversationId);
    
    // Si ambos están viendo el chat, enviar directamente como leído (checks rojos)
    const initialStatus = (isOtherUserViewing && isCurrentUserViewing) ? 2 : 0;
    
    const messageData = {
      _id: uuidv4(),
      text: message.text || '',
      media: message.media || null,
      mediaType: message.mediaType || null,
      createdAt: serverTimestamp(),
      status: initialStatus, // 0 = Enviado, 2 = Leído directamente si ambos están viendo
      user: {
        _id: this.currentUser.uid,
        name: this.currentUser.name,
      },
    };

    if (initialStatus === 2) {
      messageData.readAt = serverTimestamp();
      messageData.readBy = this.currentUser.uid;
    }

    await addDoc(messagesRef, messageData);

    // Actualizar la conversación con el último mensaje
    await updateDoc(conversationRef, {
      lastMessage: message.text || 'Media',
      lastActivity: serverTimestamp(),
    });
  }

  async createConversation(partner) {
    if (!this.currentUser?.uid || !partner?.uid) throw new Error('Invalid user or partner');

    const conversationId = [this.currentUser.uid, partner.uid].sort().join('_');
    const conversationRef = doc(db, 'conversations', conversationId);
    const docSnap = await getDoc(conversationRef);

    if (!docSnap.exists()) {
      await setDoc(conversationRef, {
        participants: [this.currentUser.uid, partner.uid],
        participantDetails: {
          [this.currentUser.uid]: { name: this.currentUser.name, avatar: this.currentUser.profilePictureUrl || null },
          [partner.uid]: { name: partner.name, avatar: partner.profilePictureUrl || null },
        },
        createdAt: serverTimestamp(),
        lastMessage: '¡Has hecho match! Di hola.',
        lastActivity: serverTimestamp(),
      });
    }
    return conversationId;
  }

  isUserOnline(userId) {
    return true;
  }

  listenForMessages(conversationId, callback) {
    if (this.messageListeners[conversationId]) {
      this.messageListeners[conversationId]();
    }

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Procesar entrega automática para mensajes en estado 0
      messages.forEach(async (message) => {
        if (message.status === 0 && !this.processedMessages.has(message.id)) {
          this.processedMessages.add(message.id);
          
          // Cambiar a estado 1 (entregado) después de 1 segundo
          setTimeout(async () => {
            await this.updateMessageStatus(conversationId, message.id, 1);
          }, 1000);
        }
      });
      
      callback(messages);
    });

    this.messageListeners[conversationId] = unsubscribe;
  }

  stopListeningForMessages(conversationId) {
    if (this.messageListeners[conversationId]) {
      this.messageListeners[conversationId]();
      delete this.messageListeners[conversationId];
    }
  }

  async updateTypingStatus(conversationId, isTyping) {
    if (!this.currentUser?.uid) return;

    console.log('⌨️ Typing status update:', this.currentUser.uid, 'is typing:', isTyping);

    const conversationRef = doc(db, 'conversations', conversationId);
    const updates = {};
    updates[`typing.${this.currentUser.uid}`] = isTyping;

    await updateDoc(conversationRef, updates);
    console.log('⌨️ Typing status saved to Firebase');
  }

  async updateMessageStatus(conversationId, messageId, status) {
    try {
      const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      await updateDoc(messageRef, { 
        status,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }

  async markMessagesAsRead(conversationId) {
    if (!this.currentUser?.uid) return;

    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      const deliveredMessagesQuery = query(messagesRef, where('status', '==', 1));
      const deliveredSnapshot = await getDocs(deliveredMessagesQuery);
      
      if (!deliveredSnapshot.empty) {
        for (const docSnap of deliveredSnapshot.docs) {
          const messageData = docSnap.data();
          
          if (messageData.user._id !== this.currentUser.uid) {
            await updateDoc(docSnap.ref, { 
              status: 2,
              readAt: serverTimestamp(),
              readBy: this.currentUser.uid
            });
          }
        }
      }
      
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }

  async setUserViewingChat(conversationId, isViewing) {
    try {
      if (isViewing) {
        this.activeChats.add(conversationId);
        
        const presenceRef = doc(db, 'presence', conversationId);
        await setDoc(presenceRef, {
          [`${this.currentUser.uid}_viewing`]: true,
          [`${this.currentUser.uid}_lastSeen`]: serverTimestamp()
        }, { merge: true });
        
        // Marcar mensajes como leídos al entrar al chat
        setTimeout(() => {
          this.markMessagesAsRead(conversationId);
        }, 1000);
        
      } else {
        this.activeChats.delete(conversationId);
        
        const presenceRef = doc(db, 'presence', conversationId);
        await updateDoc(presenceRef, {
          [`${this.currentUser.uid}_viewing`]: false,
          [`${this.currentUser.uid}_lastSeen`]: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error updating viewing status:', error);
    }
  }

  isUserViewingChat(conversationId) {
    return this.activeChats.has(conversationId);
  }

  async isOtherUserViewingChat(conversationId) {
    try {
      const presenceRef = doc(db, 'presence', conversationId);
      const presenceSnap = await getDoc(presenceRef);
      
      if (!presenceSnap.exists()) {
        return false;
      }
      
      const presenceData = presenceSnap.data();
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);
      
      if (!conversationSnap.exists()) {
        return false;
      }
      
      const otherUserId = conversationSnap.data().participants.find(p => p !== this.currentUser.uid);
      
      if (!otherUserId) {
        return false;
      }
      
      return presenceData[`${otherUserId}_viewing`] === true;
    } catch (error) {
      console.error('Error checking if other user is viewing chat:', error);
      return false;
    }
  }

  disconnect() {
    if (this.conversationsUnsubscribe) {
      this.conversationsUnsubscribe();
      this.conversationsUnsubscribe = null;
    }
    Object.values(this.messageListeners).forEach(unsubscribe => unsubscribe());
    Object.keys(this.messageListeners).forEach(key => delete this.messageListeners[key]);
  }
}

export const messagingService = new MessagingService();