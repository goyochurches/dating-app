import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Check, CheckCheck, Clock } from 'lucide-react-native';

interface Props {
  status: 'sending' | 'sent' | 'delivered' | 'read';
  style?: any;
}

export const MessageStatus: React.FC<Props> = ({ status, style }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock size={18} color="#999" />;
      case 'sent':
        return <Check size={18} color="#999" />;
      case 'delivered':
        return <CheckCheck size={18} color="#999" />;
      case 'read':
        return <CheckCheck size={18} color="#FF4444" />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, style]}>
      {getStatusIcon()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
