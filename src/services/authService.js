import AsyncStorage from '@react-native-async-storage/async-storage';

// Servicio de autenticación con datos mockeados
export class AuthService {
  constructor() {
    // Control de primera vez - cargar desde AsyncStorage
    this.firstTimeUsers = new Set();
    this.initializeWelcomeData();
    
    // Usuarios mockeados para pruebas
    this.mockUsers = [
      {
        id: 1,
        email: 'ana@ejemplo.com',
        password: '123456',
        name: 'Ana García',
        age: 25,
        bio: 'Amante de los viajes y la fotografía',
        image: 'https://randomuser.me/api/portraits/women/1.jpg'
      },
      {
        id: 2,
        email: 'carlos@ejemplo.com',
        password: '123456',
        name: 'Carlos López',
        age: 28,
        bio: 'Desarrollador y músico en tiempo libre',
        image: 'https://randomuser.me/api/portraits/men/1.jpg'
      },
      {
        id: 3,
        email: 'maria@ejemplo.com',
        password: '123456',
        name: 'María Rodríguez',
        age: 24,
        bio: 'Diseñadora gráfica y amante del arte',
        image: 'https://randomuser.me/api/portraits/women/2.jpg'
      }
    ];
    
    // Usuario actualmente logueado
    this.currentUser = null;
    this.initializeSession();
  }

