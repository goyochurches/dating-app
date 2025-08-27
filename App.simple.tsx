import React, { useEffect, useState } from 'react';
import { 
  Dimensions, 
  Image, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View,
  Alert 
} from 'react-native';

// Componentes simplificados sin dependencias nativas problemáticas
import LoginScreen from './src/components/LoginScreen';
import WelcomeModal from './src/components/WelcomeModal';
import AuthService from './src/services/authService';
const authService = new AuthService();
import { User } from './src/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

const LoveConnectApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => authService.isLoggedIn());
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState('discover');
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  
  const [matches, setMatches] = useState([
    {
      id: 1,
      name: "Isabella",
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      lastMessage: "¡Hola! ¿Cómo estás?",
      time: "10:30 AM",
      online: true,
      lastSeen: new Date().toISOString()
    },
    {
      id: 2,
      name: "Carlos", 
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      lastMessage: "¿Quedamos esta tarde?",
      time: "Ayer",
      online: false,
      lastSeen: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    }
  ]);

  const [profiles] = useState([
    {
      id: 1,
      name: "Ana",
      age: 25,
      bio: "Me encanta viajar y conocer nuevas culturas. Busco alguien con quien compartir aventuras.",
      image: 'https://randomuser.me/api/portraits/women/1.jpg',
      location: "Madrid, España"
    },
    {
      id: 2,
      name: "Miguel",
      age: 28,
      bio: "Apasionado por la fotografía y los deportes al aire libre.",
      image: 'https://randomuser.me/api/portraits/men/1.jpg',
      location: "Barcelona, España"
    }
  ]);

  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [chatMessages, setChatMessages] = useState({
    1: [
      { id: 1, text: "¡Hola! ¿Cómo estás?", sent: false, time: "10:30 AM" },
      { id: 2, text: "¡Hola! Estoy bien, ¿y tú?", sent: true, time: "10:32 AM" },
    ],
    2: [
      { id: 1, text: "¡Hola! ¿Quedamos hoy?", sent: false, time: "Ayer" },
      { id: 2, text: "¡Claro! ¿A qué hora?", sent: true, time: "Ayer" },
    ]
  });

  // Verificar si hay usuario logueado al iniciar
  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthChanges(user => {
      if (user) {
        setCurrentUser(user as User);
        setIsLoggedIn(true);
      } else {
        setCurrentUser(null);
        setIsLoggedIn(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Manejar login exitoso
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setShowWelcome(true);
  };

  // Manejar aceptación de bienvenida
  const handleWelcomeAccept = () => {
    setShowWelcome(false);
    setCurrentScreen('discover');
  };

  // Manejar logout
  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentScreen('discover');
  };

  // Manejadores de acciones simplificados
  const handleLike = () => {
    Alert.alert('¡Match!', '¡Has hecho match con ' + profiles[currentProfileIndex]?.name + '!');
    goToNextProfile();
  };

  const handleDislike = () => {
    goToNextProfile();
  };

  const goToNextProfile = () => {
    if (currentProfileIndex < profiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      setCurrentProfileIndex(0);
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const newMsg = {
        id: Date.now(),
        text: newMessage.trim(),
        sent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), newMsg]
      }));

      setNewMessage('');

      // Simular respuesta automática
      setTimeout(() => {
        const responses = [
          "¡Qué interesante!",
          "Me parece genial",
          "¿En serio? Cuéntame más",
          "Eso suena divertido"
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const autoMsg = {
          id: Date.now() + 1,
          text: randomResponse,
          sent: false,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setChatMessages(prev => ({
          ...prev,
          [selectedChat.id]: [...(prev[selectedChat.id] || []), autoMsg]
        }));
      }, 1000);
    }
  };

  // Renderizar la pantalla de chat
  const renderChatScreen = () => (
    <View style={styles.container}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => setSelectedChat(null)}>
          <Text style={styles.backButton}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.chatTitle}>{selectedChat?.name}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.messagesContainer}>
        {(chatMessages[selectedChat?.id] || []).map((message) => (
          <View
            key={message.id}
            style={[
              styles.messageBubble,
              message.sent ? styles.sentMessage : styles.receivedMessage
            ]}
          >
            <Text style={[
              styles.messageText,
              message.sent && styles.sentMessageText
            ]}>
              {message.text}
            </Text>
            <Text style={styles.messageTime}>{message.time}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Escribe un mensaje..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Text style={styles.sendButtonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderizar la lista de matches
  const renderMatchesList = () => (
    <ScrollView style={styles.matchesList}>
      {matches.map((match) => (
        <TouchableOpacity
          key={match.id}
          style={styles.matchItem}
          onPress={() => setSelectedChat(match)}
        >
          <Image source={{ uri: match.image }} style={styles.matchImage} />
          <View style={styles.matchInfo}>
            <Text style={styles.matchName}>{match.name}</Text>
            <Text style={styles.matchLastMessage}>{match.lastMessage}</Text>
          </View>
          <Text style={styles.matchTime}>{match.time}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Renderizar la pantalla de descubrimiento (simplificada)
  const renderDiscoverScreen = () => {
    const currentProfile = profiles[currentProfileIndex];
    
    if (!currentProfile) {
      return (
        <View style={styles.container}>
          <Text style={styles.noMoreProfiles}>No hay más perfiles disponibles</Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.profileCard}>
          <Image source={{ uri: currentProfile.image }} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentProfile.name}, {currentProfile.age}</Text>
            <Text style={styles.profileLocation}>{currentProfile.location}</Text>
            <Text style={styles.profileBio}>{currentProfile.bio}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.dislikeButton} onPress={handleDislike}>
            <Text style={styles.buttonText}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
            <Text style={styles.buttonText}>♥</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Renderizar configuración
  const renderSettingsScreen = () => (
    <View style={styles.settingsContainer}>
      <View style={styles.userProfile}>
        <Text style={styles.userName}>{currentUser?.name || 'Usuario'}</Text>
        <Text style={styles.userEmail}>{currentUser?.email || 'email@ejemplo.com'}</Text>
        <Text style={styles.userAge}>Edad: {currentUser?.age || 25}</Text>
        <Text style={styles.userBio}>{currentUser?.bio || 'Sin biografía'}</Text>
      </View>
      
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </View>
  );

  // Renderizar la barra de navegación inferior
  const renderBottomNav = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={styles.navButton} 
        onPress={() => setCurrentScreen('discover')}
      >
        <Text style={currentScreen === 'discover' ? styles.activeNavText : styles.navText}>
          Descubrir
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.navButton} 
        onPress={() => setCurrentScreen('matches')}
      >
        <Text style={currentScreen === 'matches' ? styles.activeNavText : styles.navText}>
          Matches
        </Text>
      </TouchableOpacity>
      <TouchableOpacity 
        style={styles.navButton} 
        onPress={() => setCurrentScreen('settings')}
      >
        <Text style={currentScreen === 'settings' ? styles.activeNavText : styles.navText}>
          Perfil
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Renderizar contenido principal
  const renderMainContent = () => {
    if (selectedChat) {
      return renderChatScreen();
    }

    switch (currentScreen) {
      case 'matches':
        return (
          <View style={styles.container}>
            {renderMatchesList()}
            {renderBottomNav()}
          </View>
        );
      case 'settings':
        return (
          <View style={styles.container}>
            {renderSettingsScreen()}
            {renderBottomNav()}
          </View>
        );
      default:
        return (
          <View style={styles.container}>
            {renderDiscoverScreen()}
            {renderBottomNav()}
          </View>
        );
    }
  };

  // Renderizar la aplicación principal
  if (!isLoggedIn) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <View style={styles.container}>
      {renderMainContent()}
      {showWelcome && (
        <WelcomeModal
          visible={showWelcome}
          onAccept={handleWelcomeAccept}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  // Estilos para el perfil de descubrimiento
  profileCard: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  profileImage: {
    width: '100%',
    height: '70%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  profileInfo: {
    padding: 20,
    flex: 1,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  profileLocation: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  profileBio: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 30,
    paddingHorizontal: 50,
  },
  dislikeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  noMoreProfiles: {
    textAlign: 'center',
    fontSize: 18,
    color: '#666',
    marginTop: 50,
  },
  // Estilos para el chat
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  backButton: {
    fontSize: 16,
    color: '#FF5A5F',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerRight: {
    width: 50,
  },
  messagesContainer: {
    flex: 1,
    padding: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 18,
    marginVertical: 4,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#FF5A5F',
    borderBottomRightRadius: 2,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  sentMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: 'white',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Estilos para la lista de matches
  matchesList: {
    flex: 1,
    backgroundColor: '#fff',
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  matchImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  matchLastMessage: {
    fontSize: 14,
    color: '#666',
    maxWidth: '80%',
  },
  matchTime: {
    fontSize: 12,
    color: '#999',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  navButton: {
    padding: 10,
  },
  navText: {
    fontSize: 14,
    color: '#666',
  },
  activeNavText: {
    fontSize: 14,
    color: '#FF5A5F',
    fontWeight: 'bold',
  },
  settingsContainer: {
    flex: 1,
    padding: 20,
  },
  userProfile: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  userAge: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  userBio: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: '#FF5A5F',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoveConnectApp;
