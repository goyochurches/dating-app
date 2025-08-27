import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  conversation: any;
  onPress: (conversation: any) => void;
  isOnline: boolean;
}

export const MatchItem: React.FC<Props> = ({ conversation, onPress, isOnline }) => {
  const { partner, lastMessage, unreadCount } = conversation;
  const contact = partner || conversation; // Handle both conversation and match objects

  return (
    <TouchableOpacity style={styles.matchItem} onPress={() => onPress(conversation)}>
      <Image source={{ uri: contact.profilePictureUrl }} style={styles.matchImage} />
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{contact.name}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#22c55e' : '#9ca3af' }]} />
          <Text style={styles.statusText}>{isOnline ? 'En línea' : 'Desconectado'}</Text>
        </View>
        {lastMessage && <Text style={styles.matchLastMessage} numberOfLines={1}>{lastMessage.text}</Text>}
      </View>
      {/* Aquí podrías mostrar la hora del último mensaje o el contador de no leídos */}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  matchItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  matchImage: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  matchInfo: { flex: 1 },
  matchName: { fontSize: 16, fontWeight: 'bold', marginBottom: 3 },
  matchLastMessage: { fontSize: 14, color: '#666', maxWidth: '80%' },
  matchTime: { fontSize: 12, color: '#999' },
  statusRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: '#666' },
});
