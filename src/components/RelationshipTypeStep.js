import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { ArrowRight, ArrowLeft, Heart, Check, Users, MessageCircle, Coffee } from 'lucide-react-native';

const relationshipOptions = [
  {
    id: 'penpal',
    title: 'Amigo por correspondencia',
    description: 'Intercambiar mensajes y conocerse a distancia',
    icon: MessageCircle
  },
  {
    id: 'friendship',
    title: 'Amistad',
    description: 'Buscar amigos con intereses similares',
    icon: Users
  },
  {
    id: 'dating',
    title: 'Romance-citas',
    description: 'Citas casuales y explorar la química',
    icon: Coffee
  },
  {
    id: 'serious',
    title: 'Relación seria a largo plazo',
    description: 'Buscar una pareja para compromiso duradero',
    icon: Heart
  }
];

const RelationshipTypeStep = ({ userData, onNext, onBack }) => {
  const [selectedTypes, setSelectedTypes] = useState([]);

  const handleTypeToggle = (typeId) => {
    setSelectedTypes(prev => {
      if (prev.includes(typeId)) {
        return prev.filter(id => id !== typeId);
      } else {
        return [...prev, typeId];
      }
    });
  };

  const handleNext = () => {
    if (selectedTypes.length === 0) {
      Alert.alert(
        'Selección requerida',
        'Por favor selecciona al menos un tipo de relación que estés buscando.'
      );
      return;
    }

    const updatedUserData = {
      ...userData,
      relationshipTypes: selectedTypes
    };

    onNext(updatedUserData);
  };

  const renderOption = (option) => {
    const isSelected = selectedTypes.includes(option.id);
    const IconComponent = option.icon;

    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.optionContainer, isSelected && styles.optionSelected]}
        onPress={() => handleTypeToggle(option.id)}
      >
        <View style={styles.optionContent}>
          <View style={styles.optionLeft}>
            <View style={[styles.iconContainer, isSelected && styles.iconSelected]}>
              <IconComponent size={24} color={isSelected ? "#fff" : "#FF5A5F"} />
            </View>
            <View style={styles.textContainer}>
              <Text style={[styles.optionTitle, isSelected && styles.optionTitleSelected]}>
                {option.title}
              </Text>
              <Text style={[styles.optionDescription, isSelected && styles.optionDescriptionSelected]}>
                {option.description}
              </Text>
            </View>
          </View>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Check size={16} color="#fff" />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Heart size={32} color="#FF5A5F" fill="#FF5A5F" />
        <Text style={styles.title}>Tipo de Relación</Text>
        <Text style={styles.subtitle}>
          Paso 5 de 7: ¿Qué tipo de relación estás buscando?
        </Text>
        <Text style={styles.description}>
          La honestidad ayuda a todos y te permite encontrar lo que estás buscando. 
          Puedes cambiar tus preferencias en cualquier momento.
        </Text>
      </View>

      {/* Opciones de relación */}
      <View style={styles.optionsContainer}>
        <Text style={styles.instructionText}>
          Selecciona todas las opciones que te interesen (mínimo 1):
        </Text>
        {relationshipOptions.map(renderOption)}
      </View>

      {/* Resumen de selección */}
      {selectedTypes.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>✨ Has seleccionado:</Text>
          {selectedTypes.map(typeId => {
            const option = relationshipOptions.find(opt => opt.id === typeId);
            return (
              <Text key={typeId} style={styles.summaryItem}>
                • {option.title}
              </Text>
            );
          })}
        </View>
      )}

      {/* Información adicional */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>💡 Recuerda:</Text>
        <Text style={styles.infoText}>
          • Ser honesto sobre tus intenciones ayuda a encontrar personas compatibles
        </Text>
        <Text style={styles.infoText}>
          • Puedes seleccionar múltiples opciones si estás abierto a diferentes tipos de conexión
        </Text>
        <Text style={styles.infoText}>
          • Siempre puedes cambiar estas preferencias desde tu perfil
        </Text>
      </View>

      {/* Botones de navegación */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color="#666" />
          <Text style={styles.backButtonText}>Atrás</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[
            styles.nextButton, 
            selectedTypes.length === 0 && styles.nextButtonDisabled
          ]} 
          onPress={handleNext}
        >
          <Text style={styles.nextButtonText}>Continuar</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
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
  optionsContainer: {
    marginBottom: 30,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  optionContainer: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 16,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    overflow: 'hidden',
  },
  optionSelected: {
    borderColor: '#FF5A5F',
    backgroundColor: '#fff5f5',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconSelected: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  textContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  optionTitleSelected: {
    color: '#FF5A5F',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  optionDescriptionSelected: {
    color: '#FF5A5F',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  summaryContainer: {
    backgroundColor: '#e8f4fd',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  summaryItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
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
        boxShadow: '0 4px 8px rgba(255,90,95,0.3)',
      },
    }),
  },
  nextButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    marginRight: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RelationshipTypeStep;
