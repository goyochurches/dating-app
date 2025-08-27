// Polyfills for web (must be before all other imports)
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import process from 'process';
import { Buffer } from 'buffer';

// Make Node-like globals available for dependencies expecting them
// @ts-ignore
if (!(globalThis as any).process) (globalThis as any).process = process;
// @ts-ignore
if (!(globalThis as any).Buffer) (globalThis as any).Buffer = Buffer;
// Minimal hrtime shim used by webpack-dev-server logger
// @ts-ignore
if (!process.hrtime) (process as any).hrtime = () => [0, 0] as [number, number];

import { Video as ExpoVideo } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { X as CloseIcon, Heart, Image as ImageIcon, MapPin, MessageCircle, Send, Settings, User as UserIcon, Video, X } from 'lucide-react-native';
import { ChatHeader } from './src/components/ChatHeader';
import { MatchItem } from './src/components/MatchItem';
import { MessageBubble } from './src/components/MessageBubble';
import { MediaPreview } from './src/components/MediaPreview';
import { User, MediaType, Match, Message } from './src/types';
import { BottomNav } from './src/components/BottomNav';
import { ConnectionStatus } from './src/components/ConnectionStatus';
import { MatchNotification } from './src/components/MatchNotification';
import LoginScreen from './src/components/LoginScreen';
import WelcomeModal from './src/components/WelcomeModal';
import { usePresence } from './src/hooks/usePresence';
import AuthService from './src/services/authService';
const authService = new AuthService();
import { useMessaging } from './src/hooks/useMessaging';
import { likeService } from './src/services/likeService';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

