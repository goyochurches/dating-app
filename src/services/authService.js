// Servicio de autenticación con datos mockeados
export class AuthService {
  constructor() {
    // Control de primera vez - cargar desde localStorage
    this.firstTimeUsers = new Set(this.loadWelcomeData());
    
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
    this.currentUser = this.loadSession();
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
      this.saveSession(); // Guardar sesión
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
    
    // Verificar si el usuario ya existe
    const existingUser = this.mockUsers.find(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingUser) {
      return {
        success: false,
        message: 'Ya existe una cuenta con este email'
      };
    }

    // Crear nuevo usuario con todos los datos del registro
    const newUser = {
      id: this.mockUsers.length + 1,
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
      religion
    };

    this.mockUsers.push(newUser);
    this.currentUser = { ...newUser };
    delete this.currentUser.password;
    this.saveSession(); // Guardar sesión permanentemente
    
    console.log('AuthService - Usuario registrado y guardado en localStorage:', this.currentUser);

    return {
      success: true,
      user: this.currentUser,
      message: '¡Cuenta creada exitosamente!'
    };
  }

  // Verificar si un email ya existe
  async checkEmailExists(email) {
    await this.delay(500);
    
    const exists = this.mockUsers.some(u => 
      u.email.toLowerCase() === email.toLowerCase()
    );
    
    return { exists };
  }

  // Logout
  logout() {
    this.currentUser = null;
    this.clearSession(); // Limpiar sesión guardada
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

  // Cargar datos de bienvenida desde localStorage
  loadWelcomeData() {
    try {
      const stored = localStorage.getItem('loveconnect_welcome_seen');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading welcome data:', error);
      return [];
    }
  }

  // Guardar datos de bienvenida en localStorage
  saveWelcomeData() {
    try {
      const data = Array.from(this.firstTimeUsers);
      localStorage.setItem('loveconnect_welcome_seen', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving welcome data:', error);
    }
  }

  // Guardar sesión en localStorage
  saveSession() {
    try {
      if (this.currentUser) {
        localStorage.setItem('loveconnect_session', JSON.stringify(this.currentUser));
        // También guardar en la lista de usuarios registrados
        const registeredUsers = this.loadRegisteredUsers();
        const existingIndex = registeredUsers.findIndex(u => u.id === this.currentUser.id);
        if (existingIndex >= 0) {
          registeredUsers[existingIndex] = this.currentUser;
        } else {
          registeredUsers.push(this.currentUser);
        }
        localStorage.setItem('loveconnect_registered_users', JSON.stringify(registeredUsers));
        console.log('Session and user data saved permanently to localStorage');
      }
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }

  // Cargar usuarios registrados desde localStorage
  loadRegisteredUsers() {
    try {
      const stored = localStorage.getItem('loveconnect_registered_users');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading registered users:', error);
      return [];
    }
  }

  // Cargar sesión desde localStorage
  loadSession() {
    try {
      const stored = localStorage.getItem('loveconnect_session');
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading session:', error);
      return null;
    }
  }

  // Limpiar sesión guardada
  clearSession() {
    try {
      localStorage.removeItem('loveconnect_session');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  }

  // Marcar que el usuario ya vio la bienvenida
  markWelcomeSeen(userId) {
    this.firstTimeUsers.add(userId);
    this.saveWelcomeData(); // Guardar permanentemente
  }
}

// Instancia singleton
export const authService = new AuthService();
