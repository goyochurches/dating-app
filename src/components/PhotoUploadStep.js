import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, Copy, User, ArrowRight, ArrowLeft, Heart } from 'lucide-react-native';

export const PhotoUploadStep = ({ userData, onNext, onBack }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Solicitar permisos para la galería
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos necesarios',
          'Necesitamos permisos para acceder a tu galería de fotos.'
        );
        return false;
      }
    }
    return true;
  };

  // Seleccionar imagen desde galería
  const pickImageFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Aspecto cuadrado para foto de perfil
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
      console.error('Error picking image:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar pegado de imagen (principalmente para web)
  const handlePaste = async (event) => {
    if (Platform.OS !== 'web') return;
    
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            setSelectedImage(e.target.result);
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  // Manejar subida de archivo (web)
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setSelectedImage(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        Alert.alert('Error', 'Por favor selecciona un archivo de imagen válido');
      }
    }
  };

  // Continuar al siguiente paso
  const handleNext = () => {
    if (!selectedImage) {
      Alert.alert('Foto requerida', 'Por favor selecciona una foto de perfil para continuar');
      return;
    }

    const updatedUserData = {
      ...userData,
      profileImage: selectedImage
    };

    onNext(updatedUserData);
  };

  // Saltar este paso (opcional)
  const handleSkip = () => {
    Alert.alert(
      'Saltar foto',
      '¿Estás seguro de que quieres continuar sin foto de perfil? Puedes agregarla más tarde.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Saltar', 
          onPress: () => onNext(userData)
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Heart size={32} color="#FF5A5F" fill="#FF5A5F" />
        <Text style={styles.title}>Foto de Perfil</Text>
        <Text style={styles.subtitle}>
          Paso 2 de 7: Agrega una foto para que otros puedan conocerte mejor
        </Text>
      </View>

      {/* Preview de la imagen */}
      <View style={styles.imagePreviewContainer}>
        {selectedImage ? (
          <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholderContainer}>
            <User size={60} color="#ccc" />
            <Text style={styles.placeholderText}>Sin foto</Text>
          </View>
        )}
      </View>

      {/* Opciones de subida */}
      <View style={styles.uploadOptions}>
        {/* Botón galería */}
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={pickImageFromGallery}
          disabled={loading}
        >
          <Camera size={24} color="#FF5A5F" />
          <Text style={styles.uploadButtonText}>
            {loading ? 'Cargando...' : 'Seleccionar de Galería'}
          </Text>
        </TouchableOpacity>

        {/* Botón subir archivo (web) */}
        {Platform.OS === 'web' && (
          <>
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={() => fileInputRef.current?.click()}
            >
              <Upload size={24} color="#FF5A5F" />
              <Text style={styles.uploadButtonText}>Subir Archivo</Text>
            </TouchableOpacity>

            {/* Input file oculto para web */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </>
        )}

        {/* Área de pegado (web) */}
        {Platform.OS === 'web' && (
          <View 
            style={styles.pasteArea}
            onPaste={handlePaste}
          >
            <Copy size={24} color="#FF5A5F" />
            <Text style={styles.pasteText}>
              O pega una imagen aquí (Ctrl+V)
            </Text>
          </View>
        )}
      </View>

      {/* Información adicional */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Consejos para tu foto:</Text>
        <Text style={styles.infoText}>• Usa una foto clara y reciente</Text>
        <Text style={styles.infoText}>• Asegúrate de que se vea tu rostro</Text>
        <Text style={styles.infoText}>• Evita fotos con otras personas</Text>
        <Text style={styles.infoText}>• Una sonrisa siempre ayuda</Text>
      </View>

      {/* Botones de navegación */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color="#666" />
          <Text style={styles.backButtonText}>Atrás</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Continuar</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Botón saltar */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipButtonText}>Saltar por ahora</Text>
      </TouchableOpacity>
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  imagePreview: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#FF5A5F',
  },
  placeholderContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#f5f5f5',
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    color: '#ccc',
    fontSize: 14,
  },
  uploadOptions: {
    marginBottom: 30,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#FF5A5F',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  uploadButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#FF5A5F',
    fontWeight: '600',
  },
  pasteArea: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f8ff',
    borderWidth: 2,
    borderColor: '#FF5A5F',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  pasteText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#FF5A5F',
    fontWeight: '500',
  },
  infoContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5A5F',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    marginRight: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'underline',
  },
});

export default PhotoUploadStep;
