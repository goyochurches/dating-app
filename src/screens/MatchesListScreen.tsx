import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { MatchItem } from '../components/MatchItem';
import { User, Match, Conversation } from '../types';

interface MatchesListScreenProps {
  conversations: Conversation[];
  matches: Match[];
  currentUser: User;
  handleSelectChat: (conversation: any) => void;
  isUserOnline: (userId: string) => boolean;
}

const MatchesListScreen: React.FC<MatchesListScreenProps> = ({
  conversations,
  matches,
  currentUser,
  handleSelectChat,
  isUserOnline,
}) => {
  // Debug: verificar datos originales
  console.log('MatchesListScreen - conversations:', conversations);
  console.log('MatchesListScreen - matches:', matches);
  console.log('MatchesListScreen - matches length:', matches.length);
  matches.forEach((match, index) => {
    console.log(`Match ${index}:`, {
      name: match.name,
      profilePictureUrl: match.profilePictureUrl,
      profileImage: match.profileImage,
      uid: match.uid,
      allKeys: Object.keys(match)
    });
  });

  const allConversations = [
    ...conversations.map(c => {
      console.log('Conversation partnerAvatar:', c.partnerAvatar);
      console.log('Conversation partnerUid:', c.partnerUid);
      
      // Buscar el match correspondiente para obtener la imagen
      const matchingUser = matches.find(m => m.uid === c.partnerUid);
      console.log('Usuario matching encontrado:', matchingUser);
      
      const avatarUrl = matchingUser?.profileImage || matchingUser?.profilePictureUrl || c.partnerAvatar;
      console.log('Avatar para conversación:', avatarUrl ? 'SÍ HAY IMAGEN' : 'NO HAY IMAGEN');
      
      return {
        ...c,
        partner: {
          name: c.partnerName,
          avatar: avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.partnerName)}&background=FF5A5F&color=fff&size=60`,
        },
      };
    }),
    ...matches
      .filter(m => {
        const isFiltered = !conversations.some(c => c.partnerUid === m.uid);
        console.log(`Match ${m.name} será incluido:`, isFiltered);
        return isFiltered;
      })
      .map(m => {
        console.log('Match data completo:', m);
        console.log('Match profilePictureUrl:', m.profilePictureUrl);
        console.log('Match profileImage:', m.profileImage);
        // Priorizar profileImage (base64) sobre profilePictureUrl
        const avatarUrl = m.profileImage || m.profilePictureUrl;
        console.log('Avatar final asignado:', avatarUrl ? 'SÍ HAY IMAGEN' : 'NO HAY IMAGEN');
        console.log('Tipo de avatar:', typeof avatarUrl);
        
        // Solo usar placeholder si realmente no hay imagen
        const finalAvatar = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=FF5A5F&color=fff&size=60`;
        
        const result = {
          id: [currentUser.uid, m.uid].sort().join('_'),
          partnerUid: m.uid,
          partner: {
            name: m.name,
            avatar: finalAvatar,
          },
          lastMessage: '¡Nuevo match! Di hola 👋',
          time: 'Ahora',
        };
        
        console.log('RESULTADO FINAL del mapeo:', result);
        console.log('AVATAR EN RESULTADO:', result.partner.avatar);
        return result;
      }),
  ];

  if (allConversations.length === 0) {
    return (
      <View style={styles.placeholderContainer}>
        <Text style={styles.placeholderText}>Aún no tienes matches</Text>
        <Text style={styles.placeholderSubtext}>¡Sigue deslizando para encontrar a alguien especial!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>TUS MATCHES</Text>
      </View>
      <ScrollView style={styles.matchesList}>
        {allConversations.map((convo) => (
          <MatchItem
            key={convo.id}
            conversation={convo}
            onPress={() => handleSelectChat(convo)}
            isOnline={isUserOnline(convo.partnerUid)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5A5F',
    textAlign: 'center',
  },
  matchesList: {
    flex: 1,
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
});

export default MatchesListScreen;
