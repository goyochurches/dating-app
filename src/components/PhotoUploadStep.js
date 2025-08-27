import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, Copy, User, ArrowRight, ArrowLeft, Heart } from 'lucide-react-native';
import FileService from '../services/fileService';

export const PhotoUploadStep = ({ userData, onNext, onBack }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showError, setShowError] = useState(false);
  const fileInputRef = useRef(null);
  const [imageUrl, setImageUrl] = useState(null);

  // Agregar listener global para paste
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const handleGlobalPaste = (event) => {
        handlePaste(event);
      };
      
      document.addEventListener('paste', handleGlobalPaste);
      
      return () => {
        document.removeEventListener('paste', handleGlobalPaste);
      };
    }
  }, []);

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

    setUploading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Aspecto cuadrado para foto de perfil
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        setShowError(false);
        
        // Para desarrollo, no procesar la imagen, solo mostrarla
        console.log('Imagen seleccionada:', imageUri);
        setImageUrl(imageUri); // Usar la misma URI para mostrar
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
      console.error('Error picking image:', error);
    } finally {
      setUploading(false);
    }
  };

  // Manejar pegado de imagen (principalmente para web)
  const handlePaste = async (event) => {
    console.log('PhotoUploadStep - handlePaste called', event);
    if (Platform.OS !== 'web') return;
    
    event.preventDefault();
    
    const items = event.clipboardData?.items;
    console.log('PhotoUploadStep - clipboard items:', items);
    if (!items) return;

    setUploading(true);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log('PhotoUploadStep - checking item:', item.type);
      if (item.type.indexOf('image') !== -1) {
        console.log('PhotoUploadStep - found image item');
        const file = item.getAsFile();
        if (file) {
          console.log('PhotoUploadStep - processing file:', file.name);
          const reader = new FileReader();
          reader.onload = async (e) => {
            console.log('PhotoUploadStep - image loaded successfully');
            const imageDataUrl = e.target.result;
            setSelectedImage(imageDataUrl);
            
            // Para desarrollo, usar la imagen base64 directamente
            console.log('Imagen pegada:', imageDataUrl.substring(0, 50) + '...');
            setImageUrl(imageDataUrl);
            setUploading(false);
            setShowError(false); // Limpiar error al pegar imagen
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  // Manejar subida de archivo (web)
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setUploading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
          const imageDataUrl = e.target.result;
          setSelectedImage(imageDataUrl);
          setShowError(false);
          
          // Para desarrollo, usar la imagen base64 directamente
          console.log('Archivo subido:', imageDataUrl.substring(0, 50) + '...');
          setImageUrl(imageDataUrl);
          setUploading(false);
        };
        reader.readAsDataURL(file);
      } else {
        Alert.alert('Error', 'Por favor selecciona un archivo de imagen válido');
      }
    }
  };

  // Continuar al siguiente paso
  const handleNext = () => {
    console.log('PhotoUploadStep - handleNext called, selectedImage:', selectedImage, 'imageUrl:', imageUrl);
    
    if (!selectedImage) {
      console.log('PhotoUploadStep - No image selected, showing error message');
      setShowError(true);
      return;
    }

    console.log('PhotoUploadStep - Image selected, proceeding to next step');
    const updatedUserData = {
      ...userData,
      profileImage: imageUrl || selectedImage // Usar imageUrl si está disponible, sino selectedImage
    };

    onNext(updatedUserData);
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
          <View style={styles.imageContainer}>
            <View style={styles.imageWrapper}>
              {Platform.OS === 'web' ? (
                <img 
                  src={selectedImage}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%'
                  }}
                  onError={() => console.log('ERROR AL CARGAR IMAGEN HTML')}
                  onLoad={() => console.log('IMAGEN HTML CARGADA CORRECTAMENTE')}
                />
              ) : (
                <Image 
                  source={{ uri: selectedImage }} 
                  style={styles.imagePreview}
                  resizeMode="cover"
                  onError={(error) => {
                    console.log('ERROR AL CARGAR IMAGEN:', error);
                  }}
                  onLoad={() => {
                    console.log('IMAGEN CARGADA CORRECTAMENTE');
                  }}
                />
              )}
            </View>
            <Text style={styles.debugText}>
              {`Imagen: ${selectedImage ? 'SÍ' : 'NO'} | Longitud: ${selectedImage ? selectedImage.length : 0}`}
            </Text>
            {uploading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#FF5A5F" />
                <Text style={styles.loadingText}>Procesando imagen...</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <User size={60} color="#ccc" />
            <Text style={styles.placeholderText}>Sin foto</Text>
            <Text style={styles.debugText}>Estado: Sin imagen seleccionada</Text>
          </View>
        )}
      </View>

      {/* Opciones de subida */}
      <View style={styles.uploadOptions}>
        {/* Botón galería */}
        <TouchableOpacity 
          style={styles.uploadButton} 
          onPress={pickImageFromGallery}
          disabled={uploading}
        >
          <Camera size={24} color="#FF5A5F" />
          <Text style={styles.uploadButtonText}>
            {uploading ? 'Cargando...' : 'Seleccionar de Galería'}
          </Text>
        </TouchableOpacity>

        {/* Botón subir archivo (web) */}
        {Platform.OS === 'web' && (
          <>
            <TouchableOpacity 
              style={styles.uploadButton} 
              onPress={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload size={24} color="#FF5A5F" />
              <Text style={styles.uploadButtonText}>
                {uploading ? 'Cargando...' : 'Subir Archivo'}
              </Text>
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
          <TouchableOpacity 
            style={styles.pasteArea}
            onPaste={handlePaste}
            activeOpacity={0.7}
          >
            <Copy size={24} color="#FF5A5F" />
            <Text style={styles.pasteText}>
              O pega una imagen aquí (Ctrl+V)
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Mensaje de error si no hay foto */}
      {showError && (
        <View style={styles.errorMessage}>
          <Text style={styles.errorText}>
            La foto de perfil es obligatoria para continuar
          </Text>
        </View>
      )}

      {/* Información adicional */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Consejos para tu foto:</Text>
        <Text style={styles.infoText}>• Usa una foto clara y reciente (máximo 6 meses)</Text>
        <Text style={styles.infoText}>• Asegúrate de que se vea tu rostro claramente</Text>
        <Text style={styles.infoText}>• Evita fotos con otras personas o mascotas</Text>
        <Text style={styles.infoText}>• Una sonrisa natural siempre ayuda</Text>
        <Text style={styles.infoText}>• Buena iluminación (evita fotos muy oscuras)</Text>
        <Text style={styles.infoText}>• Mira directamente a la cámara</Text>
        <Text style={styles.infoText}>• Evita filtros excesivos o gafas de sol</Text>
        <Text style={styles.infoText}>• Viste de forma que te represente</Text>
        <Text style={styles.infoText}>• Fondo simple y no distractivo</Text>
        <Text style={styles.infoText}>• Foto de cuerpo entero o desde el pecho hacia arriba</Text>
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
    backgroundColor: '#f0f0f0', // Fondo para debug
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
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  pasteText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#FF5A5F',
    fontWeight: '600',
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
  nextButtonText: {
    marginRight: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  requiredMessage: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#fff5f5',
    borderRadius: 8,
    paddingVertical: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5A5F',
  },
  requiredText: {
    fontSize: 18,
    color: '#FF5A5F',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorMessage: {
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 12,
    color: '#FF5A5F',
    fontWeight: '600',
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    marginTop: 5,
    fontFamily: 'monospace',
  },
  imageContainer: {
    alignItems: 'center',
  },
  imageWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FF5A5F',
    backgroundColor: '#f0f0f0',
  },
});

export default PhotoUploadStep;
