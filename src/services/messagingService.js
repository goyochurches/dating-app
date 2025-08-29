import { db } from './firebase';
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs, getDoc, query, where, orderBy, onSnapshot, serverTimestamp, writeBatch, setDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

class MessagingService {
  constructor() {
    this.currentUser = null;
    this.conversationsUnsubscribe = null;
    this.messageListeners = {};
    this.presenceListeners = {};
    this.processedMessages = new Set();
    this.activeChats = new Set(); // Chats que están siendo vistos actualmente
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
        conversations.push({ 
          id: doc.id, 
          ...data,
          partnerUid,
          partnerName: data.participantDetails[partnerUid]?.name,
          partnerAvatar: data.participantDetails[partnerUid]?.avatar,
          partnerIsOnline: isPartnerOnline,
        });
      });
      callback(conversations);
    });
  }

  async sendMessage(conversationId, message) {
    if (!this.currentUser?.uid) throw new Error('User not authenticated');

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const conversationRef = doc(db, 'conversations', conversationId);

    // Verificar si el otro usuario está viendo la conversación
    const isOtherUserViewing = await this.isOtherUserViewingChat(conversationId);
    const isCurrentUserViewing = this.activeChats.has(conversationId);
    
    // Si ambos están viendo el chat, enviar directamente como leído (checks amarillos)
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
      console.log('Message sent as read (yellow checks) - both users viewing');
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
    console.log(`Verificando estado de ${userId}`);
    return true; // Asumimos que el usuario está online para la demo
  }

  listenForMessages(conversationId, callback) {
    if (this.messageListeners[conversationId]) {
      this.messageListeners[conversationId](); // Unsubscribe from previous listener
    }

    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Procesar entrega automática para mensajes en estado 0
      messages.forEach(async (message) => {
        if (message.status === 0 && !this.processedMessages.has(message.id)) {
          this.processedMessages.add(message.id);
          
          console.log('Auto-delivering message:', message.id);
          
          // Cambiar a estado 1 (entregado) después de 1 segundo
          setTimeout(async () => {
            await this.updateMessageStatus(conversationId, message.id, 1);
            console.log('Message delivered (status 1 - double white check):', message.id);
          }, 1000);
        }
      });
      
      callback(messages);
    });

    this.messageListeners[conversationId] = unsubscribe;
    
    // Escuchar cambios de presencia para auto-marcar como leído
    this.listenForPresenceChanges(conversationId);
  }

  stopListeningForMessages(conversationId) {
    if (this.messageListeners[conversationId]) {
      this.messageListeners[conversationId]();
      delete this.messageListeners[conversationId];
    }
    
    // También limpiar el listener de presencia para esta conversación
    if (this.presenceListeners && this.presenceListeners[conversationId]) {
      this.presenceListeners[conversationId]();
      delete this.presenceListeners[conversationId];
    }
  }

  async updateTypingStatus(conversationId, isTyping) {
    if (!this.currentUser?.uid) return;

    const conversationRef = doc(db, 'conversations', conversationId);
    const updates = {};
    updates[`typing.${this.currentUser.uid}`] = isTyping;

    await updateDoc(conversationRef, updates);
  }

  async updateMessageStatus(conversationId, messageId, status) {
    try {
      const messageRef = doc(db, 'conversations', conversationId, 'messages', messageId);
      await updateDoc(messageRef, { 
        status,
        updatedAt: serverTimestamp()
      });
      console.log(`Message ${messageId} status updated to: ${status}`);
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }

  async markMessagesAsRead(conversationId) {
    if (!this.currentUser?.uid) return;

    try {
      const messagesRef = collection(db, 'conversations', conversationId, 'messages');
      
      // Buscar TODOS los mensajes en estado 1 (entregado)
      const deliveredMessagesQuery = query(
        messagesRef,
        where('status', '==', 1)
      );
      
      const deliveredSnapshot = await getDocs(deliveredMessagesQuery);
      
      if (!deliveredSnapshot.empty) {
        for (const docSnap of deliveredSnapshot.docs) {
          const messageData = docSnap.data();
          
          // Marcar como leído TODOS los mensajes del otro usuario
          // (No importa si ambos están viendo o no - cuando entro al chat, leo los mensajes)
          if (messageData.user._id !== this.currentUser.uid) {
            await updateDoc(docSnap.ref, { 
              status: 2, // 2 = Leído (checks amarillos)
              readAt: serverTimestamp(),
              readBy: this.currentUser.uid
            });
            console.log('Message marked as read (yellow checks):', docSnap.id);
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
        console.log('User is now viewing chat:', conversationId);
        
        // Actualizar presencia en Firebase
        const presenceRef = doc(db, 'presence', conversationId);
        await setDoc(presenceRef, {
          [`${this.currentUser.uid}_viewing`]: true,
          [`${this.currentUser.uid}_lastSeen`]: serverTimestamp()
        }, { merge: true });
        
        // Marcar mensajes como leídos automáticamente al entrar al chat
        setTimeout(() => {
          this.markMessagesAsRead(conversationId);
        }, 1000);
        
      } else {
        this.activeChats.delete(conversationId);
        console.log('User stopped viewing chat:', conversationId);
        
        // Actualizar presencia
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
      
      // Verificar si el otro usuario está actualmente viendo el chat
      return presenceData[`${otherUserId}_viewing`] === true;
    } catch (error) {
      console.error('Error checking if other user is viewing chat:', error);
      return false;
    }
  }

  listenForPresenceChanges(conversationId) {
    const presenceRef = doc(db, 'presence', conversationId);
    
    // Escuchar cambios de presencia en tiempo real
    const unsubscribe = onSnapshot(presenceRef, async (snapshot) => {
      if (!snapshot.exists()) return;
      
      const presenceData = snapshot.data();
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationSnap = await getDoc(conversationRef);
      
      if (!conversationSnap.exists()) return;
      
      const otherUserId = conversationSnap.data().participants.find(p => p !== this.currentUser.uid);
      const isOtherUserViewing = presenceData[`${otherUserId}_viewing`] === true;
      
      // Si el otro usuario está viendo el chat, sus mensajes se marcan como leídos
      if (isOtherUserViewing) {
        console.log('Other user viewing chat, marking their messages as read');
        setTimeout(() => {
          this.markMessagesAsRead(conversationId);
        }, 500);
      }
    });
    
    // Guardar el unsubscribe para limpieza
    this.presenceListeners[conversationId] = unsubscribe;
  }

  disconnect() {
    if (this.conversationsUnsubscribe) {
      this.conversationsUnsubscribe();
      this.conversationsUnsubscribe = null;
    }
    Object.values(this.messageListeners).forEach(unsubscribe => unsubscribe());
    Object.keys(this.messageListeners).forEach(key => delete this.messageListeners[key]);
    
    // Limpiar listeners de presencia
    if (this.presenceListeners) {
      Object.values(this.presenceListeners).forEach(unsubscribe => unsubscribe());
      Object.keys(this.presenceListeners).forEach(key => delete this.presenceListeners[key]);
    }
  }
}

export const messagingService = new MessagingService();