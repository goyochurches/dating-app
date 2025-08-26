import AsyncStorage from '@react-native-async-storage/async-storage';

class LikeService {
  constructor() {
    this.userLikes = new Map(); // userId -> Set of liked profile IDs
    this.profileLikes = new Map(); // profileId -> Set of user IDs who liked them
  }

  // Inicializar el servicio cargando likes guardados
  async initialize(userId) {
    this.currentUserId = userId;
    await this.loadUserLikes(userId);
    await this.loadProfileLikes();
  }

  // Dar like a un perfil
  async likeProfile(profileId) {
    if (!this.currentUserId) {
      throw new Error('Usuario no inicializado');
    }

    // Agregar like del usuario actual
    if (!this.userLikes.has(this.currentUserId)) {
      this.userLikes.set(this.currentUserId, new Set());
    }
    this.userLikes.get(this.currentUserId).add(profileId);

    // Guardar likes del usuario
    await this.saveUserLikes(this.currentUserId);

    // Simular que algunos perfiles ya nos han dado like (para testing)
    await this.simulateProfileLikes(profileId);

    // Verificar si hay match mutuo
    const isMatch = this.checkMutualMatch(this.currentUserId, profileId);
    
    return {
      liked: true,
      isMatch: isMatch,
      profileId: profileId
    };
  }

  // Verificar si hay match mutuo
  checkMutualMatch(userId, profileId) {
    // El usuario le dio like al perfil
    const userLikedProfile = this.userLikes.get(userId)?.has(profileId) || false;
    
    // El perfil le dio like al usuario
    const profileLikedUser = this.profileLikes.get(profileId)?.has(userId) || false;
    
    return userLikedProfile && profileLikedUser;
  }

  // Simular likes de otros perfiles hacia nosotros (para testing)
  async simulateProfileLikes(profileId) {
    // Simular que algunos perfiles nos han dado like con cierta probabilidad
    const likeChance = Math.random();
    
    // 30% de probabilidad de que el perfil ya nos haya dado like
    if (likeChance < 0.3) {
      if (!this.profileLikes.has(profileId)) {
        this.profileLikes.set(profileId, new Set());
      }
      this.profileLikes.get(profileId).add(this.currentUserId);
      await this.saveProfileLikes();
    }
  }

  // Verificar si ya hemos dado like a un perfil
  hasLikedProfile(profileId) {
    return this.userLikes.get(this.currentUserId)?.has(profileId) || false;
  }

  // Verificar si un perfil nos ha dado like
  profileHasLikedUs(profileId) {
    return this.profileLikes.get(profileId)?.has(this.currentUserId) || false;
  }

  // Obtener todos los matches del usuario
  getUserMatches() {
    if (!this.currentUserId) return [];
    
    const matches = [];
    const userLikes = this.userLikes.get(this.currentUserId) || new Set();
    
    for (const profileId of userLikes) {
      if (this.checkMutualMatch(this.currentUserId, profileId)) {
        matches.push(profileId);
      }
    }
    
    return matches;
  }

  // Cargar likes del usuario desde AsyncStorage
  async loadUserLikes(userId) {
    try {
      const stored = await AsyncStorage.getItem(`user_likes_${userId}`);
      if (stored) {
        const likesArray = JSON.parse(stored);
        this.userLikes.set(userId, new Set(likesArray));
      }
    } catch (error) {
      console.error('Error loading user likes:', error);
    }
  }

  // Guardar likes del usuario en AsyncStorage
  async saveUserLikes(userId) {
    try {
      const likes = this.userLikes.get(userId);
      if (likes) {
        const likesArray = Array.from(likes);
        await AsyncStorage.setItem(`user_likes_${userId}`, JSON.stringify(likesArray));
      }
    } catch (error) {
      console.error('Error saving user likes:', error);
    }
  }

  // Cargar likes de perfiles desde AsyncStorage
  async loadProfileLikes() {
    try {
      const stored = await AsyncStorage.getItem('profile_likes');
      if (stored) {
        const profileLikesData = JSON.parse(stored);
        this.profileLikes = new Map();
        
        for (const [profileId, userIds] of Object.entries(profileLikesData)) {
          this.profileLikes.set(parseInt(profileId), new Set(userIds));
        }
      }
    } catch (error) {
      console.error('Error loading profile likes:', error);
    }
  }

  // Guardar likes de perfiles en AsyncStorage
  async saveProfileLikes() {
    try {
      const profileLikesData = {};
      for (const [profileId, userIds] of this.profileLikes.entries()) {
        profileLikesData[profileId] = Array.from(userIds);
      }
      await AsyncStorage.setItem('profile_likes', JSON.stringify(profileLikesData));
    } catch (error) {
      console.error('Error saving profile likes:', error);
    }
  }

  // Limpiar datos (para testing)
  async clearAllLikes() {
    try {
      this.userLikes.clear();
      this.profileLikes.clear();
      
      if (this.currentUserId) {
        await AsyncStorage.removeItem(`user_likes_${this.currentUserId}`);
      }
      await AsyncStorage.removeItem('profile_likes');
    } catch (error) {
      console.error('Error clearing likes:', error);
    }
  }
}

export const likeService = new LikeService();
