import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  sent: boolean;
  timestamp?: string;
  children?: React.ReactNode;
}

export const MessageBubble: React.FC<Props> = ({ sent, timestamp, children }) => {
  return (
    <View style={[styles.messageBubble, sent ? styles.sentMessage : styles.receivedMessage]}>
      {children}
      {!!timestamp && <Text style={styles.messageTime}>{timestamp}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 15, marginBottom: 10 },
  sentMessage: { alignSelf: 'flex-end', backgroundColor: '#FF5A5F', borderBottomRightRadius: 2 },
  receivedMessage: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 2 },
  messageTime: { fontSize: 10, color: '#999', marginTop: 4, textAlign: 'right' },
});
