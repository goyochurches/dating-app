import { db } from './firebase';
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

class MessagingService {
  constructor() {
    this.currentUser = null;
    this.conversationsUnsubscribe = null;
    this.messageListeners = {};
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

    const messageData = {
      _id: uuidv4(),
      text: message.text || '',
      media: message.media || null,
      mediaType: message.mediaType || null,
      createdAt: serverTimestamp(),
      user: {
        _id: this.currentUser.uid,
        name: this.currentUser.name,
      },
    };

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
    // Lógica para verificar el estado de conexión de un usuario.
    // Esto es una simulación y debería ser reemplazado por una solución real
    // utilizando Firebase Realtime Database o Firestore.
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

    const conversationRef = doc(db, 'conversations', conversationId);
    const updates = {};
    updates[`typing.${this.currentUser.uid}`] = isTyping;

    await updateDoc(conversationRef, updates);
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
