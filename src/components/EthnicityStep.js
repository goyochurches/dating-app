import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { ArrowRight, ArrowLeft, Heart, Globe, Check } from 'lucide-react-native';

const ethnicityOptions = [
  { id: 'asian', label: 'Asiático' },
  { id: 'caucasian', label: 'Caucásico / Blanco' },
  { id: 'hindu', label: 'Hindú' },
  { id: 'hispanic', label: 'Hispano / Latino' },
  { id: 'pacific', label: 'Isleño del Pacífico' },
  { id: 'mestizo', label: 'Mestizo' },
  { id: 'black', label: 'Negro' },
  { id: 'arab', label: 'Árabe' },
  { id: 'other', label: 'Otro' },
  { id: 'prefer_not_say', label: 'Prefiero no decirlo' }
];

export const EthnicityStep = ({ userData, onNext, onBack }) => {
  const [selectedEthnicity, setSelectedEthnicity] = useState('');

  const handleNext = () => {
    const updatedUserData = {
      ...userData,
      ethnicity: selectedEthnicity
    };

    onNext(updatedUserData);
  };

  const renderOption = (option) => {
    const isSelected = selectedEthnicity === option.id;

    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.optionContainer, isSelected && styles.optionSelected]}
        onPress={() => setSelectedEthnicity(option.id)}
      >
        <View style={styles.optionContent}>
          <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
            {option.label}
          </Text>
          <View style={[styles.radioButton, isSelected && styles.radioButtonSelected]}>
            {isSelected && <View style={styles.radioButtonInner} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Heart size={32} color="#FF5A5F" fill="#FF5A5F" />
        <Text style={styles.title}>Origen Étnico</Text>
        <Text style={styles.subtitle}>
          Paso 6 de 7: Tu origen étnico es principalmente...
        </Text>
        <Text style={styles.description}>
          Esta información nos ayuda a conectarte con personas que comparten tu trasfondo cultural.
        </Text>
      </View>

      {/* Icono de diversidad */}
      <View style={styles.diversityContainer}>
        <Globe size={48} color="#FF5A5F" />
        <Text style={styles.diversityText}>Celebramos la diversidad</Text>
      </View>

      {/* Opciones de origen étnico */}
      <View style={styles.optionsContainer}>
        {ethnicityOptions.map(renderOption)}
      </View>

      {/* Información adicional */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>🌍 Información:</Text>
        <Text style={styles.infoText}>
          • Esta información es opcional y privada
        </Text>
        <Text style={styles.infoText}>
          • Solo tú decides si compartirla en tu perfil
        </Text>
        <Text style={styles.infoText}>
          • Nos ayuda a crear una comunidad más inclusiva
        </Text>
        <Text style={styles.infoText}>
          • Puedes cambiar o eliminar esta información en cualquier momento
        </Text>
      </View>

      {/* Botones de navegación */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color="#666" />
          <Text style={styles.backButtonText}>Atrás</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Continuar</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Nota de privacidad */}
      <View style={styles.privacyNote}>
        <Text style={styles.privacyText}>
          🔒 Tu información étnica es completamente privada y opcional. 
          Solo se usa para mejorar tu experiencia en la aplicación.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF5A5F',
    marginTop: 10,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  diversityContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
  },
  diversityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5A5F',
    marginTop: 10,
  },
  optionsContainer: {
    marginBottom: 30,
  },
  optionContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  optionSelected: {
    borderColor: '#FF5A5F',
    backgroundColor: '#fff5f5',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#FF5A5F',
    fontWeight: 'bold',
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#FF5A5F',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF5A5F',
  },
  infoContainer: {
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 5,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  backButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF5A5F',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: '#FF5A5F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonText: {
    marginRight: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  privacyNote: {
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  privacyText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default EthnicityStep;
