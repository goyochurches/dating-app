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
import { X as CloseIcon, Heart, Image as ImageIcon, MapPin, MessageCircle, Send, Settings, User, Video, X } from 'lucide-react-native';
import { ChatHeader } from './src/components/ChatHeader';
import { MatchItem } from './src/components/MatchItem';
import { MessageBubble } from './src/components/MessageBubble';
import { MediaPreview } from './src/components/MediaPreview';
import { BottomNav } from './src/components/BottomNav';
import { ConnectionStatus } from './src/components/ConnectionStatus';
import { MatchNotification } from './src/components/MatchNotification';
import LoginScreen from './src/components/LoginScreen';
import WelcomeModal from './src/components/WelcomeModal';
import { usePresence } from './src/hooks/usePresence';
import { authService } from './src/services/authService';
import { useMessaging } from './src/hooks/useMessaging';
import { likeService } from './src/services/likeService';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, State, GestureHandlerRootView } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

const formatTimestamp = (timestamp) => {
    if (!timestamp?.toDate) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const LoveConnectApp = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => authService.isLoggedIn());
    const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
    const [currentScreen, setCurrentScreen] = useState('discover');
    const [showWelcome, setShowWelcome] = useState(false);
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
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
    const [matchedProfile, setMatchedProfile] = useState(null);

    // Cargar perfiles de usuarios registrados
    const loadProfiles = async () => {
        try {
            const allUsers = await authService.getAllUsers();
            // Filtrar usuarios excluyendo el usuario actual
            const otherUsers = allUsers.filter(user => 
                currentUser && user.id !== currentUser.id
            ).map(user => {
                // Convertir location a string si es un objeto
                let locationString = 'España';
                if (user.location) {
                    if (typeof user.location === 'string') {
                        locationString = user.location;
                    } else if (typeof user.location === 'object') {
                        // Si es un objeto, construir string desde las propiedades
                        const { city, state, country } = user.location;
                        if (city && state && country) {
                            locationString = `${city}, ${state}, ${country}`;
                        } else if (city && country) {
                            locationString = `${city}, ${country}`;
                        } else if (country) {
                            locationString = country;
                        }
                    }
                }
                
                return {
                    id: user.id,
                    name: user.name,
                    age: user.age,
                    location: locationString,
                    distance: `${Math.floor(Math.random() * 10) + 1} km`,
                    bio: user.bio || 'Usuario de LoveConnect',
                    image: user.image
                };
            });
            setProfiles(otherUsers);
        } catch (error) {
            console.error('Error loading profiles:', error);
        }
    };

    // Verificar si hay usuario logueado al iniciar
    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            setIsLoggedIn(true);
            setCurrentUser(user);
            // Inicializar servicio de likes
            likeService.initialize(user.id);
        }
    }, []);

    // Cargar perfiles cuando el usuario esté logueado
    useEffect(() => {
        if (currentUser) {
            loadProfiles();
        }
    }, [currentUser]);

    // Manejar login exitoso
    const handleLoginSuccess = (user) => {
        console.log('App.tsx - handleLoginSuccess called with user:', user);
        setCurrentUser(user);
        setIsLoggedIn(true);
        
        // Inicializar servicio de likes
        likeService.initialize(user.id);
        
        // Verificar si es la primera vez del usuario
        if (authService.isFirstTime(user.id)) {
            setShowWelcome(true);
        }
        console.log('App.tsx - User logged in successfully, isLoggedIn set to true');
    };

    // Manejar aceptación de bienvenida
    const handleWelcomeAccept = () => {
        if (currentUser) {
            authService.markWelcomeSeen(currentUser.id);
        }
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
            const conversation = conversations.find(c => c.partnerId === matchedProfile.id);
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
    const [profiles, setProfiles] = useState([]);

    // Manejadores de acciones
    const handleLike = async () => {
        const currentProfile = profiles[currentProfileIndex];
        
        try {
            // Dar like al perfil
            const likeResult = await likeService.likeProfile(currentProfile.id);
            
            // Solo crear conversación y mostrar notificación si hay match mutuo
            if (likeResult.isMatch) {
                // Mostrar notificación de match
                setMatchedProfile(currentProfile);
                setShowMatchNotification(true);
                
                // Crear nueva conversación real
                await createConversation(currentProfile);
            }
            
            goToNextProfile();
        } catch (error) {
            console.error('Error handling like:', error);
            goToNextProfile();
        }
    };

    const handleDislike = () => {
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
            }, 2000); // 2 segundos de inactividad para dejar de escribir
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

            await sendMessage(selectedChat.id, messageData);

            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (selectedChat) {
                updateTypingStatus(selectedChat.id, false);
            }

            setNewMessage('');
            clearSelectedMedia();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // getRandomResponse imported from src/utils/responses

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

    // Renderizar la pantalla de chat
    const renderChatScreen = () => {
        // Los mensajes de la conversación activa ahora vienen directamente del hook
        const chatMessages = messages;
        const isOnline = selectedChat ? isUserOnline(selectedChat.partnerId) : false;


        return (
            <View style={styles.chatContainer}>
                <View style={styles.chatHeader}>
                    <TouchableOpacity
                        onPress={() => setSelectedChat(null)}
                        style={styles.backButton}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <ChatHeader title={selectedChat?.partnerName || 'Chat'} online={isOnline} />
                    <View style={{ width: 40 }} />
                </View>
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.messagesContainer}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    onContentSizeChange={() => {
                        if (scrollViewRef.current) {
                            scrollViewRef.current.scrollToEnd({ animated: true });
                        }
                    }}
                >
                                        {chatMessages.map((message) => (
                        <MessageBubble key={message.id} sent={message.user?._id === currentUser.id} timestamp={formatTimestamp(message.createdAt)}>
                            {!!message.media && !!message.mediaType && (
                                <MediaPreview uri={message.media} type={message.mediaType} />
                            )}
                            {!!message.text && message.text}
                        </MessageBubble>
                    ))}
                </ScrollView>

                {selectedMedia && (
                    <View style={styles.mediaPreviewContainer}>
                        {mediaType === 'image' ? (
                            <Image
                                source={{ uri: selectedMedia }}
                                style={styles.mediaThumbnail}
                                resizeMode="cover"
                            />
                        ) : (
                            <View style={[styles.mediaThumbnail, styles.videoThumbnail]}>
                                <Video size={24} color="#fff" />
                            </View>
                        )}
                        <TouchableOpacity
                            style={styles.removeMediaButton}
                            onPress={clearSelectedMedia}
                        >
                            <CloseIcon size={16} color="#fff" />
                        </TouchableOpacity>
                    </View>
                )}
                <View style={styles.inputContainer}>
                    <TouchableOpacity
                        style={styles.mediaButton}
                        onPress={() => pickMedia('image')}
                    >
                        <ImageIcon size={24} color="#FF5A5F" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.mediaButton}
                        onPress={() => pickMedia('video')}
                    >
                        <Video size={24} color="#FF5A5F" />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        placeholder="Escribe un mensaje..."
                        value={newMessage}
                        onChangeText={handleTextInputChange}
                        onSubmitEditing={handleSendMessage}
                    />
                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSendMessage}
                        disabled={!newMessage.trim() && !selectedMedia}
                    >
                        <Send size={24} color={!newMessage.trim() && !selectedMedia ? "#ccc" : "#FF5A5F"} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Renderizar la lista de matches
    const renderMatchesList = () => (
        <ScrollView style={styles.matchesList}>
            {conversations.map((conversation) => (
                <MatchItem key={conversation.id} match={conversation} onPress={setSelectedChat} />
            ))}
        </ScrollView>
    );

    // Renderizar la pantalla de descubrimiento
    const renderDiscoverScreen = () => {
        // Verificar si hay perfiles disponibles o si hemos llegado al final
        if (!profiles || profiles.length === 0 || currentProfileIndex >= profiles.length) {
            return (
                <View style={styles.noProfilesContainer}>
                    <View style={styles.noProfilesIcon}>
                        <Text style={styles.noProfilesEmoji}>🔍</Text>
                    </View>
                    <Text style={styles.noProfilesTitle}>¡Has visto todos los perfiles!</Text>
                    <Text style={styles.noProfilesSubtitle}>
                        No hay más personas que coincidan con tus preferencias actuales
                    </Text>
                    
                    <View style={styles.suggestionsContainer}>
                        <Text style={styles.suggestionsTitle}>💡 Sugerencias para ver más perfiles:</Text>
                        <View style={styles.suggestionsList}>
                            <Text style={styles.suggestionItem}>• Aumenta tu rango de distancia</Text>
                            <Text style={styles.suggestionItem}>• Amplía tu rango de edad preferido</Text>
                            <Text style={styles.suggestionItem}>• Revisa tus filtros de búsqueda</Text>
                            <Text style={styles.suggestionItem}>• Vuelve más tarde para nuevos usuarios</Text>
                        </View>
                    </View>

                    <TouchableOpacity 
                        style={styles.refreshButton}
                        onPress={() => loadProfiles()}
                    >
                        <Text style={styles.refreshButtonText}>🔄 Actualizar perfiles</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        const profile = profiles[currentProfileIndex];
        const position = new Animated.ValueXY();

        const onGestureEvent = Animated.event(
            [{ nativeEvent: { translationX: position.x, translationY: position.y } }],
            { useNativeDriver: Platform.OS !== 'web' }
        );

        const onHandlerStateChange = (event) => {
            if (event.nativeEvent.oldState === State.ACTIVE) {
                const { translationX } = event.nativeEvent;

                if (translationX > SWIPE_THRESHOLD) {
                    // Swipe right - Like
                    swipeOut('right');
                } else if (translationX < -SWIPE_THRESHOLD) {
                    // Swipe left - Dislike
                    swipeOut('left');
                } else {
                    // Reset position if not enough swipe
                    Animated.spring(position, {
                        toValue: { x: 0, y: 0 },
                        useNativeDriver: Platform.OS !== 'web',
                    }).start();
                }
            }
        };

        const swipeOut = (direction) => {
            const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;

            Animated.timing(position, {
                toValue: { x, y: 0 },
                duration: SWIPE_OUT_DURATION,
                useNativeDriver: Platform.OS !== 'web',
            }).start(() => {
                if (direction === 'right') {
                    handleLike();
                } else {
                    handleDislike();
                }
                position.setValue({ x: 0, y: 0 });
            });
        };

        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: ['-30deg', '0deg', '30deg'],
            extrapolate: 'clamp',
        });

        const likeOpacity = position.x.interpolate({
            inputRange: [0, SCREEN_WIDTH / 4],
            outputRange: [0, 1],
            extrapolate: 'clamp',
        });

        const nopeOpacity = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 4, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <View style={styles.discoverContainer}>
                <PanGestureHandler
                    onGestureEvent={onGestureEvent}
                    onHandlerStateChange={onHandlerStateChange}
                >
                    <Animated.View
                        style={[
                            styles.profileCard,
                            {
                                transform: [
                                    { translateX: position.x },
                                    { translateY: position.y },
                                    { rotate },
                                ],
                            },
                        ]}
                    >
                        <Image
                            source={{ uri: profile.image }}
                            style={styles.profileImage}
                            resizeMode="cover"
                        />
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>
                                {profile.name}, {profile.age}
                            </Text>
                            <View style={styles.locationContainer}>
                                <MapPin size={16} color="#666" />
                                <Text style={styles.locationText}>
                                    {profile.location} • {profile.distance}
                                </Text>
                            </View>
                            <Text style={styles.bioText}>
                                {profile.bio}
                            </Text>
                        </View>

                        <Animated.View
                            style={[styles.likeBadge, { opacity: likeOpacity }]}
                        >
                            <Text style={styles.likeText}>LIKE</Text>
                        </Animated.View>

                        <Animated.View
                            style={[styles.nopeBadge, { opacity: nopeOpacity }]}
                        >
                            <Text style={styles.nopeText}>NOPE</Text>
                        </Animated.View>

                    </Animated.View>
                </PanGestureHandler>
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.dislikeButton]}
                        onPress={handleDislike}
                    >
                        <X size={32} color="#FF5A5F" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.likeButton]}
                        onPress={handleLike}
                    >
                        <Heart size={32} color="#4CAF50" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    // Renderizar la barra de navegación inferior
            // Manejar la navegación y resetear el chat si es necesario
    const handleNavigation = (screen: string) => {
        if (screen !== 'messages') {
            setSelectedChat(null);
        }
        setCurrentScreen(screen);
    };

    // Renderizar la barra de navegación inferior
    const renderBottomNav = () => (
        <BottomNav current={currentScreen} onChange={handleNavigation} />
    );

    // Si no está logueado, mostrar pantalla de login
    if (!isLoggedIn) {
        return (
            <GestureHandlerRootView style={{ flex: 1 }}>
                <LoginScreen onLoginSuccess={handleLoginSuccess} />
            </GestureHandlerRootView>
        );
    }

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>LoveConnect</Text>
                <View style={styles.userNameContainer}>
                    <Text style={styles.userNameText}>Hola, {currentUser?.name}</Text>
                </View>
            </View>

            <View style={styles.content}>
                <ConnectionStatus isConnected={isConnected} />
                {currentScreen === 'discover' && renderDiscoverScreen()}
                {currentScreen === 'messages' && (
                    selectedChat ? (
                        renderChatScreen()
                    ) : (
                        renderMatchesList()
                    )
                )}
                {currentScreen === 'settings' && (
                    <View style={styles.settingsContainer}>
                        <View style={styles.userProfile}>
                            <Text style={styles.userName}>{currentUser?.name}</Text>
                            <Text style={styles.userEmail}>{currentUser?.email}</Text>
                            <Text style={styles.userAge}>Edad: {currentUser?.age} años</Text>
                            {currentUser?.bio && (
                                <Text style={styles.userBio}>{currentUser.bio}</Text>
                            )}
                        </View>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {renderBottomNav()}
            
            <WelcomeModal 
                visible={showWelcome} 
                onAccept={handleWelcomeAccept} 
            />
            
            {matchedProfile && (
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
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF5A5F',
        flex: 1,
        textAlign: 'center',
    },
    userNameContainer: {
        position: 'absolute',
        right: 20,
        top: 70,
        paddingTop: 15,
    },
    userNameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
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
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        backgroundColor: 'white',
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
        marginRight: 10,
        fontSize: 16,
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
