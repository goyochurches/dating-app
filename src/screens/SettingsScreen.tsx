import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform, Alert, ActivityIndicator, ScrollView, TextInput, Modal } from 'react-native';
import { Camera, Edit3, Save, User as UserIcon, Mail, Calendar, MapPin, Heart, Globe, Users, Target, Clock, Layers, ChevronDown } from 'lucide-react-native';
import { User } from '../types';
import { fileService } from '../services/fileService';

// Datos de ubicación (mismo que en LocationStep)
const locationData = {
  'España': {
    'Andalucía': ['Sevilla', 'Málaga', 'Córdoba', 'Granada', 'Cádiz', 'Almería', 'Huelva', 'Jaén'],
    'Cataluña': ['Barcelona', 'Tarragona', 'Lleida', 'Girona'],
    'Madrid': ['Madrid', 'Alcalá de Henares', 'Móstoles', 'Fuenlabrada', 'Leganés'],
    'Valencia': ['Valencia', 'Alicante', 'Castellón', 'Elche', 'Gandía'],
    'País Vasco': ['Bilbao', 'San Sebastián', 'Vitoria', 'Barakaldo'],
    'Galicia': ['A Coruña', 'Vigo', 'Santiago de Compostela', 'Ourense', 'Lugo'],
    'Castilla y León': ['Valladolid', 'Salamanca', 'León', 'Burgos', 'Zamora'],
    'Aragón': ['Zaragoza', 'Huesca', 'Teruel'],
    'Asturias': ['Oviedo', 'Gijón', 'Avilés'],
    'Murcia': ['Murcia', 'Cartagena', 'Lorca']
  },
  'Francia': {
    'Île-de-France': ['París', 'Versalles', 'Boulogne-Billancourt', 'Saint-Denis'],
    'Provence-Alpes-Côte d\'Azur': ['Marsella', 'Niza', 'Toulon', 'Aix-en-Provence'],
    'Auvergne-Rhône-Alpes': ['Lyon', 'Grenoble', 'Saint-Étienne', 'Annecy'],
    'Occitanie': ['Toulouse', 'Montpellier', 'Nîmes', 'Perpignan'],
    'Nouvelle-Aquitaine': ['Bordeaux', 'Limoges', 'Poitiers', 'La Rochelle']
  },
  'Italia': {
    'Lazio': ['Roma', 'Latina', 'Frosinone', 'Viterbo'],
    'Lombardía': ['Milán', 'Brescia', 'Bergamo', 'Monza'],
    'Campania': ['Nápoles', 'Salerno', 'Caserta', 'Benevento'],
    'Sicilia': ['Palermo', 'Catania', 'Messina', 'Siracusa'],
    'Veneto': ['Venecia', 'Verona', 'Padua', 'Vicenza']
  },
  'Portugal': {
    'Lisboa': ['Lisboa', 'Sintra', 'Cascais', 'Oeiras'],
    'Oporto': ['Oporto', 'Vila Nova de Gaia', 'Matosinhos', 'Gondomar'],
    'Braga': ['Braga', 'Guimarães', 'Famalicão', 'Barcelos'],
    'Aveiro': ['Aveiro', 'Águeda', 'Ovar', 'Ílhavo']
  },
  'Reino Unido': {
    'Inglaterra': ['Londres', 'Manchester', 'Birmingham', 'Liverpool', 'Bristol'],
    'Escocia': ['Edimburgo', 'Glasgow', 'Aberdeen', 'Dundee'],
    'Gales': ['Cardiff', 'Swansea', 'Newport', 'Wrexham'],
    'Irlanda del Norte': ['Belfast', 'Derry', 'Lisburn', 'Newtownabbey']
  },
  'Alemania': {
    'Baviera': ['Múnich', 'Núremberg', 'Augsburgo', 'Würzburg'],
    'Renania del Norte-Westfalia': ['Colonia', 'Düsseldorf', 'Dortmund', 'Essen'],
    'Baden-Württemberg': ['Stuttgart', 'Mannheim', 'Karlsruhe', 'Freiburg'],
    'Berlín': ['Berlín'],
    'Hamburgo': ['Hamburgo']
  },
  'México': {
    'Ciudad de México': ['Ciudad de México', 'Ecatepec', 'Guadalajara', 'Puebla'],
    'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá'],
    'Nuevo León': ['Monterrey', 'Guadalupe', 'San Nicolás', 'Apodaca'],
    'Puebla': ['Puebla', 'Tehuacán', 'San Martín', 'Atlixco'],
    'Guanajuato': ['León', 'Irapuato', 'Celaya', 'Salamanca']
  },
  'Estados Unidos': {
    'California': ['Los Ángeles', 'San Francisco', 'San Diego', 'Sacramento'],
    'Texas': ['Houston', 'Dallas', 'San Antonio', 'Austin'],
    'Nueva York': ['Nueva York', 'Buffalo', 'Rochester', 'Syracuse'],
    'Florida': ['Miami', 'Tampa', 'Orlando', 'Jacksonville'],
    'Illinois': ['Chicago', 'Aurora', 'Peoria', 'Rockford']
  },
  'Argentina': {
    'Buenos Aires': ['Buenos Aires', 'La Plata', 'Mar del Plata', 'Bahía Blanca'],
    'Córdoba': ['Córdoba', 'Villa María', 'Río Cuarto', 'San Francisco'],
    'Santa Fe': ['Rosario', 'Santa Fe', 'Rafaela', 'Reconquista'],
    'Mendoza': ['Mendoza', 'San Rafael', 'Godoy Cruz', 'Maipú']
  },
  'Colombia': {
    'Bogotá': ['Bogotá', 'Soacha', 'Chía', 'Zipaquirá'],
    'Antioquia': ['Medellín', 'Bello', 'Itagüí', 'Envigado'],
    'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá'],
    'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Galapa']
  }
};

