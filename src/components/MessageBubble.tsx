import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MessageStatus } from './MessageStatus';

interface Props {
  sent: boolean;
  timestamp?: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  children?: React.ReactNode;
}

export const MessageBubble: React.FC<Props> = ({ sent, timestamp, status, children }) => {
  return (
    <View style={[styles.messageBubble, sent ? styles.sentMessage : styles.receivedMessage]}>
      {children}
      <View style={styles.messageFooter}>
        {!!timestamp && <Text style={styles.messageTime}>{timestamp}</Text>}
        {sent && status && <MessageStatus status={status} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 15, marginBottom: 10 },
  sentMessage: { alignSelf: 'flex-end', backgroundColor: '#FF5A5F', borderBottomRightRadius: 2 },
  receivedMessage: { alignSelf: 'flex-start', backgroundColor: '#fff', borderBottomLeftRadius: 2 },
  messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  messageTime: { fontSize: 10, color: '#999', textAlign: 'right' },
});
