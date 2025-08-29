import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { Heart, MapPin, X } from 'lucide-react-native';
import { User } from '../types';
import { UserPresenceStatus } from '../components/UserPresenceStatus';

const formatLocation = (location) => {
  if (!location) return '';
  if (typeof location === 'string') return location;
  if (typeof location === 'object') {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.join(', ');
  }
  return '';
};

interface DiscoverScreenProps {
  loadingProfiles: boolean;
  profiles: User[];
  currentProfileIndex: number;
  handleLike: (user: User) => void;
  handleDislike: (user: User) => void;
  loadProfiles: () => void;
}

const DiscoverScreen: React.FC<DiscoverScreenProps> = ({
  loadingProfiles,
  profiles,
  currentProfileIndex,
  handleLike,
  handleDislike,
  loadProfiles,
}) => {
  if (loadingProfiles) {
    return (
      <View style={styles.placeholderContainer}>
        <ActivityIndicator size="large" color="#FF5A5F" />
        <Text style={styles.placeholderText}>Buscando perfiles...</Text>
      </View>
    );
  }

  if (profiles.length === 0 || currentProfileIndex >= profiles.length) {
    return (
      <View style={styles.noProfilesContainer}>
        <Text style={styles.noProfilesEmoji}>😢</Text>
        <Text style={styles.noProfilesTitle}>No hay más perfiles</Text>
        <Text style={styles.noProfilesSubtitle}>Has visto todos los perfiles disponibles. ¡Vuelve más tarde para ver gente nueva!</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={loadProfiles}>
          <Text style={styles.refreshButtonText}>Buscar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentProfile = profiles[currentProfileIndex];

  if (!currentProfile) {
      return (
          <View style={styles.noProfilesContainer}>
              <Text style={styles.noProfilesEmoji}>😢</Text>
              <Text style={styles.noProfilesTitle}>No hay más perfiles</Text>
              <Text style={styles.noProfilesSubtitle}>Has visto todos los perfiles disponibles. ¡Vuelve más tarde para ver gente nueva!</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={loadProfiles}>
                  <Text style={styles.refreshButtonText}>Buscar de nuevo</Text>
              </TouchableOpacity>
          </View>
      );
  }

  return (
    <View style={styles.discoverContainer}>
      <View style={styles.profileCard}>
        {Platform.OS === 'web' ? (
          <img 
            src={currentProfile.profilePictureUrl || currentProfile.profileImage}
            style={{
              width: '100%',
              height: 400,
              objectFit: 'cover'
            }}
            onError={() => console.log('Error cargando imagen de perfil')}
          />
        ) : (
          <Image 
            source={{ uri: currentProfile.profilePictureUrl || currentProfile.profileImage }} 
            style={styles.profileImage} 
            onError={() => console.log('Error cargando imagen de perfil')}
          />
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{currentProfile.name}, {currentProfile.age}</Text>
          <UserPresenceStatus 
            userId={currentProfile.uid} 
            showText={true} 
            size="medium" 
            style={styles.presenceStatus}
          />
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#666" />
            <Text style={styles.locationText}>{formatLocation(currentProfile.location)}</Text>
          </View>
          <Text style={styles.bioText}>{currentProfile.bio}</Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={[styles.actionButton, styles.dislikeButton]} onPress={() => handleDislike(currentProfile)}>
          <X size={32} color="#F44336" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={() => handleLike(currentProfile)}>
          <Heart size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    noProfilesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    noProfilesEmoji: {
        fontSize: 60,
        textAlign: 'center',
    },
    noProfilesTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    noProfilesSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    refreshButton: {
        backgroundColor: '#FF5A5F',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
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
                boxShadow: '0 4px 8px rgba(255, 90, 95, 0.3)',
            }
        }),
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    discoverContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 5,
            },
            web: {
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }
        }),
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
    },
    profileImage: {
        width: '100%',
        height: 400,
    },
    profileInfo: {
        padding: 20,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    presenceStatus: {
        marginBottom: 8,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    locationText: {
        marginLeft: 5,
        color: '#666',
    },
    bioText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    actionButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
            },
            android: {
                elevation: 5,
            },
            web: {
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            }
        }),
    },
    likeButton: {
        backgroundColor: 'white',
    },
    dislikeButton: {
        backgroundColor: 'white',
    },
});

export default DiscoverScreen;
