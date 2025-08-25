import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  title: string;
  online?: boolean;
}

export const ChatHeader: React.FC<Props> = ({ title, online }) => {
  return (
    <View style={styles.containerCenter}>
      <Text style={styles.chatTitle}>{title}</Text>
      <View style={styles.statusRow}>
        <View style={[styles.statusDot, { backgroundColor: online ? '#22c55e' : '#9ca3af' }]} />
        <Text style={styles.statusText}>{online ? 'En línea' : 'Desconectado'}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerCenter: { alignItems: 'center' },
  chatTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statusRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: '#666' },
});