interface SettingsScreenProps {
  currentUser: User;
  onLogout: () => void;
  onUserUpdate?: (updatedUser: User) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ currentUser, onLogout, onUserUpdate }) => {
  const [isLoadingImage, setIsLoadingImage] = useState(false);
  const [localUser, setLocalUser] = useState(currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showLookingForPicker, setShowLookingForPicker] = useState(false);
  const [showEthnicityPicker, setShowEthnicityPicker] = useState(false);
  const [showReligionPicker, setShowReligionPicker] = useState(false);
  const [showRelationshipTypesPicker, setShowRelationshipTypesPicker] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showStatePicker, setShowStatePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [editData, setEditData] = useState({
    name: currentUser.name || '',
    age: currentUser.age?.toString() || '',
    bio: currentUser.bio || '',
    locationCountry: typeof currentUser.location === 'object' ? currentUser.location?.country || '' : '',
    locationState: typeof currentUser.location === 'object' ? currentUser.location?.state || '' : '',
    locationCity: typeof currentUser.location === 'object' ? currentUser.location?.city || '' : typeof currentUser.location === 'string' ? currentUser.location : '',
    gender: currentUser.gender || '',
    lookingFor: currentUser.lookingFor || '',
    ethnicity: currentUser.ethnicity || '',
    religion: currentUser.religion || '',
    preferredAgeMin: currentUser.preferredAgeRange?.min?.toString() || '18',
    preferredAgeMax: currentUser.preferredAgeRange?.max?.toString() || '35',
    maxDistance: typeof currentUser.location === 'object' && currentUser.location?.maxDistance 
      ? currentUser.location.maxDistance.toString() 
      : '100',
    relationshipTypes: currentUser.relationshipTypes || []
  });

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

  const handleEditToggle = () => {
    console.log('handleEditToggle llamado, isEditing actual:', isEditing);
    if (isEditing) {
      // Cancelar edición - restaurar datos originales
      console.log('Cancelando edición, restaurando datos');
      setEditData({
        name: localUser.name || '',
        age: localUser.age?.toString() || '',
        bio: localUser.bio || '',
        locationCountry: typeof localUser.location === 'object' ? localUser.location?.country || '' : '',
        locationState: typeof localUser.location === 'object' ? localUser.location?.state || '' : '',
        locationCity: typeof localUser.location === 'object' ? localUser.location?.city || '' : typeof localUser.location === 'string' ? localUser.location : '',
        gender: localUser.gender || '',
        lookingFor: localUser.lookingFor || '',
        ethnicity: localUser.ethnicity || '',
        religion: localUser.religion || '',
        preferredAgeMin: localUser.preferredAgeRange?.min?.toString() || '18',
        preferredAgeMax: localUser.preferredAgeRange?.max?.toString() || '35',
        maxDistance: typeof localUser.location === 'object' && localUser.location?.maxDistance 
          ? localUser.location.maxDistance.toString() 
          : '100',
        relationshipTypes: localUser.relationshipTypes || []
      });
    }
    console.log('Cambiando isEditing a:', !isEditing);
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    console.log('handleSaveChanges llamado');
    console.log('editData:', editData);
    try {
      setIsSaving(true);
      
      const updatedUser = {
        ...localUser,
        name: editData.name,
        age: parseInt(editData.age) || localUser.age,
        bio: editData.bio,
        location: {
          country: editData.locationCountry,
          state: editData.locationState,
          city: editData.locationCity,
          maxDistance: parseInt(editData.maxDistance) || 100
        },
        gender: editData.gender,
        lookingFor: editData.lookingFor,
        ethnicity: editData.ethnicity,
        religion: editData.religion,
        preferredAgeRange: {
          min: parseInt(editData.preferredAgeMin) || 18,
          max: parseInt(editData.preferredAgeMax) || 35
        },
        relationshipTypes: editData.relationshipTypes
      };

      console.log('updatedUser:', updatedUser);

      // Actualizar en Firebase
      await updateUserInFirebase(updatedUser);
      
      // Actualizar estado local
      setLocalUser(updatedUser);
      
      // Notificar al componente padre
      if (onUserUpdate) {
        onUserUpdate(updatedUser);
      }

      setIsEditing(false);
      
      if (Platform.OS === 'web') {
        console.log('Perfil actualizado correctamente');
      } else {
        Alert.alert('Éxito', 'Perfil actualizado correctamente');
      }
    } catch (error) {
      console.error('Error guardando cambios:', error);
      if (Platform.OS === 'web') {
        console.error('Error guardando cambios:', error.message);
      } else {
        Alert.alert('Error', 'No se pudieron guardar los cambios');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateUserInFirebase = async (updatedUser: User) => {
    try {
      console.log('updateUserInFirebase llamado con:', updatedUser);
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../services/firebase');

      const userRef = doc(db, 'users', updatedUser.uid);
      
      // Filtrar campos undefined para evitar errores de Firebase
      const updateData: any = {
        updatedAt: new Date().toISOString()
      };

      if (updatedUser.name !== undefined) updateData.name = updatedUser.name;
      if (updatedUser.age !== undefined) updateData.age = updatedUser.age;
      if (updatedUser.bio !== undefined) updateData.bio = updatedUser.bio;
      if (updatedUser.location !== undefined) updateData.location = updatedUser.location;
      if (updatedUser.gender !== undefined) updateData.gender = updatedUser.gender;
      if (updatedUser.lookingFor !== undefined) updateData.lookingFor = updatedUser.lookingFor;
      if (updatedUser.ethnicity !== undefined) updateData.ethnicity = updatedUser.ethnicity;
      if (updatedUser.religion !== undefined) updateData.religion = updatedUser.religion;
      if (updatedUser.preferredAgeRange !== undefined) updateData.preferredAgeRange = updatedUser.preferredAgeRange;
      if (updatedUser.relationshipTypes !== undefined) updateData.relationshipTypes = updatedUser.relationshipTypes;
      if (updatedUser.profileImage !== undefined) updateData.profileImage = updatedUser.profileImage;
      if (updatedUser.profilePictureUrl !== undefined) updateData.profilePictureUrl = updatedUser.profilePictureUrl;
      
      console.log('Datos que se van a actualizar en Firebase:', updateData);
      await updateDoc(userRef, updateData);
      console.log('Usuario actualizado exitosamente en Firebase');
    } catch (error) {
      console.error('Error actualizando usuario en Firebase:', error);
      throw error;
    }
  };

  return (
    <ScrollView style={styles.settingsContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configura tu perfil</Text>
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={isEditing ? handleSaveChanges : handleEditToggle}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FF5A5F" />
          ) : isEditing ? (
            <Save size={20} color="#FF5A5F" />
          ) : (
            <Edit3 size={20} color="#FF5A5F" />
          )}
          <Text style={styles.editButtonText}>
            {isSaving ? 'Guardando...' : isEditing ? 'Guardar' : 'Editar'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        {/* Foto de perfil */}
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

        {/* Campos editables */}
        <View style={styles.fieldsContainer}>
          {/* Nombre (no editable) */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <UserIcon size={20} color="#FF5A5F" />
              <Text style={styles.fieldLabel}>Nombre</Text>
            </View>
            <Text style={[styles.fieldValue, styles.nonEditableField]}>{localUser.name}</Text>
          </View>

          {/* Email (no editable) */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Mail size={20} color="#FF5A5F" />
              <Text style={styles.fieldLabel}>Email</Text>
            </View>
            <Text style={[styles.fieldValue, styles.nonEditableField]}>{localUser.email}</Text>
          </View>

          {/* Edad */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Calendar size={20} color="#FF5A5F" />
              <Text style={styles.fieldLabel}>Edad</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editData.age}
                onChangeText={(value) => setEditData({...editData, age: value})}
                placeholder="Tu edad"
                keyboardType="numeric"
              />
            ) : (
              <Text style={styles.fieldValue}>{localUser.age} años</Text>
            )}
          </View>

          {/* Biografía */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Heart size={20} color="#FF5A5F" />
              <Text style={styles.fieldLabel}>Presentación</Text>
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={editData.bio}
                onChangeText={(value) => setEditData({...editData, bio: value})}
                placeholder="Cuéntanos sobre ti"
                multiline={true}
                numberOfLines={3}
              />
            ) : (
              <Text style={styles.fieldValue}>{localUser.bio || 'Sin biografía'}</Text>
            )}
          </View>

          {/* País */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <MapPin size={20} color="#FF5A5F" />
              <Text style={styles.fieldLabel}>País</Text>
            </View>
            {isEditing ? (
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowCountryPicker(true)}
              >
                <Text style={styles.dropdownText}>
                  {editData.locationCountry || 'Selecciona tu país'}
                </Text>
                <ChevronDown size={20} color="#666" />
              </TouchableOpacity>
            ) : (
              <Text style={styles.fieldValue}>
                {typeof localUser.location === 'object' && localUser.location?.country 
                  ? localUser.location.country 
                  : 'No especificado'}
              </Text>
            )}
          </View>

          {/* Estado/Provincia */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <MapPin size={20} color="#FF5A5F" />
              <Text style={styles.fieldLabel}>Estado/Provincia</Text>
            </View>
            {isEditing ? (
              <TouchableOpacity 
                style={[styles.dropdown, !editData.locationCountry && styles.dropdownDisabled]}
                onPress={() => editData.locationCountry && setShowStatePicker(true)}
                disabled={!editData.locationCountry}
              >
                <Text style={styles.dropdownText}>
                  {editData.locationState || 'Selecciona estado/provincia'}
                </Text>
                <ChevronDown size={20} color="#666" />
              </TouchableOpacity>
            ) : (
              <Text style={styles.fieldValue}>
                {typeof localUser.location === 'object' && localUser.location?.state 
                  ? localUser.location.state 
                  : 'No especificado'}
              </Text>
            )}
          </View>

          {/* Ciudad */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <MapPin size={20} color="#FF5A5F" />
              <Text style={styles.fieldLabel}>Ciudad</Text>
            </View>
            {isEditing ? (
              <TouchableOpacity 
                style={[styles.dropdown, (!editData.locationCountry || !editData.locationState) && styles.dropdownDisabled]}
                onPress={() => editData.locationCountry && editData.locationState && setShowCityPicker(true)}
                disabled={!editData.locationCountry || !editData.locationState}
              >
                <Text style={styles.dropdownText}>
                  {editData.locationCity || 'Selecciona tu ciudad'}
                </Text>
                <ChevronDown size={20} color="#666" />
              </TouchableOpacity>
            ) : (
              <Text style={styles.fieldValue}>
                {typeof localUser.location === 'object' && localUser.location?.city 
                  ? localUser.location.city 
                  : typeof localUser.location === 'string'
                  ? localUser.location
                  : 'No especificado'}
              </Text>
            )}
          </View>

          {/* Género */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Globe size={20} color="#FF5A5F" />
              <Text style={styles.fieldLabel}>Soy</Text>
            </View>
            {isEditing ? (
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowGenderPicker(true)}
              >
                <Text style={styles.dropdownText}>
                  {editData.gender || 'Selecciona tu género'}
                </Text>
                <ChevronDown size={20} color="#666" />
              </TouchableOpacity>
            ) : (
              <Text style={styles.fieldValue}>{localUser.gender || 'No especificado'}</Text>
            )}
          </View>

          {/* Buscando */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Heart size={20} color="#FF5A5F" />
              <Text style={styles.fieldLabel}>Busco</Text>
            </View>
            {isEditing ? (
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowLookingForPicker(true)}
              >
                <Text style={styles.dropdownText}>
                  {editData.lookingFor || 'Selecciona qué buscas'}
                </Text>
                <ChevronDown size={20} color="#666" />
              </TouchableOpacity>
            ) : (
              <Text style={styles.fieldValue}>{localUser.lookingFor || 'No especificado'}</Text>
            )}
          </View>

          {/* Etnia */}
          {(localUser.ethnicity || isEditing) && (
            <View style={styles.fieldCard}>
              <View style={styles.fieldHeader}>
                <Globe size={20} color="#FF5A5F" />
                <Text style={styles.fieldLabel}>Etnia</Text>
              </View>
              {isEditing ? (
                <TouchableOpacity 
                  style={styles.dropdown}
                  onPress={() => setShowEthnicityPicker(true)}
                >
                  <Text style={styles.dropdownText}>
                    {editData.ethnicity || 'Selecciona tu etnia'}
                  </Text>
                  <ChevronDown size={20} color="#666" />
                </TouchableOpacity>
              ) : (
                <Text style={styles.fieldValue}>{localUser.ethnicity}</Text>
              )}
            </View>
          )}

          {/* Religión */}
          {(localUser.religion || isEditing) && (
            <View style={styles.fieldCard}>
              <View style={styles.fieldHeader}>
                <Globe size={20} color="#FF5A5F" />
                <Text style={styles.fieldLabel}>Religión</Text>
              </View>
              {isEditing ? (
                <TouchableOpacity 
                  style={styles.dropdown}
                  onPress={() => setShowReligionPicker(true)}
                >
                  <Text style={styles.dropdownText}>
                    {editData.religion || 'Selecciona tu religión'}
                  </Text>
                  <ChevronDown size={20} color="#666" />
                </TouchableOpacity>
              ) : (
                <Text style={styles.fieldValue}>{localUser.religion}</Text>
              )}
            </View>
          )}

          {/* Rango de edad preferida */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Target size={20} color="#FF5A5F" />
              <Text style={styles.fieldLabel}>Rango de edad preferida</Text>
            </View>
            {isEditing ? (
              <View style={styles.ageRangeContainer}>
                <View style={styles.ageInputContainer}>
                  <Text style={styles.ageLabel}>De:</Text>
                  <TextInput
                    style={[styles.input, styles.ageInput]}
                    value={editData.preferredAgeMin}
                    onChangeText={(value) => setEditData({...editData, preferredAgeMin: value})}
                    placeholder="18"
                    keyboardType="numeric"
                  />
                </View>
                <View style={styles.ageInputContainer}>
                  <Text style={styles.ageLabel}>A:</Text>
                  <TextInput
                    style={[styles.input, styles.ageInput]}
                    value={editData.preferredAgeMax}
                    onChangeText={(value) => setEditData({...editData, preferredAgeMax: value})}
                    placeholder="35"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            ) : (
              <Text style={styles.fieldValue}>
                {localUser.preferredAgeRange ? 
                  `${localUser.preferredAgeRange.min} - ${localUser.preferredAgeRange.max} años` : 
                  '18 - 35 años'
                }
              </Text>
            )}
          </View>

          {/* Distancia máxima */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Clock size={20} color="#FF5A5F" />
              <Text style={styles.fieldLabel}>Distancia máxima</Text>
            </View>
            {isEditing ? (
              <View style={styles.distanceContainer}>
                <TextInput
                  style={[styles.input, styles.distanceInput]}
                  value={editData.maxDistance}
                  onChangeText={(value) => setEditData({...editData, maxDistance: value})}
                  placeholder="100"
                  keyboardType="numeric"
                />
                <Text style={styles.distanceLabel}>km</Text>
              </View>
            ) : (
              <Text style={styles.fieldValue}>
                {typeof localUser.location === 'object' && localUser.location?.maxDistance 
                  ? `${localUser.location.maxDistance} km` 
                  : '100 km'
                }
              </Text>
            )}
          </View>

          {/* Tipos de relación */}
          <View style={styles.fieldCard}>
            <View style={styles.fieldHeader}>
              <Layers size={20} color="#FF5A5F" />
              <Text style={styles.fieldLabel}>Tipos de relación buscada</Text>
            </View>
            {isEditing ? (
              <TouchableOpacity 
                style={styles.dropdown}
                onPress={() => setShowRelationshipTypesPicker(true)}
              >
                <Text style={styles.dropdownText}>
                  {editData.relationshipTypes.length > 0 
                    ? editData.relationshipTypes.join(', ')
                    : 'Selecciona tipos de relación'
                  }
                </Text>
                <ChevronDown size={20} color="#666" />
              </TouchableOpacity>
            ) : (
              <Text style={styles.fieldValue}>
                {localUser.relationshipTypes && localUser.relationshipTypes.length > 0 
                  ? localUser.relationshipTypes.join(', ') 
                  : 'No especificado'
                }
              </Text>
            )}
          </View>
        </View>

        {/* Botón de cancelar cuando está editando */}
        {isEditing && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={handleEditToggle}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}

        {/* Botón de cerrar sesión */}
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Modales para los desplegables */}
      {/* Modal de Género */}
      <Modal
        visible={showGenderPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGenderPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona tu género</Text>
            {['hombre', 'mujer'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={styles.modalOption}
                onPress={() => {
                  console.log('Seleccionando género:', gender);
                  setEditData({...editData, gender});
                  setShowGenderPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>
                  {gender === 'hombre' ? 'Hombre' : 'Mujer'}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowGenderPicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Lo que busco */}
      <Modal
        visible={showLookingForPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLookingForPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Qué estás buscando?</Text>
            {['hombre', 'mujer'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={styles.modalOption}
                onPress={() => {
                  setEditData({...editData, lookingFor: gender});
                  setShowLookingForPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>
                  {gender === 'hombre' ? 'Hombre' : 'Mujer'}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowLookingForPicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Etnia */}
      <Modal
        visible={showEthnicityPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowEthnicityPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona tu etnia</Text>
            {['Latino', 'Blanco', 'Negro', 'Asiático', 'Indígena', 'Mixto', 'Otro'].map((ethnicity) => (
              <TouchableOpacity
                key={ethnicity}
                style={styles.modalOption}
                onPress={() => {
                  setEditData({...editData, ethnicity});
                  setShowEthnicityPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>{ethnicity}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowEthnicityPicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Religión */}
      <Modal
        visible={showReligionPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowReligionPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.modalContentLarge]}>
            <Text style={styles.modalTitle}>Selecciona tu religión</Text>
            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
              {/* Creencias Cristianas */}
              <Text style={styles.modalCategoryTitle}>✝️ Creencias Cristianas</Text>
              {[
                'Cristiana - Ejército de la Salvación', 'Cristiana - Iglesia Unida', 'Cristiano - Adventista del Séptimo Día',
                'Cristiano - Amish', 'Cristiano - Bereano', 'Cristiano - Brethren', 'Cristiano - Iglesia de Cristo',
                'Cristiano - Iglesia reformada', 'Cristiano - adventista', 'Cristiano - anabaptista', 'Cristiano - anglicano',
                'Cristiano - apostólico', 'Cristiano - asamblea de Dios', 'Cristiano - baptista', 'Cristiano - católico',
                'Cristiano - evangélico', 'Cristiano - hillsong', 'Cristiano - iglesia de los santos de los últimos días',
                'Cristiano - iglesia episcopal', 'Cristiano - iglesia luterana', 'Cristiano - menonita', 'Cristiano - metodista',
                'Cristiano - nazareno', 'Cristiano - ortodoxo', 'Cristiano - pentecostal', 'Cristiano - presbiteriano',
                'Cristiano - protestante', 'Cristiano - sin denominación', 'Cristiano - testigo de jehova', 'Cristiano - otro'
              ].map((religion) => (
                <TouchableOpacity
                  key={religion}
                  style={styles.modalOption}
                  onPress={() => {
                    setEditData({...editData, religion});
                    setShowReligionPicker(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{religion}</Text>
                </TouchableOpacity>
              ))}

              {/* Otras Religiones */}
              <Text style={styles.modalCategoryTitle}>🕊️ Otras Religiones</Text>
              {[
                'Bahaista', 'Budista', 'Hindú', 'Islam', 'Jainismo', 'Judío', 'Parsi', 'Sintoísmo', 'Sikhismo', 'Taoísmo'
              ].map((religion) => (
                <TouchableOpacity
                  key={religion}
                  style={styles.modalOption}
                  onPress={() => {
                    setEditData({...editData, religion});
                    setShowReligionPicker(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{religion}</Text>
                </TouchableOpacity>
              ))}

              {/* Opciones Generales */}
              <Text style={styles.modalCategoryTitle}>🌟 Opciones Generales</Text>
              {[
                'Otro', 'Sin religión', 'Prefiero no decirlo'
              ].map((religion) => (
                <TouchableOpacity
                  key={religion}
                  style={styles.modalOption}
                  onPress={() => {
                    setEditData({...editData, religion});
                    setShowReligionPicker(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{religion}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setShowReligionPicker(false)}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Tipos de Relación */}
      <Modal
        visible={showRelationshipTypesPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRelationshipTypesPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Tipos de relación (puedes seleccionar varios)</Text>
            {['Relación seria', 'Casual', 'Amistad', 'Algo divertido'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.modalOption,
                  editData.relationshipTypes.includes(type) && styles.modalOptionSelected
                ]}
                onPress={() => {
                  const newTypes = editData.relationshipTypes.includes(type)
                    ? editData.relationshipTypes.filter(t => t !== type)
                    : [...editData.relationshipTypes, type];
                  setEditData({...editData, relationshipTypes: newTypes});
                }}
              >
                <Text style={[
                  styles.modalOptionText,
                  editData.relationshipTypes.includes(type) && styles.modalOptionTextSelected
                ]}>
                  {type} {editData.relationshipTypes.includes(type) ? '✓' : ''}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowRelationshipTypesPicker(false)}
            >
              <Text style={styles.modalCancelText}>Listo</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de País */}
      <Modal
        visible={showCountryPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCountryPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona tu país</Text>
            {Object.keys(locationData).map((country) => (
              <TouchableOpacity
                key={country}
                style={styles.modalOption}
                onPress={() => {
                  console.log('Seleccionando país:', country);
                  setEditData({
                    ...editData, 
                    locationCountry: country,
                    locationState: '',
                    locationCity: ''
                  });
                  setShowCountryPicker(false);
                }}
              >
                <Text style={styles.modalOptionText}>{country}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowCountryPicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Estado/Provincia */}
      <Modal
        visible={showStatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona estado/provincia</Text>
            {editData.locationCountry && locationData[editData.locationCountry] && 
              Object.keys(locationData[editData.locationCountry]).map((state) => (
                <TouchableOpacity
                  key={state}
                  style={styles.modalOption}
                  onPress={() => {
                    console.log('Seleccionando estado:', state);
                    setEditData({
                      ...editData, 
                      locationState: state,
                      locationCity: ''
                    });
                    setShowStatePicker(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{state}</Text>
                </TouchableOpacity>
              ))
            }
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowStatePicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal de Ciudad */}
      <Modal
        visible={showCityPicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCityPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona tu ciudad</Text>
            {editData.locationCountry && editData.locationState && 
             locationData[editData.locationCountry] && locationData[editData.locationCountry][editData.locationState] &&
             locationData[editData.locationCountry][editData.locationState].map((city) => (
                <TouchableOpacity
                  key={city}
                  style={styles.modalOption}
                  onPress={() => {
                    console.log('Seleccionando ciudad:', city);
                    setEditData({...editData, locationCity: city});
                    setShowCityPicker(false);
                  }}
                >
                  <Text style={styles.modalOptionText}>{city}</Text>
                </TouchableOpacity>
              ))
            }
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowCityPicker(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  settingsContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  profileSection: {
    padding: 20,
    alignItems: 'center',
  },
  fieldsContainer: {
    width: '100%',
    marginTop: 20,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  fieldValue: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  nonEditableField: {
    color: '#999',
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginTop: 8,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  editButtonText: {
    fontSize: 14,
    color: '#FF5A5F',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#FF5A5F',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FF5A5F',
    fontSize: 16,
    fontWeight: 'bold',
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
  ageRangeContainer: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  ageInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ageLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  ageInput: {
    flex: 1,
    textAlign: 'center',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  distanceInput: {
    flex: 1,
    textAlign: 'center',
  },
  distanceLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  relationshipTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  relationshipTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
  },
  relationshipTypeButtonSelected: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  relationshipTypeButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  relationshipTypeButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 15,
    backgroundColor: '#f9f9f9',
    marginTop: 8,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  dropdownDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    maxHeight: '70%',
    width: '90%',
  },
  modalContentLarge: {
    maxHeight: '80%',
    height: '80%',
  },
  modalScrollView: {
    flex: 1,
    marginVertical: 10,
  },
  modalCategoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF5A5F',
    marginTop: 15,
    marginBottom: 10,
    paddingLeft: 5,
  },
  modalFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },
  modalOptionSelected: {
    backgroundColor: '#FF5A5F',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalCancel: {
    marginTop: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default SettingsScreen;
