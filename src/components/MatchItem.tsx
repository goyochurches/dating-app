import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Match } from '../types';

interface Props {
  match: Match;
  onPress: (id: number) => void;
}

export const MatchItem: React.FC<Props> = ({ match, onPress }) => {
  return (
    <TouchableOpacity style={styles.matchItem} onPress={() => onPress(match.id)}>
      <Image source={{ uri: match.image }} style={styles.matchImage} />
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{match.name}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: match.online ? '#22c55e' : '#9ca3af' }]} />
          <Text style={styles.statusText}>{match.online ? 'En línea' : 'Desconectado'}</Text>
        </View>
        <Text style={styles.matchLastMessage} numberOfLines={1} ellipsizeMode="tail">{match.lastMessage}</Text>
      </View>
      <Text style={styles.matchTime}>{match.time}</Text>
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
