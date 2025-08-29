import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { User } from '../types';

interface SettingsScreenProps {
  currentUser: User;
  onLogout: () => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ currentUser, onLogout }) => {
  if (!currentUser) {
    return null;
  }

  return (
    <View style={styles.settingsContainer}>
      <View style={styles.userProfile}>
        <Image source={{ uri: currentUser.profilePictureUrl }} style={styles.userAvatar} />
        <Text style={styles.userName}>{currentUser.name}</Text>
        <Text style={styles.userEmail}>{currentUser.email}</Text>
        <Text style={styles.userAge}>Edad: {currentUser.age}</Text>
        <Text style={styles.userBio}>{currentUser.bio}</Text>
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
  userProfile: {
    alignItems: 'center',
    marginBottom: 30,
  },
  userAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
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
