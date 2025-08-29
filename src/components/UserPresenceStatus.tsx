import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Circle } from 'lucide-react-native';
import { presenceService } from '../services/presenceService';

interface Props {
  userId: string;
  showText?: boolean;
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const UserPresenceStatus: React.FC<Props> = ({ 
  userId, 
  showText = false, 
  size = 'medium',
  style 
}) => {
  const [presence, setPresence] = useState({ 
    isOnline: false, 
    lastSeen: null, 
    updatedAt: null 
  });

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = presenceService.subscribeToUserPresence(userId, (presenceData) => {
      setPresence(presenceData);
    });

    return unsubscribe;
  }, [userId]);

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: 8, height: 8 };
      case 'large':
        return { width: 16, height: 16 };
      default:
        return { width: 12, height: 12 };
    }
  };

  const getStatusText = () => {
    if (presence.isOnline) {
      return 'En línea';
    }
    if (presence.lastSeen) {
      return presenceService.getLastSeenText(presence.lastSeen);
    }
    return 'Sin conexión';
  };

  const statusColor = presence.isOnline ? '#4CAF50' : '#757575';

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.indicator, getSizeStyles(), { backgroundColor: statusColor }]} />
      {showText && (
        <Text style={[styles.text, { color: statusColor }]}>
          {getStatusText()}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  indicator: {
    borderRadius: 50,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});