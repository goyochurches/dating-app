import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';
import { UserPresenceStatus } from './UserPresenceStatus';

interface Props {
  isConnected?: boolean;
  userId?: string;
  showUserPresence?: boolean;
  style?: any;
}

export const ConnectionStatus: React.FC<Props> = ({ 
  isConnected, 
  userId, 
  showUserPresence = false,
  style 
}) => {
  // Si se especifica mostrar presencia de usuario, usa el nuevo componente
  if (showUserPresence && userId) {
    return (
      <View style={[styles.userPresenceContainer, style]}>
        <UserPresenceStatus userId={userId} showText={true} />
      </View>
    );
  }

  // Comportamiento original para estado de conexión de red
  if (isConnected) {
    return null; // Don't show when connected
  }

  return (
    <View style={[styles.container, style]}>
      <WifiOff size={16} color="#ff6b6b" />
      <Text style={styles.text}>Sin conexión</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    marginVertical: 8,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  userPresenceContainer: {
    alignSelf: 'center',
    marginVertical: 4,
  },
});
