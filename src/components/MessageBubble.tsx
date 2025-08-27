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
  const renderContent = () => {
    return React.Children.map(children, child => {
      if (typeof child === 'string') {
        return <Text style={sent ? styles.sentText : styles.receivedText}>{child}</Text>;
      }
      return child;
    });
  };

  return (
    <View style={[styles.messageBubble, sent ? styles.sentBubble : styles.receivedBubble]}>
      {renderContent()}
      <View style={styles.messageFooter}>
        {!!timestamp && <Text style={[styles.messageTime, sent && styles.sentText]}>{timestamp}</Text>}
        {sent && status && <MessageStatus status={status} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 15, marginBottom: 10 },
  sentBubble: { alignSelf: 'flex-end', backgroundColor: '#007AFF', borderBottomRightRadius: 2 },
    receivedBubble: { alignSelf: 'flex-start', backgroundColor: '#E5E5EA', borderBottomLeftRadius: 2 },
  messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  messageTime: { fontSize: 12, color: '#666', textAlign: 'right' },
  sentText: { color: 'white' },
  receivedText: { color: '#000000' },
});
