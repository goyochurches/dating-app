import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, uploadString } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values'; // Necesario para uuid en React Native
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

class FileService {
  // Subir una imagen a Firebase Storage
  static async uploadImage(uri, path = 'profile_pictures') {
    try {
      console.log('FileService: Iniciando subida de imagen:', uri);
      
      // Para desarrollo local, usar almacenamiento temporal en lugar de Firebase Storage
      if (uri.startsWith('data:')) {
        // Simular subida exitosa para desarrollo local
        console.log('FileService: Usando imagen base64 directamente para desarrollo');
        return uri; // Devolver la imagen base64 directamente
      } else {
        // Para URIs de archivos locales, convertir a base64
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              console.log('FileService: Imagen convertida a base64 exitosamente');
              resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (fetchError) {
          console.error('FileService: Error al convertir imagen:', fetchError);
          throw fetchError;
        }
      }
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      throw error;
    }
  }

  // Método para subida real a Firebase (cuando CORS esté configurado)
  static async uploadImageToFirebase(uri, path = 'profile_pictures') {
    try {
      let fileRef, uploadTask;
      
      if (uri.startsWith('data:')) {
        // Es una imagen en base64
        fileRef = ref(storage, `${path}/${uuidv4()}.jpg`);
        uploadTask = await uploadString(fileRef, uri, 'data_url');
      } else {
        // Es una URI normal
        const response = await fetch(uri);
        const blob = await response.blob();
        fileRef = ref(storage, `${path}/${uuidv4()}.jpg`);
        uploadTask = await uploadBytesResumable(fileRef, blob);
      }
      
      // Obtener la URL de descarga
      const downloadURL = await getDownloadURL(fileRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error al subir la imagen a Firebase:', error);
      throw error;
    }
  }

  // Seleccionar imagen de la galería
  static async pickImageFromGallery() {
    try {
      console.log('FileService: pickImageFromGallery iniciado');
      
      // Solicitar permisos de la galería
      console.log('FileService: Solicitando permisos de galería');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('FileService: Estatus de permisos:', status);
      
      if (status !== 'granted') {
        throw new Error('Se necesitan permisos para acceder a la galería');
      }

      // Abrir selector de imágenes
      console.log('FileService: Abriendo selector de imágenes');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Aspecto cuadrado
        quality: 0.8,
        base64: false, // No necesitamos base64 aquí, lo convertiremos después
      });

      console.log('FileService: Resultado del selector:', result);
      return result;
    } catch (error) {
      console.error('FileService: Error al seleccionar imagen de galería:', error);
      throw error;
    }
  }

  // Tomar foto con la cámara
  static async pickImageFromCamera() {
    try {
      // Solicitar permisos de cámara
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Se necesitan permisos para acceder a la cámara');
      }

      // Abrir cámara
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Aspecto cuadrado
        quality: 0.8,
        base64: false, // No necesitamos base64 aquí, lo convertiremos después
      });

      return result;
    } catch (error) {
      console.error('Error al tomar foto:', error);
      throw error;
    }
  }

  // Convertir imagen URI a base64
  static async convertImageToBase64(uri) {
    try {
      if (Platform.OS === 'web') {
        // Para web, usar FileReader
        const response = await fetch(uri);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        // Para React Native, usar expo-file-system si está disponible
        try {
          const { readAsStringAsync, EncodingType } = await import('expo-file-system');
          const base64 = await readAsStringAsync(uri, { encoding: EncodingType.Base64 });
          return `data:image/jpeg;base64,${base64}`;
        } catch (fsError) {
          console.log('expo-file-system no disponible, usando fetch:', fsError);
          // Fallback a método fetch
          const response = await fetch(uri);
          const blob = await response.blob();
          
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        }
      }
    } catch (error) {
      console.error('Error al convertir imagen a base64:', error);
      throw error;
    }
  }
}

// Exportar instancia para uso directo
export const fileService = FileService;

export default FileService;
