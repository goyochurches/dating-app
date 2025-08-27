import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import AuthService from '../services/authService';
const authService = new AuthService();
import RegisterForm from './RegisterForm';

export const LoginScreen = ({ onLoginSuccess }) => {
  // Verificar si hay un registro en progreso
  const checkRegistrationInProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('loveconnect_registration_progress');
      return saved !== null;
    } catch (error) {
      return false;
    }
  };

  const [isLogin, setIsLogin] = useState(true); // Inicializar como true por defecto
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    age: '',
    bio: ''
  });

  // Estados para validación
  const [errors, setErrors] = useState({});
  const [emailChecking, setEmailChecking] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Verificar estado de registro al montar el componente
  useEffect(() => {
    const checkInitialState = async () => {
      const hasRegistrationInProgress = await checkRegistrationInProgress();
      setIsLogin(!hasRegistrationInProgress);
    };
    checkInitialState();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'El nombre es requerido';
      }
      if (!formData.age) {
        newErrors.age = 'La edad es requerida';
      } else if (parseInt(formData.age) < 18 || parseInt(formData.age) > 100) {
        newErrors.age = 'La edad debe estar entre 18 y 100 años';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkEmailExists = async (email) => {
    if (!validateEmail(email)) return;
    
    setEmailChecking(true);
    try {
      const result = await authService.checkEmailExists(email);
      if (result.exists && !isLogin) {
        setErrors(prev => ({ ...prev, email: 'Este email ya está registrado' }));
      } else {
        setErrors(prev => ({ ...prev, email: '' }));
      }
    } catch (error) {
      console.error('Error checking email:', error);
    } finally {
      setEmailChecking(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Verificar email en tiempo real para registro
    if (field === 'email' && !isLogin && value.length > 0) {
      const timeoutId = setTimeout(() => checkEmailExists(value), 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setLoginError(''); // Limpiar errores previos
    
    try {
      const result = await authService.login(formData.email, formData.password);

      if (result.success) {
        // Indicar que no es un usuario nuevo
        onLoginSuccess(result.user, false);
      } else {
        setLoginError(result.message);
      }
    } catch (error) {
      setLoginError('Algo salió mal. Inténtalo de nuevo.');
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSuccess = (user) => {
    console.log('LoginScreen - handleRegisterSuccess called with user:', user);
    // Indicar que es un usuario nuevo para mostrar la bienvenida
    onLoginSuccess(user, true);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      name: '',
      age: '',
      bio: ''
    });
    setErrors({});
    setLoginError(''); // Limpiar error de login
  };

  // Si no está en modo login, mostrar el formulario de registro
  if (!isLogin) {
    return (
      <RegisterForm 
        onRegisterSuccess={handleRegisterSuccess}
        onBackToLogin={() => setIsLogin(true)}
      />
    );
  }

  const renderInput = (field, placeholder, icon, keyboardType = 'default', secureTextEntry = false) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputWrapper}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <TextInput
          style={[styles.input, errors[field] && styles.inputError]}
          placeholder={placeholder}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !showPassword}
          autoCapitalize={field === 'email' ? 'none' : 'words'}
          autoCorrect={false}
        />
        {field === 'password' && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 
              <EyeOff size={20} color="#666" /> : 
              <Eye size={20} color="#666" />
            }
          </TouchableOpacity>
        )}
        {field === 'email' && emailChecking && (
          <ActivityIndicator size="small" color="#FF5A5F" style={styles.loadingIcon} />
        )}
      </View>
      {errors[field] ? (
        <Text style={styles.errorText}>{errors[field]}</Text>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.logo}>💕 LoveConnect</Text>
          <Text style={styles.subtitle}>
            {isLogin ? '¡Bienvenido de vuelta!' : '¡Únete a nosotros!'}
          </Text>
        </View>

        <View style={styles.form}>
          {renderInput('email', 'Email', <Mail size={20} color="#666" />, 'email-address')}
          
          {renderInput('password', 'Contraseña', <Lock size={20} color="#666" />, 'default', true)}

          {!isLogin && (
            <>
              {renderInput('name', 'Nombre completo', <User size={20} color="#666" />)}
              
              {renderInput('age', 'Edad', <Calendar size={20} color="#666" />, 'numeric')}
              
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textArea, errors.bio && styles.inputError]}
                  placeholder="Cuéntanos algo sobre ti (opcional)"
                  value={formData.bio}
                  onChangeText={(value) => handleInputChange('bio', value)}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                {errors.bio && <Text style={styles.errorText}>{errors.bio}</Text>}
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </Text>
            )}
          </TouchableOpacity>

          {loginError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorMessage}>{loginError}</Text>
            </View>
          ) : null}

          <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
            <Text style={styles.toggleText}>
              {isLogin 
                ? '¿No tienes cuenta? Regístrate' 
                : '¿Ya tienes cuenta? Inicia sesión'
              }
            </Text>
          </TouchableOpacity>
        </View>

        {/* Usuarios de prueba */}
        <View style={styles.testUsers}>
          <Text style={styles.testUsersTitle}>👤 Usuarios de prueba:</Text>
          <Text style={styles.testUserText}>• ana@ejemplo.com - 123456</Text>
          <Text style={styles.testUserText}>• carlos@ejemplo.com - 123456</Text>
          <Text style={styles.testUserText}>• maria@ejemplo.com - 123456</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF5A5F',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  iconContainer: {
    padding: 15,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    paddingRight: 15,
    fontSize: 16,
    color: '#333',
  },
  inputError: {
    borderColor: '#FF5A5F',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    padding: 15,
    fontSize: 16,
    color: '#333',
    minHeight: 80,
  },
  eyeButton: {
    padding: 15,
  },
  loadingIcon: {
    marginRight: 15,
  },
  errorText: {
    color: '#FF5A5F',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 15,
  },
  submitButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#FF5A5F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 8px rgba(255,90,95,0.3)',
      },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  toggleButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  toggleText: {
    color: '#FF5A5F',
    fontSize: 16,
    fontWeight: '500',
  },
  testUsers: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  testUsersTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  testUserText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  errorContainer: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#ffebee',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffcdd2',
  },
  errorMessage: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default LoginScreen;
