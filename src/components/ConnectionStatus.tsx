import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';

interface Props {
  isConnected: boolean;
  style?: any;
}

export const ConnectionStatus: React.FC<Props> = ({ isConnected, style }) => {
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
});
