import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native';

interface Props {
  conversation: any;
  onPress: (conversation: any) => void;
  isOnline: boolean;
}

export const MatchItem: React.FC<Props> = ({ conversation, onPress, isOnline }) => {
  const { partner, lastMessage } = conversation;

  // Debug: verificar qué datos llegan
  console.log('MatchItem - partner completo:', partner);
  console.log('MatchItem - avatar:', partner?.avatar);
  console.log('MatchItem - avatar existe?', !!partner?.avatar);
  console.log('MatchItem - avatar tipo:', typeof partner?.avatar);

  // Asegurarse de que el partner exista para evitar errores
  if (!partner) return null;

  // Determinar el texto del último mensaje
  const lastMessageText = typeof lastMessage === 'string' 
    ? lastMessage 
    : lastMessage?.text;

  return (
    <TouchableOpacity style={styles.matchItem} onPress={() => onPress(conversation)}>
      {/* Siempre mostrar el contenedor de imagen */}
      <View style={styles.imageContainer}>
        {partner.avatar ? (
          Platform.OS === 'web' ? (
            <img 
              src={partner.avatar}
              style={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                objectFit: 'cover',
                backgroundColor: '#f0f0f0',
                border: '2px solid #e0e0e0'
              }}
              onError={() => {
                console.log('Error cargando avatar en MatchItem:', partner.avatar);
              }}
            />
          ) : (
            <Image 
              source={{ uri: partner.avatar }} 
              style={styles.matchImage}
              onError={() => console.log('Error cargando imagen móvil:', partner.avatar)}
            />
          )
        ) : null}
        
        {/* Placeholder siempre presente */}
        {!partner.avatar && (
          <View style={[
            styles.matchImage, 
            { 
              backgroundColor: '#f0f0f0', 
              justifyContent: 'center', 
              alignItems: 'center'
            }
          ]}>
            <Text style={{ fontSize: 24, color: '#999' }}>👤</Text>
          </View>
        )}
      </View>
      
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{partner.name}</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#22c55e' : '#9ca3af' }]} />
          <Text style={styles.statusText}>{isOnline ? 'En línea' : 'Desconectado'}</Text>
        </View>
        {lastMessageText && <Text style={styles.matchLastMessage} numberOfLines={1}>{lastMessageText}</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  matchItem: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  imageContainer: { marginRight: 15 },
  matchImage: { width: 60, height: 60, borderRadius: 30 },
  matchInfo: { flex: 1 },
  matchName: { fontSize: 16, fontWeight: 'bold', marginBottom: 3 },
  matchLastMessage: { fontSize: 14, color: '#666', maxWidth: '80%' },
  matchTime: { fontSize: 12, color: '#999' },
  statusRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: '#666' },
});
