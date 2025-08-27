import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { User } from '../types';

interface Props {
  partner: User | any;
  isOnline: boolean;
  onBack: () => void;
}

export const ChatHeader: React.FC<Props> = ({ partner, isOnline, onBack }) => {
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
        <Image source={{ uri: partner?.profilePictureUrl }} style={styles.avatar} />
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
    width: 50,
    height: 50,
    borderRadius: 25,
    marginLeft: 10,
  },
});
