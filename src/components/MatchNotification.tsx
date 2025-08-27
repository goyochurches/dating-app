import React from 'react';
import { View, Text, Image, StyleSheet, Animated, TouchableOpacity, Dimensions, Platform, ImageStyle } from 'react-native';
import { Heart, MessageCircle } from 'lucide-react-native';
import { User } from '../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MatchNotificationProps {
  visible: boolean;
  currentUser: User;
  matchedUser: User;
  onClose: () => void;
  onSendMessage: () => void;
}

export const MatchNotification: React.FC<MatchNotificationProps> = ({
  visible,
  currentUser,
  matchedUser,
  onClose,
  onSendMessage,
}) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View 
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        }
      ]}
    >
      <Animated.View 
        style={[
          styles.container,
          Platform.OS === 'web' ? styles.containerShadowWeb : styles.containerShadowNative,
          {
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        {/* Header con corazones */}
        <View style={styles.header}>
          <Heart size={30} color="#FF69B4" fill="#FF69B4" />
          <Text style={styles.matchTitle}>¡ES UN MATCH!</Text>
          <Heart size={30} color="#FF69B4" fill="#FF69B4" />
        </View>

        {/* Imágenes de los usuarios */}
        <View style={styles.usersContainer}>
          <View style={styles.userImageContainer}>
            {(currentUser.profilePictureUrl || currentUser.profileImage) ? (
              Platform.OS === 'web' ? (
                <img 
                  src={currentUser.profilePictureUrl || currentUser.profileImage}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    marginBottom: 8,
                    border: '3px solid #FF69B4',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <Image source={{ uri: currentUser.profilePictureUrl || currentUser.profileImage }} style={userImageStyle} />
              )
            ) : (
              <View style={[userImageStyle, styles.placeholderImage]}>
                <Text style={styles.placeholderText}>
                  {currentUser.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Text style={styles.userName}>{currentUser.name}</Text>
          </View>

          <View style={styles.heartContainer}>
            <Heart size={40} color="#FF1493" fill="#FF1493" />
          </View>

          <View style={styles.userImageContainer}>
            {Platform.OS === 'web' ? (
              <img 
                src={matchedUser.profilePictureUrl || matchedUser.profileImage}
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  marginBottom: 8,
                  border: '3px solid #FF69B4',
                  objectFit: 'cover'
                }}
              />
            ) : (
              <Image source={{ uri: matchedUser.profilePictureUrl || matchedUser.profileImage }} style={userImageStyle} />
            )}
            <Text style={styles.userName}>{matchedUser.name}</Text>
          </View>
        </View>

        {/* Mensaje */}
        <Text style={styles.message}>
          A ti y a {matchedUser.name} os gustáis mutuamente
        </Text>

        {/* Botones de acción */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.closeButton]} 
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Seguir viendo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.messageButton, Platform.OS === 'web' ? styles.messageButtonShadowWeb : styles.messageButtonShadowNative]} 
            onPress={onSendMessage}
          >
            <MessageCircle size={20} color="#fff" />
            <Text style={styles.messageButtonText}>Enviar mensaje</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
};

const userImageStyle: ImageStyle = {
  width: 80,
  height: 80,
  borderRadius: 40,
  marginBottom: 8,
  borderWidth: 3,
  borderColor: '#FF69B4',
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH * 0.9,
    // Sombras aplicadas condicionalmente abajo
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 15,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF1493',
    textAlign: 'center',
  },
  usersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    gap: 20,
  },
  userImageContainer: {
    alignItems: 'center',
  },
  placeholderImage: {
    backgroundColor: '#FF69B4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  heartContainer: {
    padding: 10,
  },
  message: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  buttonsContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  closeButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  closeButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  messageButton: {
    backgroundColor: '#FF5A5F',
    // Sombras aplicadas condicionalmente abajo
  },
  messageButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  containerShadowWeb: {
    boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
  } as any,
  containerShadowNative: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  messageButtonShadowWeb: {
    boxShadow: '0 4px 8px rgba(255,90,95,0.3)',
  } as any,
  messageButtonShadowNative: {
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