  // Simular delay de red
  async delay(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Login del usuario
  async login(email, password) {
    await this.delay(1500); // Simular llamada a API
    
    const user = this.mockUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    
    if (user) {
      this.currentUser = { ...user };
      delete this.currentUser.password; // No devolver la contraseña
      await this.saveSession(); // Guardar sesión
      return {
        success: true,
        user: this.currentUser,
        message: '¡Bienvenido de vuelta!'
      };
    }
    
    return {
      success: false,
      message: 'Email o contraseña incorrectos'
    };
  }

  // Registro de nuevo usuario
  async register(userData) {
    await this.delay(2000); // Simular llamada a API
    
    const { 
      email, 
      password, 
      name, 
      age, 
      gender, 
      lookingFor, 
      profileImage,
      preferredAgeRange,
      location,
      relationshipTypes,
      ethnicity,
      religion
    } = userData;
    
    // Verificar si el usuario ya existe en mockUsers o registrados
    const existingInMock = this.mockUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    const registeredUsers = await this.loadRegisteredUsers();
    const existingInRegistered = registeredUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingInMock || existingInRegistered) {
      return {
        success: false,
        message: 'Ya existe una cuenta con este email'
      };
    }

    // Verificar si ya existe en usuarios registrados (prevenir doble registro)
    const registeredUsersCheck = await this.loadRegisteredUsers();
    const alreadyRegistered = registeredUsersCheck.find(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (alreadyRegistered) {
      console.log('AuthService - Usuario ya registrado previamente, devolviendo usuario existente');
      this.currentUser = alreadyRegistered;
      await this.saveSession();
      return {
        success: true,
        user: this.currentUser,
        message: '¡Cuenta creada exitosamente!'
      };
    }

    // Crear nuevo usuario con todos los datos del registro
    const allUsers = await this.getAllUsers();
    const newUser = {
      id: Date.now(), // Usar timestamp para evitar conflictos de ID
      email: email.toLowerCase(),
      password,
      name,
      age: parseInt(age),
      gender,
      lookingFor,
      bio: 'Nuevo en LoveConnect',
      image: profileImage || `https://randomuser.me/api/portraits/${gender === 'mujer' ? 'women' : 'men'}/${Math.floor(Math.random() * 50)}.jpg`,
      preferredAgeRange,
      location,
      relationshipTypes,
      ethnicity,
      religion,
      registeredAt: new Date().toISOString()
    };

    // NO agregar a mockUsers, solo guardar en AsyncStorage
    this.currentUser = newUser;
    await this.saveSession();

    console.log('AuthService - Usuario registrado y guardado en AsyncStorage:', this.currentUser);

    return {
      success: true,
      user: this.currentUser,
      message: '¡Cuenta creada exitosamente!'
    };
  }

  // Verificar si un email ya existe
  async checkEmailExists(email) {
    await this.delay(500);
    
    const existsInMock = this.mockUsers.some(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    const registeredUsers = await this.loadRegisteredUsers();
    const existsInRegistered = registeredUsers.some(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    return { exists: existsInMock || existsInRegistered };
  }

  // Logout
  async logout() {
    this.currentUser = null;
    await this.clearSession(); // Limpiar sesión guardada
    return { success: true, message: 'Sesión cerrada correctamente' };
  }

  // Obtener usuario actual
  getCurrentUser() {
    return this.currentUser;
  }

  // Verificar si está logueado
  isLoggedIn() {
    return this.currentUser !== null;
  }

  // Verificar si es la primera vez del usuario
  isFirstTime(userId) {
    return !this.firstTimeUsers.has(userId);
  }

  // Inicializar datos de bienvenida desde AsyncStorage
  async initializeWelcomeData() {
    try {
      const data = await this.loadWelcomeData();
      this.firstTimeUsers = new Set(data);
    } catch (error) {
      console.error('Error initializing welcome data:', error);
    }
  }

  // Cargar datos de bienvenida desde AsyncStorage
  async loadWelcomeData() {
    try {
      const stored = await AsyncStorage.getItem('loveconnect_welcome_seen');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading welcome data:', error);
      return [];
    }
  }

  // Guardar datos de bienvenida en AsyncStorage
  async saveWelcomeData() {
    try {
      const data = Array.from(this.firstTimeUsers);
      await AsyncStorage.setItem('loveconnect_welcome_seen', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving welcome data:', error);
    }
  }

  // Guardar sesión en AsyncStorage
  async saveSession() {
    try {
      if (this.currentUser) {
        await AsyncStorage.setItem('loveconnect_session', JSON.stringify(this.currentUser));
        // También guardar en la lista de usuarios registrados
        const registeredUsers = await this.loadRegisteredUsers();
        const existingIndex = registeredUsers.findIndex(u => u.id === this.currentUser.id);
        if (existingIndex >= 0) {
          registeredUsers[existingIndex] = this.currentUser;
        } else {
          registeredUsers.push(this.currentUser);
        }
        await AsyncStorage.setItem('loveconnect_registered_users', JSON.stringify(registeredUsers));
        console.log('Session and user data saved permanently to AsyncStorage');
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  // Cargar usuarios registrados desde AsyncStorage
  async loadRegisteredUsers() {
    try {
      const stored = await AsyncStorage.getItem('loveconnect_registered_users');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading registered users:', error);
      return [];
    }
  }

  // Inicializar sesión desde AsyncStorage
  async initializeSession() {
    try {
      this.currentUser = await this.loadSession();
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }

  // Cargar sesión desde AsyncStorage
  async loadSession() {
    try {
      const stored = await AsyncStorage.getItem('loveconnect_session');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }

  // Limpiar sesión guardada
  async clearSession() {
    try {
      await AsyncStorage.removeItem('loveconnect_session');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  // Marcar que el usuario ya vio la bienvenida
  async markWelcomeSeen(userId) {
    this.firstTimeUsers.add(userId);
    await this.saveWelcomeData(); // Guardar permanentemente
  }

  // Limpiar todos los usuarios registrados excepto los de ejemplo
  async clearRegisteredUsers() {
    try {
      await AsyncStorage.removeItem('loveconnect_registered_users');
      await AsyncStorage.removeItem('loveconnect_session');
      await AsyncStorage.removeItem('loveconnect_welcome_seen');
      console.log('All registered users cleared, only example users remain');
    } catch (error) {
      console.error('Error clearing registered users:', error);
    }
  }

  // Obtener todos los usuarios registrados (mock + registrados)
  async getAllUsers() {
    const registeredUsers = await this.loadRegisteredUsers();
    const allUsers = [...this.mockUsers, ...registeredUsers];
    
    // Eliminar duplicados por email y remover contraseñas
    const uniqueUsers = allUsers.reduce((acc, user) => {
      const existing = acc.find(u => u.email === user.email);
      if (!existing) {
        const userCopy = { ...user };
        delete userCopy.password;
        acc.push(userCopy);
      }
      return acc;
    }, []);
    
    return uniqueUsers;
  }
}

// Instancia singleton
export const authService = new AuthService();
