import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, ScrollView, Animated } from 'react-native';
import { Heart, X, MessageCircle, Settings, User, Star, MapPin, Camera, Send, ArrowLeft } from 'lucide-react-native';

// Componente principal de la aplicación
export default function LoveConnectApp() {
  const [currentScreen, setCurrentScreen] = useState('discover');
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [swipeAnimation, setSwipeAnimation] = useState('');
  const [chatMessages, setChatMessages] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState('');

  // Perfiles de ejemplo con fotos placeholder coloridas
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

  // Renderiza la pantalla de descubrimiento
  const renderDiscoverScreen = () => (
    <View style={styles.discoverContainer}>
      <View style={styles.profileCard}>
        <Image 
          source={{ uri: profiles[currentProfileIndex]?.image }} 
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {profiles[currentProfileIndex]?.name}, {profiles[currentProfileIndex]?.age}
          </Text>
          <View style={styles.locationContainer}>
            <MapPin size={16} color="#666" />
            <Text style={styles.locationText}>
              {profiles[currentProfileIndex]?.location} • {profiles[currentProfileIndex]?.distance}
            </Text>
          </View>
          <Text style={styles.bioText}>
            {profiles[currentProfileIndex]?.bio}
          </Text>
        </View>
      </View>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton}>
          <X size={32} color="#FF5A5F" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Heart size={32} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Renderiza la barra de navegación inferior
  const renderBottomNav = () => (
    <View style={styles.bottomNav}>
      <TouchableOpacity style={styles.navButton}>
        <User size={24} color={currentScreen === 'profile' ? '#FF5A5F' : '#666'} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton}>
        <MessageCircle size={24} color={currentScreen === 'messages' ? '#FF5A5F' : '#666'} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.navButton}>
        <Settings size={24} color={currentScreen === 'settings' ? '#FF5A5F' : '#666'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LoveConnect</Text>
      </View>
      
      <View style={styles.content}>
        {currentScreen === 'discover' && renderDiscoverScreen()}
      </View>
      
      {renderBottomNav()}
    </View>
  );
}

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
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
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
});
      interests: ["Arte", "Fotografía", "Viajes", "Yoga"],
      photos: ["bg-gradient-to-br from-pink-400 to-purple-500", "bg-gradient-to-br from-blue-400 to-cyan-500"]
    },
    {
      id: 2,
      name: "Sofía",
      age: 27,
      location: "Barcelona",
      distance: "5 km",
      bio: "Bailarina profesional 💃 Me encanta la música y cocinar",
      interests: ["Danza", "Música", "Cocina", "Fitness"],
      photos: ["bg-gradient-to-br from-emerald-400 to-teal-500", "bg-gradient-to-br from-orange-400 to-red-500"]
    },
    {
      id: 3,
      name: "Carmen",
      age: 25,
      location: "Valencia",
      distance: "8 km",
      bio: "Doctora en formación 👩‍⚕️ Amo los libros y el café ☕",
      interests: ["Medicina", "Lectura", "Café", "Senderismo"],
      photos: ["bg-gradient-to-br from-yellow-400 to-orange-500", "bg-gradient-to-br from-indigo-400 to-purple-500"]
    }
  ];

  const handleSwipe = (direction) => {
    setSwipeAnimation(direction === 'right' ? 'animate-pulse' : 'animate-bounce');
    
    setTimeout(() => {
      if (direction === 'right') {
        const newMatch = profiles[currentProfileIndex];
        setMatches([...matches, newMatch]);
        
        // Inicializar chat para el nuevo match
        setChatMessages(prev => ({
          ...prev,
          [newMatch.id]: [
            { id: 1, text: `¡Hola! Me gustó mucho tu perfil 😊`, sender: 'them', time: '14:30' }
          ]
        }));
      }
      
      setCurrentProfileIndex((prev) => (prev + 1) % profiles.length);
      setSwipeAnimation('');
    }, 300);
  };

  const sendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const message = {
        id: Date.now(),
        text: newMessage,
        sender: 'me',
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
      };
      
      setChatMessages(prev => ({
        ...prev,
        [selectedChat.id]: [...(prev[selectedChat.id] || []), message]
      }));
      setNewMessage('');
    }
  };

  const ProfileCard = ({ profile, isActive }) => (
    <div className={`absolute inset-4 bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ${swipeAnimation} ${!isActive ? 'scale-95 opacity-50' : ''}`}>
      <div className="relative h-2/3">
        <img 
          src="https://media.licdn.com/dms/image/v2/D4D03AQFWR-EnErCUVg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1646324783073?e=1758758400&v=beta&t=k2QfDiApuJiOuspErsarsKLHDoVYOZvpQcj_8tg1MZ4"
          alt={profile.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-red-500" />
          <span className="text-sm font-medium">{profile.distance}</span>
        </div>
        <div className="absolute bottom-4 left-4">
          <h2 className="text-white text-3xl font-bold drop-shadow-lg">{profile.name}, {profile.age}</h2>
          <p className="text-white/90 text-sm drop-shadow-md flex items-center">
            <MapPin className="w-4 h-4 mr-1" />
            {profile.location}
          </p>
        </div>
      </div>
      
      <div className="p-6 h-1/3 overflow-y-auto">
        <p className="text-gray-700 text-sm mb-4">{profile.bio}</p>
        <div className="flex flex-wrap gap-2">
          {profile.interests.map((interest, idx) => (
            <span key={idx} className="px-3 py-1 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const DiscoverScreen = () => (
    <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 min-h-screen relative">
      {/* Header */}
      <div className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm">
        <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
          LoveConnect
        </h1>
        <button 
          onClick={() => setCurrentScreen('profile')}
          className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Cards Stack */}
      <div className="relative h-[calc(100vh-200px)]">
        {profiles.slice(currentProfileIndex, currentProfileIndex + 2).map((profile, idx) => (
          <ProfileCard 
            key={profile.id} 
            profile={profile} 
            isActive={idx === 0}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-6">
        <button 
          onClick={() => handleSwipe('left')}
          className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transform transition-all duration-200 active:scale-95"
        >
          <X className="w-8 h-8 text-red-500" />
        </button>
        <button 
          onClick={() => handleSwipe('right')}
          className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center hover:scale-110 transform transition-all duration-200 active:scale-95"
        >
          <Heart className="w-10 h-10 text-white" />
        </button>
        <button 
          onClick={() => setCurrentScreen('matches')}
          className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transform transition-all duration-200 active:scale-95 relative"
        >
          <Star className="w-8 h-8 text-yellow-500" />
          {matches.length > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{matches.length}</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );

  const MatchesScreen = () => (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 flex items-center">
        <button 
          onClick={() => setCurrentScreen('discover')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Matches ({matches.length})</h1>
      </div>

      {/* Matches Grid */}
      <div className="p-4">
        {matches.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aún no tienes matches</p>
            <p className="text-gray-400 text-sm">¡Sigue deslizando para encontrar el amor!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {matches.map((match) => (
              <div 
                key={match.id} 
                onClick={() => {
                  setSelectedChat(match);
                  setCurrentScreen('chat');
                }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all transform hover:scale-105 cursor-pointer"
              >
                <div className="h-40 relative">
                  <img 
                    src="https://media.licdn.com/dms/image/v2/D4D03AQFWR-EnErCUVg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1646324783073?e=1758758400&v=beta&t=k2QfDiApuJiOuspErsarsKLHDoVYOZvpQcj_8tg1MZ4"
                    alt={match.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2">
                    <h3 className="text-white font-bold drop-shadow-lg">{match.name}</h3>
                    <p className="text-white/90 text-sm drop-shadow-md">{match.age} años</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const ChatScreen = () => {
    const messages = chatMessages[selectedChat?.id] || [];
    
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm p-4 flex items-center">
          <button 
            onClick={() => setCurrentScreen('matches')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="w-12 h-12 rounded-full overflow-hidden mr-3">
            <img 
              src="https://media.licdn.com/dms/image/v2/D4D03AQFWR-EnErCUVg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1646324783073?e=1758758400&v=beta&t=k2QfDiApuJiOuspErsarsKLHDoVYOZvpQcj_8tg1MZ4"
              alt={selectedChat?.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">{selectedChat?.name}</h1>
            <p className="text-sm text-green-500">En línea</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl ${
                message.sender === 'me' 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' 
                  : 'bg-white text-gray-800 shadow-sm'
              }`}>
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${message.sender === 'me' ? 'text-pink-100' : 'text-gray-400'}`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white p-4 flex items-center space-x-2 shadow-lg">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe un mensaje..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white transition-all"
          />
          <button 
            onClick={sendMessage}
            className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center hover:scale-110 transform transition-all active:scale-95"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    );
  };

  const ProfileScreen = () => (
    <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 min-h-screen">
      <div className="bg-white shadow-sm p-4 flex items-center">
        <button 
          onClick={() => setCurrentScreen('discover')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Tu Perfil</h1>
      </div>
      
      <div className="p-6 text-center">
        <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
          <img 
            src="https://media.licdn.com/dms/image/v2/D4D03AQFWR-EnErCUVg/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1646324783073?e=1758758400&v=beta&t=k2QfDiApuJiOuspErsarsKLHDoVYOZvpQcj_8tg1MZ4"
            alt="Tu perfil"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu Perfil</h2>
        <p className="text-gray-600 mb-6">Personaliza tu información para encontrar mejores matches</p>
        
        <div className="space-y-4">
          <button className="w-full bg-white rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-gray-800">Editar fotos</span>
              <Camera className="w-5 h-5 text-gray-400" />
            </div>
          </button>
          
          <button className="w-full bg-white rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-gray-800">Información personal</span>
              <User className="w-5 h-5 text-gray-400" />
            </div>
          </button>
          
          <button className="w-full bg-white rounded-xl p-4 text-left shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <span className="text-gray-800">Preferencias</span>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Bottom Navigation
  const BottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-100">
      <div className="flex justify-around py-2">
        {[
          { id: 'discover', icon: Heart, label: 'Descubrir' },
          { id: 'matches', icon: Star, label: 'Matches' },
          { id: 'profile', icon: User, label: 'Perfil' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentScreen(item.id)}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-all ${
              currentScreen === item.id 
                ? 'text-pink-600 bg-pink-50' 
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <item.icon className={`w-6 h-6 mb-1 ${currentScreen === item.id ? 'text-pink-600' : ''}`} />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative overflow-hidden">
      {currentScreen === 'discover' && <DiscoverScreen />}
      {currentScreen === 'matches' && <MatchesScreen />}
      {currentScreen === 'chat' && <ChatScreen />}
      {currentScreen === 'profile' && <ProfileScreen />}
      {currentScreen !== 'chat' && <BottomNav />}
    </div>
  );
};

export default LoveConnectApp;