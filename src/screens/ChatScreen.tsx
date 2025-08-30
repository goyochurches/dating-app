import React, { useRef, useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import { Send, Image as ImageIcon, Video, X as CloseIcon } from 'lucide-react-native';
import { ChatHeader } from '../components/ChatHeader';
import { MediaPreview } from '../components/MediaPreview';
import { MessageStatus } from '../components/MessageStatus';
import { Conversation, Message, User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatTimestamp = (timestamp) => {
  if (!timestamp?.toDate) return '';
  const date = timestamp.toDate();
  return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

interface ChatScreenProps {
  selectedChat: Conversation;
  messages: Message[];
  currentUser: User;
  isUserOnline: (userId: string) => boolean;
  typingUsers: { [key: string]: boolean };
  newMessage: string;
  selectedMedia: string | null;
  mediaType: 'image' | 'video' | null;
  handleTextInputChange: (text: string) => void;
  handleSendMessage: () => void;
  pickMedia: (type: 'image' | 'video') => void;
  clearSelectedMedia: () => void;
  onBack: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({
  selectedChat,
  messages,
  currentUser,
  isUserOnline,
  typingUsers,
  newMessage,
  selectedMedia,
  mediaType,
  handleTextInputChange,
  handleSendMessage,
  pickMedia,
  clearSelectedMedia,
  onBack,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const isOnline = selectedChat ? isUserOnline(selectedChat.partnerUid) : false;
  const isPartnerTyping = selectedChat ? typingUsers[selectedChat.id] : false;
  
  console.log('💬 ChatScreen render - Partner typing:', isPartnerTyping);
  console.log('💬 ChatScreen render - Typing users:', typingUsers);

  return (
    <View style={styles.chatContainer}>
      <ChatHeader
        partner={{ 
          uid: selectedChat.partnerUid,
          name: selectedChat.partnerName, 
          profilePictureUrl: selectedChat.partnerAvatar,
          avatar: selectedChat.partnerAvatar
        }}
        isOnline={isOnline}
        onBack={onBack}
      />
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={{ paddingBottom: 20 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => {
          const isOwnMessage = message.user?._id === currentUser.uid;
          const getMessageStatus = () => {
            switch (message.status) {
              case 0: return 'sent';
              case 1: return 'delivered';
              case 2: return 'read';
              default: return 'sending';
            }
          };

          return (
            <View key={message._id} style={[styles.messageRow, { justifyContent: isOwnMessage ? 'flex-end' : 'flex-start' }]}>
              <View style={[styles.messageBubble, { backgroundColor: isOwnMessage ? '#007AFF' : '#E5E5EA' }]}>
                {message.text && <Text style={[styles.messageText, { color: isOwnMessage ? 'white' : 'black' }]}>{message.text}</Text>}
                {message.media && <Image source={{ uri: message.media }} style={styles.mediaMessage} />}
                <View style={styles.messageFooter}>
                  <Text style={[styles.messageTime, { color: isOwnMessage ? '#B8D4FF' : '#666' }]}>
                    {formatTimestamp(message.createdAt)}
                  </Text>
                  {isOwnMessage && message.status !== undefined && (
                    <MessageStatus status={getMessageStatus()} />
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>
      {isPartnerTyping && (
        <View style={styles.typingIndicatorContainer}>
          <Text style={styles.typingIndicatorText}>{selectedChat.partnerName} está escribiendo...</Text>
        </View>
      )}
      {selectedMedia && (
        <View style={styles.mediaPreviewContainer}>
          {mediaType === 'image' ? (
            <Image source={{ uri: selectedMedia }} style={styles.mediaThumbnail} resizeMode="cover" />
          ) : (
            <View style={[styles.mediaThumbnail, styles.videoThumbnail]}>
              <Video size={24} color="#fff" />
            </View>
          )}
          <TouchableOpacity style={styles.removeMediaButton} onPress={clearSelectedMedia}>
            <CloseIcon size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.mediaButton} onPress={() => pickMedia('image')}>
          <ImageIcon size={24} color="#FF5A5F" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.mediaButton} onPress={() => pickMedia('video')}>
          <Video size={24} color="#FF5A5F" />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={newMessage}
          onChangeText={handleTextInputChange}
          onSubmitEditing={handleSendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Send size={20} color="#FF5A5F" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chatContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  typingIndicatorContainer: {
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
  typingIndicatorText: {
    fontStyle: 'italic',
    color: '#888',
  },
  mediaPreviewContainer: {
    position: 'relative',
    margin: 10,
    borderRadius: 10,
    overflow: 'hidden',
    width: 100,
    height: 100,
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoThumbnail: {
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeMediaButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  mediaButton: {
    padding: 8,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  sendButton: {
    marginLeft: 10,
    padding: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  messageBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 18,
    maxWidth: '75%',
  },
  messageText: {
    fontSize: 16,
  },
  mediaMessage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  messageTime: {
    fontSize: 10,
    color: '#a0a0a0',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
});

export default ChatScreen;
