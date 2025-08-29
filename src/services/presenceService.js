import { doc, setDoc, updateDoc, onSnapshot, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export class PresenceService {
  constructor() {
    this.currentUser = null;
    this.presenceRef = null;
    this.unsubscribePresence = null;
    this.heartbeatInterval = null;
  }

  // Inicializar el servicio de presencia para un usuario
  async initializePresence(userId) {
    this.currentUser = userId;
    this.presenceRef = doc(db, 'presence', userId);
    
    try {
      // Establecer el usuario como online
      await setDoc(this.presenceRef, {
        isOnline: true,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Configurar heartbeat cada 30 segundos
      this.startHeartbeat();

      // Configurar listener para detectar desconexión
      this.setupDisconnectListener();
      
      return { success: true };
    } catch (error) {
      console.error('Error inicializando presencia:', error);
      return { success: false, error };
    }
  }

  // Iniciar heartbeat para mantener el estado online
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      if (this.presenceRef && this.currentUser) {
        try {
          await updateDoc(this.presenceRef, {
            lastSeen: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        } catch (error) {
          console.error('Error actualizando heartbeat:', error);
        }
      }
    }, 30000); // 30 segundos
  }

  // Configurar listener para detectar cuando la app se cierra
  setupDisconnectListener() {
    // Listener para cuando la página se está cerrando
    window.addEventListener('beforeunload', () => {
      this.setOffline();
    });

    // Listener para cuando la app pierde el foco (opcional)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.setOffline();
      } else {
        this.setOnline();
      }
    });
  }

  // Establecer usuario como online
  async setOnline() {
    if (!this.presenceRef) return;
    
    try {
      await updateDoc(this.presenceRef, {
        isOnline: true,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error estableciendo online:', error);
    }
  }

  // Establecer usuario como offline
  async setOffline() {
    if (!this.presenceRef) return;
    
    try {
      await updateDoc(this.presenceRef, {
        isOnline: false,
        lastSeen: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error estableciendo offline:', error);
    }
  }

  // Obtener el estado de presencia de un usuario específico
  async getUserPresence(userId) {
    try {
      const presenceDoc = await getDoc(doc(db, 'presence', userId));
      if (presenceDoc.exists()) {
        const data = presenceDoc.data();
        const now = Date.now();
        const lastSeen = data.lastSeen?.toDate?.()?.getTime() || 0;
        const isRecentlyActive = (now - lastSeen) < 2 * 60 * 1000; // 2 minutos
        
        return {
          isOnline: data.isOnline && isRecentlyActive,
          lastSeen: data.lastSeen?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null
        };
      }
      return { isOnline: false, lastSeen: null, updatedAt: null };
    } catch (error) {
      console.error('Error obteniendo presencia del usuario:', error);
      return { isOnline: false, lastSeen: null, updatedAt: null };
    }
  }

  // Suscribirse a cambios en el estado de presencia de un usuario
  subscribeToUserPresence(userId, callback) {
    const userPresenceRef = doc(db, 'presence', userId);
    
    return onSnapshot(userPresenceRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const now = Date.now();
        const lastSeen = data.lastSeen?.toDate?.()?.getTime() || 0;
        const isRecentlyActive = (now - lastSeen) < 2 * 60 * 1000; // 2 minutos
        
        callback({
          isOnline: data.isOnline && isRecentlyActive,
          lastSeen: data.lastSeen?.toDate?.() || null,
          updatedAt: data.updatedAt?.toDate?.() || null
        });
      } else {
        callback({ isOnline: false, lastSeen: null, updatedAt: null });
      }
    });
  }

  // Suscribirse a cambios de presencia de múltiples usuarios
  subscribeToMultipleUsersPresence(userIds, callback) {
    const unsubscribers = [];
    const presenceStates = {};

    userIds.forEach(userId => {
      const unsubscribe = this.subscribeToUserPresence(userId, (presence) => {
        presenceStates[userId] = presence;
        callback(presenceStates);
      });
      unsubscribers.push(unsubscribe);
    });

    // Devolver función para cancelar todas las suscripciones
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }

  // Limpiar recursos y establecer usuario como offline
  async cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.unsubscribePresence) {
      this.unsubscribePresence();
      this.unsubscribePresence = null;
    }

    // Establecer como offline antes de limpiar
    await this.setOffline();

    this.currentUser = null;
    this.presenceRef = null;
  }

  // Obtener tiempo formateado desde la última vez visto
  getLastSeenText(lastSeen) {
    if (!lastSeen) return 'Nunca conectado';
    
    const now = Date.now();
    const lastSeenTime = lastSeen.getTime();
    const diffInMinutes = Math.floor((now - lastSeenTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Hace un momento';
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} min`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;
    
    return lastSeen.toLocaleDateString();
  }
}

export const presenceService = new PresenceService();