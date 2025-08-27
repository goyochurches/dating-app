import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, fetchSignInMethodsForEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from './firebase';
import { likeService } from './likeService';

// Servicio de autenticación 
export class AuthService {
  constructor() {
    this.currentUser = null;
    this.authStateChangeCallbacks = [];

    // Listener para el estado de autenticación
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Usuario está logueado, obtener sus datos de Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          this.currentUser = { uid: user.uid, ...userDoc.data() };
        } else {
          // Perfil no encontrado, podría ser un estado inconsistente
          this.currentUser = { uid: user.uid, email: user.email };
        }
      } else {
        // Usuario no está logueado
        this.currentUser = null;
      }
      this.notifyAuthStateChangeCallbacks();
    });
  }

  // Notificar a los callbacks sobre cambios en el estado de autenticación
  notifyAuthStateChangeCallbacks() {
    this.authStateChangeCallbacks.forEach((callback) => {
      callback(this.currentUser);
    });
  }

  // Suscribirse a cambios en el estado de autenticación
  subscribeToAuthChanges(callback) {
    this.authStateChangeCallbacks.push(callback);
    return () => {
      const index = this.authStateChangeCallbacks.indexOf(callback);
      if (index !== -1) {
        this.authStateChangeCallbacks.splice(index, 1);
      }
    };
  }

  // Login del usuario
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Obtener perfil de Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        this.currentUser = { uid: user.uid, ...userDoc.data() };
        return { success: true, user: this.currentUser };
      } else {
        return { success: false, message: 'No se encontró el perfil de usuario.' };
      }
    } catch (error) {
      return { success: false, message: 'Email o contraseña incorrectos.' };
    }
  }

  // Registro de nuevo usuario
  async register(userData) {
    const { email, password, ...profileData } = userData;

    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Preparar datos del perfil para Firestore
      const userProfile = {
        email: user.email,
        ...profileData,
        // Asegurar compatibilidad: si hay profileImage, también guardarlo como profilePictureUrl
        profilePictureUrl: profileData.profileImage || profileData.profilePictureUrl || null,
        createdAt: new Date().toISOString(),
      };

      // Guardar perfil en Firestore
      await setDoc(doc(db, 'users', user.uid), userProfile);
      
      this.currentUser = { uid: user.uid, ...userProfile };

      return {
        success: true,
        user: this.currentUser,
        message: '¡Cuenta creada exitosamente!',
      };
    } catch (error) {
      // Manejar errores comunes de Firebase
      if (error.code === 'auth/email-already-in-use') {
        return { success: false, message: 'El correo electrónico ya está en uso.' };
      }
      if (error.code === 'auth/weak-password') {
        return { success: false, message: 'La contraseña es demasiado débil.' };
      }
      return { success: false, message: 'Ocurrió un error durante el registro.' };
    }
  }

  // Verificar si un email ya existe
  async checkEmailExists(email) {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return { exists: methods.length > 0 };
    } catch (error) {
      console.error("Error checking email existence:", error);
      return { exists: false };
    }
  }

  // Logout
  async logout() {
    try {
      await signOut(auth);
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Error al cerrar sesión.' };
    }
  }

  // Obtener usuario actual
  getCurrentUser() {
    return this.currentUser;
  }

  // Verificar si está logueado
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Obtener todos los usuarios de Firestore con los que no se ha interactuado
  async getAvailableUsers() {
    if (!this.currentUser) return [];

    try {
      // 1. Obtener los IDs de los usuarios con los que ya se ha interactuado
      const interactedIds = await likeService.getInteractedUserIds();
      
      // 2. Añadir el ID del usuario actual para excluirlo también
      const excludedIds = [...interactedIds, this.currentUser.uid];

      // 3. Obtener todos los usuarios de la colección
      const usersCollection = collection(db, 'users');
      const querySnapshot = await getDocs(usersCollection);
      
      const availableUsers = [];
      querySnapshot.forEach((doc) => {
        // 4. Filtrar para que solo queden los que no están en la lista de excluidos
        if (!excludedIds.includes(doc.id)) {
          availableUsers.push({ uid: doc.id, ...doc.data() });
        }
      });

      return availableUsers;
    } catch (error) {
      console.error("Error fetching available users: ", error);
      return [];
    }
  }

}

// Export the class
export default AuthService;
