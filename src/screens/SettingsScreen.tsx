import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, Alert, ActivityIndicator } from 'react-native';
import { Camera, Edit3 } from 'lucide-react-native';
import { User } from '../types';
import { fileService } from '../services/fileService';

interface SettingsScreenProps {
  currentUser: User;
  onLogout: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ currentUser, onLogout, onUserUpdate }) => {
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [localUser, setLocalUser] = useState(currentUser);

  if (!localUser) {
    return null;
  }

  // Priorizar profileImage (base64) sobre profilePictureUrl
  const avatarUrl = localUser.profileImage || localUser.profilePictureUrl;

  const handleChangeProfilePicture = async () => {
    console.log('SettingsScreen: handleChangeProfilePicture llamado');
    
    if (Platform.OS === 'web') {
      // En web, ir directamente a seleccionar archivo
      pickImage('gallery');
      return;
    }
    
    Alert.alert(
      'Cambiar foto de perfil',
      'Selecciona una opción:',
      [
        {
          text: 'Tomar foto',
          onPress: () => {
            console.log('Usuario seleccionó: Tomar foto');
            pickImage('camera');
          },
        },
        {
          text: 'Elegir de galería',
          onPress: () => {
            console.log('Usuario seleccionó: Elegir de galería');
            pickImage('gallery');
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    try {
      console.log('SettingsScreen: pickImage iniciado, source:', source);
      setIsLoadingImage(true);
      
      if (Platform.OS === 'web') {
        // Implementación web usando input file
        await pickImageWeb();
        return;
      }
      
      let result;
      if (source === 'camera') {
        console.log('SettingsScreen: Llamando fileService.pickImageFromCamera');
        result = await fileService.pickImageFromCamera();
      } else {
        console.log('SettingsScreen: Llamando fileService.pickImageFromGallery');
        result = await fileService.pickImageFromGallery();
      }

      console.log('SettingsScreen: Resultado de picker:', result);

      if (result && !result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const imageUri = asset.uri;

        // Convertir imagen a base64
        const base64Image = await fileService.convertImageToBase64(imageUri);
        
        if (base64Image) {
          await updateProfileImage(base64Image);
        }
      }
    } catch (error) {
      console.error('Error al cambiar foto de perfil:', error);
      if (Platform.OS === 'web') {
        console.error('No se pudo cambiar la foto de perfil:', error.message);
      } else {
        Alert.alert('Error', 'No se pudo cambiar la foto de perfil: ' + error.message);
      }
    } finally {
      setIsLoadingImage(false);
    }
  };

  const pickImageWeb = () => {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const reader = new FileReader();
            reader.onload = async (event) => {
              const base64Image = event.target?.result as string;
              await updateProfileImage(base64Image);
              resolve(base64Image);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(null);
        }
      };
      input.click();
    });
  };

  const updateProfileImage = async (base64Image: string) => {
    // Actualizar usuario localmente
    const updatedUser = {
      ...localUser,
      profileImage: base64Image,
      profilePictureUrl: base64Image // Mantener ambos para compatibilidad
    };

    setLocalUser(updatedUser);

    // Actualizar en Firebase
    await updateUserInFirebase(updatedUser);
    
    // Notificar al componente padre
    if (onUserUpdate) {
      onUserUpdate(updatedUser);
    }

    if (Platform.OS === 'web') {
      console.log('Foto de perfil actualizada correctamente');
      // En web, mostrar un mensaje más discreto o usar toast si está disponible
    } else {
      Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');
    }
  };

  const updateUserInFirebase = async (updatedUser: User) => {
    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../services/firebase');

      const userRef = doc(db, 'users', updatedUser.uid);
      await updateDoc(userRef, {
        profileImage: updatedUser.profileImage,
        profilePictureUrl: updatedUser.profilePictureUrl,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error actualizando usuario en Firebase:', error);
      throw error;
    }
  };

  return (
    <View style={styles.settingsContainer}>
      <Text style={styles.headerTitle}>Configura tu perfil</Text>
      <View style={styles.userProfile}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleChangeProfilePicture} style={styles.avatarTouchable}>
            {isLoadingImage ? (
              <View style={[styles.userAvatar, styles.loadingAvatar]}>
                <ActivityIndicator size="large" color="#FF5A5F" />
              </View>
            ) : avatarUrl ? (
              Platform.OS === 'web' ? (
                <img 
                  src={avatarUrl}
                  style={{
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    backgroundColor: '#f0f0f0',
                    border: '4px solid #FF5A5F'
                  }}
                  onError={() => {
                    console.log('Error cargando avatar en Settings:', avatarUrl);
                  }}
                />
              ) : (
                <Image source={{ uri: avatarUrl }} style={styles.userAvatar} />
              )
            ) : (
              <View style={[styles.userAvatar, styles.placeholderAvatar]}>
                <Text style={styles.placeholderText}>👤</Text>
              </View>
            )}
            <View style={styles.editIconContainer}>
              <Edit3 size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.userName}>{localUser.name}</Text>
        <Text style={styles.userEmail}>{localUser.email}</Text>
        <Text style={styles.userAge}>Edad: {localUser.age}</Text>
        <Text style={styles.userBio}>{localUser.bio}</Text>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  settingsContainer: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF5A5F',
    textAlign: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  userProfile: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  avatarTouchable: {
    position: 'relative',
  },
  userAvatar: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 4,
    borderColor: '#FF5A5F',
  },
  placeholderAvatar: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 60,
    color: '#999',
  },
  loadingAvatar: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FF5A5F',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  userAge: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
  userBio: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  logoutButton: {
    backgroundColor: '#FF5A5F',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
