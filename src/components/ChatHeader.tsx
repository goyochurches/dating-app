import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { User } from '../types';

interface Props {
  partner: User | any;
  isOnline: boolean;
  onBack: () => void;
}

export const ChatHeader: React.FC<Props> = ({ partner, isOnline, onBack }) => {
  // Debug: verificar qué datos llegan
  console.log('ChatHeader - partner:', partner);
  console.log('ChatHeader - profilePictureUrl:', partner?.profilePictureUrl);
  console.log('ChatHeader - profileImage:', partner?.profileImage);

  const avatarUrl = partner?.profilePictureUrl || partner?.profileImage || partner?.avatar;

  return (
    <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <ChevronLeft size={28} color="#FF5A5F" />
        </TouchableOpacity>
        <View style={styles.containerCenter}>
            <Text style={styles.chatTitle}>{partner?.name}</Text>
            <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: isOnline ? '#22c55e' : '#9ca3af' }]} />
                <Text style={styles.statusText}>{isOnline ? 'En línea' : 'Desconectado'}</Text>
            </View>
        </View>
        {avatarUrl ? (
          Platform.OS === 'web' ? (
            <img 
              src={avatarUrl}
              style={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                marginLeft: 10,
                objectFit: 'cover',
                backgroundColor: '#f0f0f0'
              }}
              onError={() => {
                console.log('Error cargando avatar en ChatHeader:', avatarUrl);
              }}
            />
          ) : (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          )
        ) : (
          <View style={[styles.avatar, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: 60, color: '#999' }}>👤</Text>
          </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 5,
  },
  containerCenter: { alignItems: 'center' },
  chatTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statusRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: '#666' },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginLeft: 10,
  },
});
