import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MessageCircle, Settings, User } from 'lucide-react-native';

interface Props {
  current: string;
  onChange: (screen: string) => void;
}

export const BottomNav: React.FC<Props> = ({ current, onChange }) => {
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navButton} onPress={() => onChange('discover')}>
        <User size={24} color={current === 'discover' ? '#FF5A5F' : '#666'} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => onChange('messages')}>
        <MessageCircle size={24} color={current === 'messages' ? '#FF5A5F' : '#666'} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton} onPress={() => onChange('settings')}>
        <Settings size={24} color={current === 'settings' ? '#FF5A5F' : '#666'} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 15, borderTopWidth: 1, borderTopColor: '#eee', backgroundColor: '#fff' },
  navButton: { padding: 10 },
});
