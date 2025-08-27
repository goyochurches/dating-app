import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Mail, Lock, ArrowLeft, Heart, Calendar, Check } from 'lucide-react-native';
import PhotoUploadStep from './PhotoUploadStep';
import AgeRangeStep from './AgeRangeStep';
import LocationStep from './LocationStep';
import RelationshipTypeStep from './RelationshipTypeStep';
import EthnicityStep from './EthnicityStep';
import ReligionStep from './ReligionStep';
import AuthService from '../services/authService';
const authService = new AuthService();

export const RegisterForm = ({ onRegisterSuccess, onBackToLogin }) => {
  // Cargar datos guardados del AsyncStorage
  const loadRegistrationProgress = async () => {
    try {
      const saved = await AsyncStorage.getItem('loveconnect_registration_progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          step: parsed.step || 1,
          data: parsed.data || {}
        };
      }
    } catch (error) {
      console.error('Error loading registration progress:', error);
    }
    return { step: 1, data: {} };
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    lookingFor: '',
    age: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
    profileImage: null,
    preferredAgeRange: { min: 18, max: 35 },
    location: { country: '', state: '', city: '', maxDistance: 100 },
    relationshipTypes: [],
    ethnicity: '',
    religion: ''
  });

  // Cargar datos guardados al montar el componente
  useEffect(() => {
    const initializeData = async () => {
      const savedProgress = await loadRegistrationProgress();
      setCurrentStep(savedProgress.step);
      setFormData(prevData => ({
        ...prevData, // Mantener los valores por defecto
        ...savedProgress.data,
        // Asegurar que location siempre sea un objeto
        location: {
          ...(prevData.location),
          ...(savedProgress.data.location || {})
        },
        // Asegurar que preferredAgeRange siempre sea un objeto
        preferredAgeRange: {
          ...(prevData.preferredAgeRange),
          ...(savedProgress.data.preferredAgeRange || {})
        }
      }));
    };
    initializeData();
  }, []);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Guardar progreso en AsyncStorage
  const saveRegistrationProgress = async (step, data) => {
    try {
      await AsyncStorage.setItem('loveconnect_registration_progress', JSON.stringify({
        step,
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error saving registration progress:', error);
    }
  };

  // Limpiar progreso guardado
  const clearRegistrationProgress = async () => {
    try {
      await AsyncStorage.removeItem('loveconnect_registration_progress');
    } catch (error) {
      console.error('Error clearing registration progress:', error);
    }
  };

  const handleInputChange = (field, value) => {
    // Evitar que location se actualice como un campo de texto simple
    if (field === 'location') return;

    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Validar género
    if (!formData.gender) {
      newErrors.gender = 'Selecciona tu género';
    }

    // Validar preferencia
    if (!formData.lookingFor) {
      newErrors.lookingFor = 'Selecciona qué estás buscando';
    }

    // Validar edad
    if (!formData.age) {
      newErrors.age = 'La edad es requerida';
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 18 || age > 100) {
        newErrors.age = 'La edad debe estar entre 18 y 100 años';
      }
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar confirmación de email
    if (!formData.confirmEmail) {
      newErrors.confirmEmail = 'Confirma tu email';
    } else if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Los emails no coinciden';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // Validar términos
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    // Verificar que el email no esté ya registrado antes de continuar
    setLoading(true);
    try {
      const emailCheck = await authService.checkEmailExists(formData.email);
      if (emailCheck.exists) {
        setErrors(prev => ({ 
          ...prev, 
          email: 'Ya existe una cuenta con este email. ¿Quieres iniciar sesión?' 
        }));
        return;
      }
      
      // Si el email no existe, continuar al paso 2 (foto)
      setCurrentStep(2);
      saveRegistrationProgress(2, formData);
    } catch (error) {
      console.error('Error verificando email:', error);
      Alert.alert('Error', 'No se pudo verificar el email. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoStepNext = (userData) => {
    setFormData(userData);
    setCurrentStep(3);
    saveRegistrationProgress(3, userData);
  };

  const handlePhotoStepBack = () => {
    setCurrentStep(1);
    saveRegistrationProgress(1, formData);
  };

  const handleAgeRangeNext = (userData) => {
    setFormData(userData);
    setCurrentStep(4);
    saveRegistrationProgress(4, userData);
  };

  const handleAgeRangeBack = () => {
    setCurrentStep(2);
    saveRegistrationProgress(2, formData);
  };

  const handleLocationNext = (userData) => {
    setFormData(userData);
    console.log('RegisterForm - changing to step 5');
    setCurrentStep(5);
    saveRegistrationProgress(5, userData);
  };

  const handleLocationBack = () => {
    setCurrentStep(3);
    saveRegistrationProgress(3, formData);
  };

  const handleRelationshipTypeNext = (userData) => {
    setFormData(userData);
    setCurrentStep(6);
    saveRegistrationProgress(6, userData);
  };

  const handleRelationshipTypeBack = () => {
    setCurrentStep(4);
    saveRegistrationProgress(4, formData);
  };

  const handleEthnicityNext = (userData) => {
    setFormData(userData);
    setCurrentStep(7);
    saveRegistrationProgress(7, userData);
  };

  const handleEthnicityBack = () => {
    setCurrentStep(5);
    saveRegistrationProgress(5, formData);
  };

  const handleReligionNext = async (userData) => {
    console.log('RegisterForm - handleReligionNext called with:', userData);
    
    // Prevenir múltiples clics
    if (loading) {
      console.log('RegisterForm - Ya hay un registro en progreso, ignorando');
      return;
    }
    
    setLoading(true);
    try {
      console.log('RegisterForm - Iniciando registro final con datos:', userData);
      
      const result = await authService.register(userData);
      console.log('RegisterForm - Resultado del registro:', result);
      
      if (result.success) {
        console.log('RegisterForm - Registro exitoso, limpiando progreso y redirigiendo');
        clearRegistrationProgress(); // Limpiar progreso guardado
        
        // Redirigir directamente a la aplicación con el usuario logueado
        onRegisterSuccess(result.user);
      } else {
        console.log('RegisterForm - Error en registro:', result.message);
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      console.error('RegisterForm - Error en registro:', error);
      Alert.alert('Error', 'Algo salió mal. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleReligionBack = () => {
    setCurrentStep(6);
    saveRegistrationProgress(5, formData);
  };

  const renderInput = (field, placeholder, icon, keyboardType = 'default', secureTextEntry = false) => (
    <View style={styles.inputContainer}>
      <View style={[styles.inputWrapper, errors[field] && styles.inputError]}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          value={formData[field]}
          onChangeText={(value) => handleInputChange(field, value)}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={field === 'email' || field === 'confirmEmail' ? 'none' : 'words'}
          autoCorrect={false}
        />
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  const renderGenderSelector = (field, title) => (
    <View style={styles.inputContainer}>
      <Text style={styles.selectorTitle}>{title}</Text>
      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderButton,
            formData[field] === 'hombre' && styles.genderButtonSelected
          ]}
          onPress={() => handleInputChange(field, 'hombre')}
        >
          <Text style={[
            styles.genderButtonText,
            formData[field] === 'hombre' && styles.genderButtonTextSelected
          ]}>
            Hombre
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.genderButton,
            formData[field] === 'mujer' && styles.genderButtonSelected
          ]}
          onPress={() => handleInputChange(field, 'mujer')}
        >
          <Text style={[
            styles.genderButtonText,
            formData[field] === 'mujer' && styles.genderButtonTextSelected
          ]}>
            Mujer
          </Text>
        </TouchableOpacity>
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  // Si estamos en el paso 2, mostrar el componente de foto
  if (currentStep === 2) {
    return (
      <PhotoUploadStep
        userData={formData}
        onNext={handlePhotoStepNext}
        onBack={handlePhotoStepBack}
      />
    );
  }

  // Si estamos en el paso 3, mostrar el componente de rango de edad
  if (currentStep === 3) {
    return (
      <AgeRangeStep
        userData={formData}
        onNext={handleAgeRangeNext}
        onBack={handleAgeRangeBack}
      />
    );
  }

  // Si estamos en el paso 4, mostrar el componente de ubicación
  if (currentStep === 4) {
    return (
      <LocationStep
        userData={formData}
        onNext={handleLocationNext}
        onBack={handleLocationBack}
      />
    );
  }

  // Si estamos en el paso 5, mostrar el componente de tipo de relación
  if (currentStep === 5) {
    return (
      <RelationshipTypeStep
        userData={formData}
        onNext={handleRelationshipTypeNext}
        onBack={handleRelationshipTypeBack}
      />
    );
  }

  // Si estamos en el paso 6, mostrar el componente de origen étnico
  if (currentStep === 6) {
    return (
      <EthnicityStep
        userData={formData}
        onNext={handleEthnicityNext}
        onBack={handleEthnicityBack}
      />
    );
  }

  // Si estamos en el paso 7, mostrar el componente de religión
  if (currentStep === 7) {
    return (
      <ReligionStep
        userData={formData}
        onNext={handleReligionNext}
        onBack={handleReligionBack}
      />
    );
  }

  // Paso 1: Formulario de datos básicos
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Heart size={32} color="#FF5A5F" fill="#FF5A5F" />
        <Text style={styles.title}>Crear Cuenta</Text>
        <Text style={styles.subtitle}>Paso 1 de 7: Información básica</Text>
      </View>

      <View style={styles.form}>
        {renderInput('name', 'Nombre completo', <User size={20} color="#666" />)}
        
        {renderGenderSelector('gender', 'Soy un:')}
        
        {renderGenderSelector('lookingFor', 'Estoy buscando:')}
        
        {renderInput('age', 'Edad', <Calendar size={20} color="#666" />, 'numeric')}
        
        {renderInput('email', 'Email', <Mail size={20} color="#666" />, 'email-address')}
        
        {renderInput('confirmEmail', 'Confirmar email', <Mail size={20} color="#666" />, 'email-address')}
        
        {renderInput('password', 'Contraseña', <Lock size={20} color="#666" />, 'default', true)}
        
        {renderInput('confirmPassword', 'Confirmar contraseña', <Lock size={20} color="#666" />, 'default', true)}

        {/* Checkbox de términos */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={[styles.checkbox, formData.acceptTerms && styles.checkboxChecked]}
            onPress={() => handleInputChange('acceptTerms', !formData.acceptTerms)}
          >
            {formData.acceptTerms && <Check size={16} color="#fff" />}
          </TouchableOpacity>
          <Text style={styles.checkboxText}>
            Sí, confirmo que soy mayor de 18 años y acepto los 
            <Text style={styles.linkText}>Términos de uso</Text> y la 
            <Text style={styles.linkText}>Política de privacidad</Text>
          </Text>
        </View>
        {errors.acceptTerms && <Text style={styles.errorText}>{errors.acceptTerms}</Text>}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              Continuar →
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => {
          clearRegistrationProgress();
          onBackToLogin();
        }}>
          <Text style={styles.backButtonText}>
            ¿Ya tienes cuenta? Inicia sesión
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF5A5F',
    marginTop: 10,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
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
  inputError: {
    borderColor: '#FF5A5F',
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
  errorText: {
    color: '#FF5A5F',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 15,
  },
  selectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  genderButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  genderButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  linkText: {
    color: '#FF5A5F',
    fontWeight: '600',
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
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FF5A5F',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default RegisterForm;