const formatTimestamp = (timestamp) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const formatLocation = (location) => {
  if (!location) return '';
  // Manejar datos antiguos que puedan ser un string
  if (typeof location === 'string') return location;
  // Manejar el objeto de ubicación
  if (typeof location === 'object') {
    const parts = [location.city, location.state, location.country].filter(Boolean);
    return parts.join(', ');
  }
  return '';
};

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => authService.isLoggedIn());
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [profiles, setProfiles] = useState<User[]>([]);
    const [currentScreen, setCurrentScreen] = useState('discover');
    const [showWelcome, setShowWelcome] = useState(false);
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
    const [loadingProfiles, setLoadingProfiles] = useState(true);
    // Hook de mensajería en tiempo real
    const {
        conversations,
        messages,
        isConnected,
        createConversation,
        sendMessage,
        listenForMessages,
        stopListeningForMessages,
        isUserOnline,
        typingUsers,
        updateTypingStatus,
    } = useMessaging(currentUser);
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const typingTimeoutRef = useRef(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [mediaType, setMediaType] = useState(null); // 'image' or 'video'
    const [showMatchNotification, setShowMatchNotification] = useState(false);
    const [matchedProfile, setMatchedProfile] = useState<User | null>(null);

    // Cargar perfiles de usuarios registrados
    const loadProfiles = async () => {
        if (!currentUser?.uid) return;
        setLoadingProfiles(true);
        try {
            const availableUsers = await authService.getAvailableUsers();
            setProfiles(availableUsers);
        } catch (error) {
            console.error('Error loading profiles:', error);
            setProfiles([]);
        } finally {
            setCurrentProfileIndex(0);
            setLoadingProfiles(false);
        }
    };

    const loadMatches = async () => {
        if (!currentUser?.uid) return;
        const userMatches = await likeService.getUserMatches(currentUser.uid);
        setMatches(userMatches);
    };

    // Verificar si hay usuario logueado al iniciar
    useEffect(() => {
        const unsubscribe = authService.subscribeToAuthChanges(user => {
            if (user) {
                setCurrentUser(user as User);
                setIsLoggedIn(true);
                likeService.initialize(user.uid);
            } else {
                setCurrentUser(null);
                setIsLoggedIn(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Cargar perfiles cuando el usuario esté logueado
    useEffect(() => {
        if (currentUser) {
            loadProfiles();
            loadMatches();
        }
    }, [currentUser]);

    // Manejar login exitoso
    const handleLoginSuccess = (user: User, isNewUser: boolean = false) => {
        console.log('App.tsx - handleLoginSuccess called for user:', user?.email, 'isNewUser:', isNewUser);
        setCurrentUser(user);
        setIsLoggedIn(true);

        // Inicializar servicio de likes
        if (user?.uid) {
            likeService.initialize(user.uid);
        }

        // Mostrar bienvenida solo a usuarios nuevos
        if (isNewUser) {
            setShowWelcome(true);
        }
    };

    // Manejar aceptación de bienvenida
    const handleWelcomeAccept = () => {
        // La lógica de 'markWelcomeSeen' ya no es necesaria.
        setShowWelcome(false);
    };

    // Manejar cierre de notificación de match
    const handleMatchNotificationClose = () => {
        setShowMatchNotification(false);
        setMatchedProfile(null);
    };

    // Manejar envío de mensaje desde notificación de match
    const handleMatchSendMessage = () => {
        setShowMatchNotification(false);
        setMatchedProfile(null);
        setCurrentScreen('messages');
        // Buscar la conversación recién creada y abrirla
        if (matchedProfile) {
            const conversation = conversations.find(c => c.partnerUid === matchedProfile?.uid);
            if (conversation) {
                setSelectedChat(conversation);
            }
        }
    };

    // Manejar logout
    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
        setIsLoggedIn(false);
        setCurrentScreen('discover');
    };

    // Estado para perfiles de usuarios registrados
    const [matches, setMatches] = useState<Match[]>([]);

    // Manejadores de acciones
    const handleLike = async (likedUser: User) => {
        if (!likedUser?.uid) return;

        const isMatch = await likeService.likeUser(likedUser.uid);
        if (isMatch) {
         
            try {
                // Crear nueva conversación real
                await createConversation(likedUser);
                
                // Mostrar notificación de match
                setMatchedProfile(likedUser);
                setShowMatchNotification(true);

            } catch (error) {
                console.error('Error al crear conversación tras match:', error);
            }
        }
        goToNextProfile();
    };

    const handleDislike = (dislikedUser: User) => {
        if (!dislikedUser?.uid) return;

        likeService.dislikeUser(dislikedUser.uid);
        goToNextProfile();
    };

    const goToNextProfile = () => {
        if (profiles.length === 0) {
            // No hay perfiles disponibles
            return;
        }
        
        if (currentProfileIndex < profiles.length - 1) {
            setCurrentProfileIndex(currentProfileIndex + 1);
        } else {
            // No volver al inicio, mantener en el último índice para mostrar mensaje
            // El renderDiscoverScreen manejará mostrar el mensaje de "no más perfiles"
            setCurrentProfileIndex(profiles.length);
        }
    };

    // Enviar un nuevo mensaje
    const pickMedia = async (type) => {
        try {
            let result;
            if (type === 'image') {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    aspect: [4, 3],
                    quality: 0.7,
                });
            } else if (type === 'video') {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Videos,
                    allowsEditing: true,
                    quality: 0.7,
                });
            }

            if (!result.canceled) {
                setSelectedMedia(result.assets[0].uri);
                setMediaType(type);
            }
        } catch (error) {
            console.error('Error picking media:', error);
        }
    };

    const clearSelectedMedia = () => {
        setSelectedMedia(null);
        setMediaType(null);
    };

    const handleTextInputChange = (text) => {
        setNewMessage(text);

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        if (selectedChat) {
            updateTypingStatus(selectedChat.id, true);

            typingTimeoutRef.current = setTimeout(() => {
                updateTypingStatus(selectedChat.id, false);
            }, 3000);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !selectedMedia) return;

        try {
            const messageData = {
                text: newMessage,
                media: selectedMedia,
                mediaType: mediaType,
            };

            if (selectedChat?.id) {
                await sendMessage(selectedChat.id, messageData);
            }

            setNewMessage('');
            clearSelectedMedia();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Referencia para el ScrollView
    const scrollViewRef = useRef<ScrollView>(null);

    // Efecto para hacer scroll al final cuando hay nuevos mensajes
    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [messages, selectedChat]);

    // Escuchar mensajes de la conversación seleccionada
    useEffect(() => {
        if (selectedChat?.id) {
            listenForMessages(selectedChat.id);
        } 

        // Dejar de escuchar cuando el componente se desmonte o el chat cambie
        return () => {
            if (selectedChat?.id) {
                stopListeningForMessages(selectedChat.id);
            }
        };
    }, [selectedChat]);

    const renderChatScreen = () => {
        const chatMessages = messages;
        const isOnline = selectedChat ? isUserOnline(selectedChat.partnerUid) : false;
        const isPartnerTyping = selectedChat ? typingUsers[selectedChat.id] : false;

        return (
            <View style={styles.chatContainer}>
                <ChatHeader
                    partner={selectedChat?.partner}
                    isOnline={isOnline}
                    onBack={() => setSelectedChat(null)}
                />
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {chatMessages.map((message) => (
                        <MessageBubble key={message.id} sent={message.user?._id === currentUser?.uid} timestamp={formatTimestamp(message.createdAt)}>
                            {!!message.media && !!message.mediaType && (
                                <MediaPreview uri={message.media} type={message.mediaType} />
                            )}
                            {!!message.text && message.text}
                        </MessageBubble>
                    ))}
                </ScrollView>
                {isPartnerTyping && (
                    <View style={styles.typingIndicatorContainer}>
                        <Text style={styles.typingIndicatorText}>{selectedChat.name} está escribiendo...</Text>
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

    const renderDiscoverScreen = () => {
        if (loadingProfiles) {
            return (
                <View style={styles.placeholderContainer}>
                    <ActivityIndicator size="large" color="#FF5A5F" />
                    <Text style={styles.placeholderText}>Buscando perfiles...</Text>
                </View>
            );
        }

        if (profiles.length === 0) {
            return (
                <View style={styles.noProfilesContainer}>
                    <Text style={styles.noProfilesEmoji}>😢</Text>
                    <Text style={styles.noProfilesTitle}>No hay más perfiles</Text>
                    <Text style={styles.noProfilesSubtitle}>Has visto todos los perfiles disponibles. ¡Vuelve más tarde para ver gente nueva!</Text>
                    <TouchableOpacity style={styles.refreshButton} onPress={loadProfiles}>
                        <Text style={styles.refreshButtonText}>Buscar de nuevo</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        const currentProfile = profiles[currentProfileIndex];

        // Asegurarse de que el perfil actual existe antes de renderizar
        if (!currentProfile) {
            return (
                <View style={styles.noProfilesContainer}>
                    <Text style={styles.noProfilesEmoji}>😢</Text>
                    <Text style={styles.noProfilesTitle}>No hay más perfiles</Text>
                    <Text style={styles.noProfilesSubtitle}>Has visto todos los perfiles disponibles. ¡Vuelve más tarde para ver gente nueva!</Text>
                    <TouchableOpacity style={styles.refreshButton} onPress={loadProfiles}>
                        <Text style={styles.refreshButtonText}>Buscar de nuevo</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <View style={styles.discoverContainer}>
                <View style={styles.profileCard}>
                    <Image source={{ uri: currentProfile.profilePictureUrl }} style={styles.profileImage} />
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{currentProfile.name}, {currentProfile.age}</Text>
                        <View style={styles.locationContainer}>
                            <MapPin size={16} color="#666" />
                            <Text style={styles.locationText}>{formatLocation(currentProfile.location)}</Text>
                        </View>
                        <Text style={styles.bioText}>{currentProfile.bio}</Text>
                    </View>
                </View>
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.actionButton, styles.dislikeButton]} onPress={() => handleDislike(currentProfile)}>
                        <X size={32} color="#F44336" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.likeButton]} onPress={() => handleLike(currentProfile)}>
                        <Heart size={32} color="#4CAF50" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderMatchesList = () => {
        const allConversations = [...conversations, ...matches.filter(m => !conversations.some(c => c.partnerUid === m.uid)).map(m => ({ partner: m, lastMessage: { text: '¡Nuevo match! Di hola 👋' }, unreadCount: 0, partnerUid: m.uid, id: m.uid, name: m.name, profilePictureUrl: m.profilePictureUrl }))];

        if (allConversations.length === 0) {
            return (
                <View style={styles.placeholderContainer}>
                    <Text style={styles.placeholderText}>Aún no tienes matches</Text>
                    <Text style={styles.placeholderSubtext}>¡Sigue deslizando para encontrar a alguien especial!</Text>
                </View>
            );
        }

        return (
            <ScrollView style={styles.matchesList}>
                {allConversations.map((convo) => (
                    <MatchItem
                        key={convo.id}
                        conversation={convo}
                        onPress={() => setSelectedChat(convo)}
                        isOnline={isUserOnline(convo.partnerUid)}
                    />
                ))}
            </ScrollView>
        );
    };

    const renderSettingsScreen = () => {
        if (!currentUser) return null;
        return (
            <View style={styles.settingsContainer}>
                <View style={styles.userProfile}>
                    <Image source={{ uri: currentUser.profilePictureUrl }} style={styles.userAvatar} />
                    <Text style={styles.userName}>{currentUser.name}</Text>
                    <Text style={styles.userEmail}>{currentUser.email}</Text>
                    <Text style={styles.userAge}>Edad: {currentUser.age}</Text>
                    <Text style={styles.userBio}>{currentUser.bio}</Text>
                </View>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                </TouchableOpacity>
            </View>
        );
    };


    const renderMainContent = () => {
        if (selectedChat) {
            return renderChatScreen();
        }

        let content;
        switch (currentScreen) {
            case 'discover':
                content = renderDiscoverScreen();
                break;
            case 'messages':
                content = renderMatchesList();
                break;
            case 'settings':
                content = renderSettingsScreen();
                break;
            default:
                content = <Text>Pantalla no encontrada</Text>;
        }

        return (
            <>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setCurrentScreen('settings')}>
                        <UserIcon size={28} color="#ccc" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>LoveConnect</Text>
                    <TouchableOpacity onPress={() => setCurrentScreen('messages')}>
                        <MessageCircle size={28} color="#ccc" />
                    </TouchableOpacity>
                </View>
                <ConnectionStatus isConnected={isConnected} />
                <View style={styles.content}>{content}</View>
                <BottomNav
                    current={currentScreen}
                    onChange={(screen) => setCurrentScreen(screen)}
                />
            </>
        );
    };

    if (!isLoggedIn || !currentUser) {
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
                {renderMainContent()}
                <WelcomeModal
                    visible={showWelcome}
                    onAccept={handleWelcomeAccept}
                />
                {matchedProfile && currentUser && (
                    <MatchNotification
                        visible={showMatchNotification}
                        currentUser={currentUser}
                        matchedUser={matchedProfile}
                        onClose={handleMatchNotificationClose}
                        onSendMessage={handleMatchSendMessage}
                    />
                )}
            </View>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        paddingTop: 50,
        paddingBottom: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    settingsAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginRight: 16,
    },
    settingsName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    settingsBio: {
        fontSize: 16,
        color: '#6b7280',
        marginTop: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF5A5F',
        flex: 1,
        textAlign: 'center',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    placeholderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    placeholderSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    noProfilesContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    noProfilesIcon: {
        marginBottom: 20,
    },
    noProfilesEmoji: {
        fontSize: 60,
        textAlign: 'center',
    },
    noProfilesTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    noProfilesSubtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    suggestionsContainer: {
        backgroundColor: '#f8f9fa',
        borderRadius: 15,
        padding: 20,
        marginBottom: 30,
        width: '100%',
    },
    suggestionsTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    suggestionsList: {
        alignItems: 'flex-start',
    },
    suggestionItem: {
        fontSize: 14,
        color: '#555',
        marginBottom: 8,
        lineHeight: 20,
    },
    refreshButton: {
        backgroundColor: '#FF5A5F',
        paddingHorizontal: 30,
        paddingVertical: 15,
        borderRadius: 25,
        ...Platform.select({
            ios: {
                shadowColor: '#FF5A5F',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
            web: {
                boxShadow: '0 4px 8px rgba(255, 90, 95, 0.3)',
            }
        }),
    },
    refreshButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    discoverContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
            },
            android: {
                elevation: 5,
            },
            web: {
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }
        }),
        overflow: 'hidden',
        marginBottom: 20,
        position: 'relative',
    },
    likeBadge: {
        position: 'absolute',
        top: 40,
        left: 40,
        borderWidth: 3,
        borderColor: '#4CAF50',
        padding: 10,
        borderRadius: 8,
        transform: [{ rotate: '-15deg' }],
        pointerEvents: 'none',
    },
    likeText: {
        color: '#4CAF50',
        fontSize: 32,
        fontWeight: 'bold',
    },
    nopeBadge: {
        position: 'absolute',
        top: 40,
        right: 40,
        borderWidth: 3,
        borderColor: '#F44336',
        padding: 10,
        borderRadius: 8,
        transform: [{ rotate: '15deg' }],
        pointerEvents: 'none',
    },
    nopeText: {
        color: '#F44336',
        fontSize: 32,
        fontWeight: 'bold',
    },
    profileImage: {
        width: '100%',
        height: 400,
    },
    profileInfo: {
        padding: 20,
    },
    profileName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    locationText: {
        marginLeft: 5,
        color: '#666',
    },
    bioText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    actionButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
            },
            android: {
                elevation: 5,
            },
            web: {
                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
            }
        }),
    },
    likeButton: {
        backgroundColor: 'white',
    },
    dislikeButton: {
        backgroundColor: 'white',
    },
    // Estilos para el chat
    chatContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    typingIndicatorContainer: {
    paddingHorizontal: 15,
    paddingBottom: 5,
  },
  typingIndicatorText: {
    fontStyle: 'italic',
    color: '#888',
  },
  chatHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 5,
    },
    backButtonText: {
        fontSize: 24,
        color: '#FF5A5F',
    },
    chatTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    statusRow: {
        marginTop: 2,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: '#666',
    },
    messagesContainer: {
        flex: 1,
        padding: 15,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 15,
        marginBottom: 10,
    },
    sentMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#FF5A5F',
        borderBottomRightRadius: 2,
    },
    receivedMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
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
    mediaPreviewContainer: {
        position: 'relative',
        margin: 10,
        borderRadius: 10,
        overflow: 'hidden',
        alignSelf: 'flex-start',
        backgroundColor: '#f0f0f0',
    },
    mediaThumbnail: {
        width: 100,
        height: 100,
        borderRadius: 10,
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
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mediaContainer: {
        marginBottom: 8,
        borderRadius: 12,
        overflow: 'hidden',
        maxWidth: '80%',
    },
    mediaPreview: {
        width: 250,
        height: 200,
        borderRadius: 12,
    },
    input: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: 16,
        marginHorizontal: 8,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    userAge: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    userAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 15,
        alignSelf: 'center',
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

export default App;
