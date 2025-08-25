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
import LoginScreen from './src/components/LoginScreen';
import WelcomeModal from './src/components/WelcomeModal';
import { usePresence } from './src/hooks/usePresence';
import { getRandomResponse } from './src/utils/responses';
import { authService } from './src/services/authService';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

const LoveConnectApp = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(() => authService.isLoggedIn());
    const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser());
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
    const [chatMessages, setChatMessages] = useState({
        1: [
            { id: 1, text: "¡Hola! ¿Cómo estás?", sent: false, time: "10:30 AM" },
            { id: 2, text: "¡Hola! Estoy bien, ¿y tú?", sent: true, time: "10:32 AM" },
            { id: 3, text: "¿Te gustaría salir a tomar algo?", sent: false, time: "10:33 AM" },
        ],
        2: [
            { id: 1, text: "¡Hola! ¿Quedamos hoy?", sent: false, time: "Ayer" },
            { id: 2, text: "¡Claro! ¿A qué hora?", sent: true, time: "Ayer" },
            { id: 3, text: "¿Qué tal a las 8?", sent: false, time: "Ayer" },
        ]
    });
    const [selectedChat, setSelectedChat] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [mediaType, setMediaType] = useState(null); // 'image' or 'video'

    // Presence calculation (keeps boolean up to date from lastSeen)
    const { matches: matchesWithPresence } = usePresence(matches);

    // Verificar si hay usuario logueado al iniciar
    useEffect(() => {
        const user = authService.getCurrentUser();
        if (user) {
            setIsLoggedIn(true);
            setCurrentUser(user);
        }
    }, []);

    // Manejar login exitoso
    const handleLoginSuccess = (user) => {
        setCurrentUser(user);
        setIsLoggedIn(true);
        
        // Verificar si es la primera vez del usuario
        if (authService.isFirstTime(user.id)) {
            setShowWelcome(true);
        }
    };

    // Manejar aceptación de bienvenida
    const handleWelcomeAccept = () => {
        if (currentUser) {
            authService.markWelcomeSeen(currentUser.id);
        }
        setShowWelcome(false);
    };

    // Manejar logout
    const handleLogout = () => {
        authService.logout();
        setCurrentUser(null);
        setIsLoggedIn(false);
        setCurrentScreen('discover');
    };

    // Perfiles de ejemplo
    const profiles = [
        {
            id: 1,
            name: "Isabella",
            age: 24,
            location: "Madrid",
            distance: "2 km",
            bio: "Amante del arte y los viajes. Fotógrafa en mis tiempos libres",
            image: 'https://randomuser.me/api/portraits/women/44.jpg'
        },
        {
            id: 2,
            name: "Carlos",
            age: 28,
            location: "Barcelona",
            distance: "5 km",
            bio: "Programador y amante de la naturaleza",
            image: 'https://randomuser.me/api/portraits/men/32.jpg'
        }
    ];

    // Manejadores de acciones
    const handleLike = () => {
        const currentProfile = profiles[currentProfileIndex];
        const newMatch = {
            id: currentProfile.id,
            name: currentProfile.name,
            image: currentProfile.image,
            lastMessage: "¡Tenéis un match!",
            time: "Ahora",
            online: true,
            lastSeen: new Date().toISOString()
        };

        setMatches([...matches, newMatch]);

        // Inicializar mensajes vacíos para el nuevo match
        setChatMessages(prev => ({
            ...prev,
            [currentProfile.id]: [
                {
                    id: 1,
                    text: "¡Hola! Ahora podéis chatear.",
                    sent: false,
                    time: "Ahora"
                }
            ]
        }));

        goToNextProfile();
    };

    const handleDislike = () => {
        goToNextProfile();
    };

    const goToNextProfile = () => {
        if (currentProfileIndex < profiles.length - 1) {
            setCurrentProfileIndex(currentProfileIndex + 1);
        } else {
            // Volver al primer perfil si llegamos al final
            setCurrentProfileIndex(0);
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

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !selectedMedia) return;

        const newMsg = {
            id: Date.now(),
            text: newMessage,
            sent: true,
            timestamp: new Date().toISOString(),
            media: selectedMedia,
            mediaType: mediaType,
        };

        setChatMessages(prev => ({
            ...prev,
            [selectedChat]: [...(prev[selectedChat] || []), newMsg]
        }));

        setNewMessage('');
        clearSelectedMedia();

        // Simular respuesta automática después de 1 segundo
        setTimeout(async () => {
            const responseMsg = {
                id: Date.now() + 1,
                text: getRandomResponse(),
                sent: false,
                timestamp: new Date().toISOString(),
            };

            setChatMessages(prev => ({
                ...prev,
                [selectedChat]: [...(prev[selectedChat] || []), responseMsg]
            }));
        }, 1000);
    };

    // getRandomResponse imported from src/utils/responses

    // Referencia para el ScrollView
    const scrollViewRef = useRef<ScrollView>(null);

    // Efecto para hacer scroll al final cuando hay nuevos mensajes
    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollToEnd({ animated: true });
        }
    }, [chatMessages, selectedChat]);

    // Renderizar la pantalla de chat
    const renderChatScreen = () => {
        const messages = chatMessages[selectedChat] || [];
        const match = matchesWithPresence.find(m => m.id === selectedChat);
        const isOnline = match?.online;

        const renderMessageContent = (message) => (
            <>
                {message.media && (
                    <View style={styles.mediaContainer}>
                        {message.mediaType === 'image' ? (
                            <Image
                                source={{ uri: message.media }}
                                style={styles.mediaPreview}
                                resizeMode="cover"
                            />
                        ) : (
                            <ExpoVideo
                                source={{ uri: message.media }}
                                style={styles.mediaPreview}
                                useNativeControls
                                isLooping
                            />
                        )}
                    </View>
                )}
                {message.text && (
                    <Text style={[
                        styles.messageText,
                        message.sent ? styles.sentMessageText : styles.receivedMessage
                    ]}>
                        {message.text}
                    </Text>
                )}
            </>
        );

        return (
            <View style={styles.chatContainer}>
                <View style={styles.chatHeader}>
                    <TouchableOpacity
                        onPress={() => setSelectedChat(null)}
                        style={styles.backButton}
                    >
                        <Text style={styles.backButtonText}>←</Text>
                    </TouchableOpacity>
                    <ChatHeader title={match?.name || 'Chat'} online={isOnline} />
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
                    {messages.map((message) => (
                        <MessageBubble key={message.id} sent={!!message.sent} timestamp={message.timestamp}>
                            {!!message.media && !!message.mediaType && (
                                <MediaPreview uri={message.media} type={message.mediaType} />
                            )}
                            {!!message.text && (
                                <Text style={[styles.messageText, message.sent ? styles.sentMessageText : styles.receivedMessage]}>
                                    {message.text}
                                </Text>
                            )}
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
                        onChangeText={setNewMessage}
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
            {matchesWithPresence.map((match) => (
                <MatchItem key={match.id} match={match} onPress={setSelectedChat} />
            ))}
        </ScrollView>
    );

    // Renderizar la pantalla de descubrimiento
    const renderDiscoverScreen = () => {
        const profile = profiles[currentProfileIndex];
        const position = new Animated.ValueXY();

        const onGestureEvent = Animated.event(
            [{ nativeEvent: { translationX: position.x, translationY: position.y } }],
            { useNativeDriver: true }
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
                        useNativeDriver: true,
                    }).start();
                }
            }
        };

        const swipeOut = (direction) => {
            const x = direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH;

            Animated.timing(position, {
                toValue: { x, y: 0 },
                duration: SWIPE_OUT_DURATION,
                useNativeDriver: true,
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
                            pointerEvents="none"
                        >
                            <Text style={styles.likeText}>LIKE</Text>
                        </Animated.View>

                        <Animated.View
                            style={[styles.nopeBadge, { opacity: nopeOpacity }]}
                            pointerEvents="none"
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
    const renderBottomNav = () => (
        <BottomNav current={currentScreen} onChange={setCurrentScreen} />
    );

    // Si no está logueado, mostrar pantalla de login
    if (!isLoggedIn) {
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>LoveConnect</Text>
            </View>

            <View style={styles.content}>
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
        </View>
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
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#FF5A5F',
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
    discoverContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
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
    },
    nopeText: {
        color: '#F44336',
        fontSize: 32,
        fontWeight: 'bold',
    },
    profileImage: {
        width: '100%',
        height: 400,
        resizeMode: 'cover',
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
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
