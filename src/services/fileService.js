import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, uploadString } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import 'react-native-get-random-values'; // Necesario para uuid en React Native

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
}

export default FileService;
