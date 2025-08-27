import { db } from './firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';

class LikeService {
  constructor() {
    this.currentUserId = null;
  }

  // Inicializar el servicio con el ID del usuario actual
  initialize(userId) {
    this.currentUserId = userId;
  }

  // Dar like a un usuario
  async likeUser(likedUserId) {
    if (!this.currentUserId) {
      throw new Error('Usuario no inicializado. Llama a initialize() primero.');
    }

    const likerId = this.currentUserId;

    // 1. Registrar el like en la colección 'likes'
    const likeDocRef = doc(db, 'likes', `${likerId}_${likedUserId}`);
    await setDoc(likeDocRef, {
      liker: likerId,
      liked: likedUserId,
      timestamp: new Date(),
    });

    // 2. Comprobar si hay un match (si el otro usuario ya nos había dado like)
    const reverseLikeDocRef = doc(db, 'likes', `${likedUserId}_${likerId}`);
    const reverseLikeDoc = await getDoc(reverseLikeDocRef);

    if (reverseLikeDoc.exists()) {
      // ¡Es un match!
      // 3. Crear el documento de match en la colección 'matches'
      const matchDocRef = doc(db, 'matches', `${likerId}_${likedUserId}`);
      await setDoc(matchDocRef, {
        users: [likerId, likedUserId],
        createdAt: new Date(),
      });
      // También se podría crear el doc simétrico `${likedUserId}_${likerId}` si se necesita buscar por ambos lados

      return true; // Hubo un match
    }

    return false; // Solo fue un like, no un match
  }

  // Dar dislike a un usuario
  async dislikeUser(dislikedUserId) {
    if (!this.currentUserId) {
      throw new Error('Usuario no inicializado. Llama a initialize() primero.');
    }

    const dislikerId = this.currentUserId;

    // Registrar el dislike en la colección 'dislikes'
    const dislikeDocRef = doc(db, 'dislikes', `${dislikerId}_${dislikedUserId}`);
    await setDoc(dislikeDocRef, {
      disliker: dislikerId,
      disliked: dislikedUserId,
      timestamp: new Date(),
    });
  }

  // Obtener todos los matches de un usuario
  async getUserMatches(userId) {
    if (!userId) return [];

    try {
      const matchesCollection = collection(db, 'matches');
      const q = query(matchesCollection, where('users', 'array-contains', userId));
      const querySnapshot = await getDocs(q);

      const matches = [];
      const userPromises = [];

      querySnapshot.forEach((matchDoc) => {
        const matchData = matchDoc.data();
        const otherUserId = matchData.users.find(id => id !== userId);
        
        if (otherUserId) {
          // Promesa para obtener los datos del otro usuario
          const userDocRef = doc(db, 'users', otherUserId);
          userPromises.push(getDoc(userDocRef));
        }
      });

      const userDocs = await Promise.all(userPromises);

      userDocs.forEach(userDoc => {
        if (userDoc.exists()) {
          matches.push({ uid: userDoc.id, ...userDoc.data() });
        }
      });

      return matches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      return [];
    }
  }

  // Obtener IDs de todos los usuarios con los que se ha interactuado
  async getInteractedUserIds() {
    if (!this.currentUserId) return [];

    try {
      const likesQuery = query(collection(db, 'likes'), where('liker', '==', this.currentUserId));
      const dislikesQuery = query(collection(db, 'dislikes'), where('disliker', '==', this.currentUserId));

      const [likesSnapshot, dislikesSnapshot] = await Promise.all([
        getDocs(likesQuery),
        getDocs(dislikesQuery),
      ]);

      const interactedIds = new Set();

      likesSnapshot.forEach(doc => {
        interactedIds.add(doc.data().liked);
      });

      dislikesSnapshot.forEach(doc => {
        interactedIds.add(doc.data().disliked);
      });

      return Array.from(interactedIds);
    } catch (error) {
      console.error('Error fetching interacted users:', error);
      return [];
    }
  }
}

export const likeService = new LikeService();
