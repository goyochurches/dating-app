import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { Heart, Users, Star, CheckCircle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

export const WelcomeModal = ({ visible, onAccept }) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Heart size={40} color="#FF5A5F" fill="#FF5A5F" />
                <Text style={styles.appName}>LoveConnect</Text>
              </View>
              <Text style={styles.welcomeTitle}>¡Bienvenido!</Text>
            </View>

            {/* Main Content */}
            <View style={styles.content}>
              <Text style={styles.subtitle}>
                Una aplicación de citas diferente
              </Text>
              
              <Text style={styles.description}>
                LoveConnect es una plataforma diseñada especialmente para personas que buscan 
                relaciones auténticas basadas en valores profundos y principios espirituales.
              </Text>

              {/* Features */}
              <View style={styles.featuresContainer}>
                <View style={styles.feature}>
                  <Users size={24} color="#4CAF50" />
                  <Text style={styles.featureText}>
                    <Text style={styles.featureBold}>Comunidad de valores:</Text> Conecta con personas 
                    que comparten tus principios morales y éticos
                  </Text>
                </View>

                <View style={styles.feature}>
                  <Star size={24} color="#FF9800" />
                  <Text style={styles.featureText}>
                    <Text style={styles.featureBold}>Fe y espiritualidad:</Text> Encuentra a alguien 
                    que comprenda y respete tu práctica religiosa
                  </Text>
                </View>

                <View style={styles.feature}>
                  <Heart size={24} color="#E91E63" />
                  <Text style={styles.featureText}>
                    <Text style={styles.featureBold}>Relaciones auténticas:</Text> Construye conexiones 
                    profundas y duraderas basadas en el respeto mutuo
                  </Text>
                </View>
              </View>

              <View style={styles.finalMessage}>
                <Text style={styles.finalText}>
                  Aquí encontrarás personas que, como tú, buscan algo más que una simple cita. 
                  Buscamos construir relaciones significativas fundamentadas en valores compartidos.
                </Text>
              </View>
            </View>

            {/* Accept Button */}
            <TouchableOpacity 
              style={styles.acceptButton} 
              onPress={onAccept}
              activeOpacity={0.8}
            >
              <CheckCircle size={24} color="#fff" />
              <Text style={styles.acceptButtonText}>¡Comenzar mi experiencia!</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Al continuar, confirmas que compartes estos valores y estás listo para encontrar conexiones auténticas
            </Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    maxWidth: 400,
    width: '100%',
    maxHeight: height * 0.9,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
      },
      web: {
        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
      },
    }),
  },
  scrollContent: {
    padding: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF5A5F',
    marginLeft: 10,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    marginBottom: 25,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF5A5F',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 25,
  },
  featuresContainer: {
    marginBottom: 25,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginLeft: 15,
  },
  featureBold: {
    fontWeight: 'bold',
    color: '#333',
  },
  finalMessage: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF5A5F',
  },
  finalText: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  acceptButton: {
    backgroundColor: '#FF5A5F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 15,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#FF5A5F',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0 6px 12px rgba(255,90,95,0.4)',
      },
    }),
    transform: [{ scale: 1 }],
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default WelcomeModal;
