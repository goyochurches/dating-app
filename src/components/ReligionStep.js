import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput
} from 'react-native';
import { ArrowRight, ArrowLeft, Heart, Church, Search } from 'lucide-react-native';

const religionOptions = [
  // Cristianas
  { id: 'christian_salvation_army', label: 'Cristiana - Ejército de la Salvación', category: 'Cristiana' },
  { id: 'christian_united_church', label: 'Cristiana - Iglesia Unida', category: 'Cristiana' },
  { id: 'christian_seventh_day', label: 'Cristiano - Adventista del Séptimo Día', category: 'Cristiana' },
  { id: 'christian_amish', label: 'Cristiano - Amish', category: 'Cristiana' },
  { id: 'christian_berean', label: 'Cristiano - Bereano', category: 'Cristiana' },
  { id: 'christian_brethren', label: 'Cristiano - Brethren', category: 'Cristiana' },
  { id: 'christian_church_christ', label: 'Cristiano - Iglesia de Cristo', category: 'Cristiana' },
  { id: 'christian_reformed', label: 'Cristiano - Iglesia reformada', category: 'Cristiana' },
  { id: 'christian_adventist', label: 'Cristiano - adventista', category: 'Cristiana' },
  { id: 'christian_anabaptist', label: 'Cristiano - anabaptista', category: 'Cristiana' },
  { id: 'christian_anglican', label: 'Cristiano - anglicano', category: 'Cristiana' },
  { id: 'christian_apostolic', label: 'Cristiano - apostólico', category: 'Cristiana' },
  { id: 'christian_assembly_god', label: 'Cristiano - asamblea de Dios', category: 'Cristiana' },
  { id: 'christian_baptist', label: 'Cristiano - baptista', category: 'Cristiana' },
  { id: 'christian_catholic', label: 'Cristiano - católico', category: 'Cristiana' },
  { id: 'christian_evangelical', label: 'Cristiano - evangélico', category: 'Cristiana' },
  { id: 'christian_hillsong', label: 'Cristiano - hillsong', category: 'Cristiana' },
  { id: 'christian_lds', label: 'Cristiano - iglesia de los santos de los últimos días', category: 'Cristiana' },
  { id: 'christian_episcopal', label: 'Cristiano - iglesia episcopal', category: 'Cristiana' },
  { id: 'christian_lutheran', label: 'Cristiano - iglesia luterana', category: 'Cristiana' },
  { id: 'christian_mennonite', label: 'Cristiano - menonita', category: 'Cristiana' },
  { id: 'christian_methodist', label: 'Cristiano - metodista', category: 'Cristiana' },
  { id: 'christian_nazarene', label: 'Cristiano - nazareno', category: 'Cristiana' },
  { id: 'christian_orthodox', label: 'Cristiano - ortodoxo', category: 'Cristiana' },
  { id: 'christian_pentecostal', label: 'Cristiano - pentecostal', category: 'Cristiana' },
  { id: 'christian_presbyterian', label: 'Cristiano - presbiteriano', category: 'Cristiana' },
  { id: 'christian_protestant', label: 'Cristiano - protestante', category: 'Cristiana' },
  { id: 'christian_non_denominational', label: 'Cristiano - sin denominación', category: 'Cristiana' },
  { id: 'christian_jehovah', label: 'Cristiano - testigo de jehova', category: 'Cristiana' },
  { id: 'christian_other', label: 'Cristiano - otro', category: 'Cristiana' },
  
  // Otras religiones
  { id: 'bahaista', label: 'Bahaista', category: 'Otras' },
  { id: 'budista', label: 'Budista', category: 'Otras' },
  { id: 'hindu', label: 'Hindú', category: 'Otras' },
  { id: 'islam', label: 'Islam', category: 'Otras' },
  { id: 'jainismo', label: 'Jainismo', category: 'Otras' },
  { id: 'judio', label: 'Judío', category: 'Otras' },
  { id: 'parsi', label: 'Parsi', category: 'Otras' },
  { id: 'sintoismo', label: 'Sintoísmo', category: 'Otras' },
  { id: 'sikhismo', label: 'Sikhismo', category: 'Otras' },
  { id: 'taoismo', label: 'Taoísmo', category: 'Otras' },
  
  // Opciones generales
  { id: 'other', label: 'Otro', category: 'General' },
  { id: 'no_religion', label: 'Sin religión', category: 'General' },
  { id: 'prefer_not_say', label: 'Prefiero no decirlo', category: 'General' }
];

export const ReligionStep = ({ userData, onNext, onBack }) => {
  const [selectedReligion, setSelectedReligion] = useState('');
  const [searchText, setSearchText] = useState('');

  // Filtrar opciones basado en la búsqueda
  const filteredOptions = religionOptions.filter(option =>
    option.label.toLowerCase().includes(searchText.toLowerCase())
  );

  // Agrupar opciones por categoría
  const groupedOptions = filteredOptions.reduce((groups, option) => {
    const category = option.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(option);
    return groups;
  }, {});

  const handleNext = () => {
    if (!selectedReligion) {
      Alert.alert(
        'Selección requerida',
        'Por favor selecciona una opción religiosa o "Prefiero no decirlo".'
      );
      return;
    }

    const updatedUserData = {
      ...userData,
      religion: selectedReligion
    };

    console.log('ReligionStep - Finalizando registro con datos completos:', updatedUserData);
    onNext(updatedUserData);
  };

  const renderOption = (option) => {
    const isSelected = selectedReligion === option.id;

    return (
      <TouchableOpacity
        key={option.id}
        style={[styles.optionContainer, isSelected && styles.optionSelected]}
        onPress={() => setSelectedReligion(option.id)}
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

  const renderCategory = (categoryName, options) => (
    <View key={categoryName} style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{categoryName === 'Cristiana' ? '✝️ Creencias Cristianas' : categoryName === 'Otras' ? '🕊️ Otras Religiones' : '🌟 Opciones Generales'}</Text>
      {options.map(renderOption)}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Heart size={32} color="#FF5A5F" fill="#FF5A5F" />
        <Text style={styles.title}>Creencias Religiosas</Text>
        <Text style={styles.subtitle}>
          Paso 7 de 7: ¿Cuál de las siguientes opciones describe mejor sus creencias?
        </Text>
        <Text style={styles.description}>
          Compartir tus creencias nos ayuda a conectarte con personas que comparten tus valores espirituales.
        </Text>
      </View>

      {/* Icono de espiritualidad */}
      <View style={styles.spiritualityContainer}>
        <Church size={48} color="#FF5A5F" />
        <Text style={styles.spiritualityText}>Respetamos todas las creencias</Text>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar creencia religiosa..."
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Opciones agrupadas por categoría */}
      <View style={styles.optionsContainer}>
        {Object.entries(groupedOptions).map(([categoryName, options]) =>
          renderCategory(categoryName, options)
        )}
      </View>

      {/* Información adicional */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>🙏 Información:</Text>
        <Text style={styles.infoText}>
          • Esta información es completamente opcional y privada
        </Text>
        <Text style={styles.infoText}>
          • Te ayuda a encontrar personas con valores similares
        </Text>
        <Text style={styles.infoText}>
          • Respetamos y celebramos todas las creencias
        </Text>
        <Text style={styles.infoText}>
          • Puedes cambiar esta información en cualquier momento
        </Text>
      </View>

      {/* Botones de navegación */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowLeft size={20} color="#666" />
          <Text style={styles.backButtonText}>Atrás</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Finalizar Registro</Text>
          <ArrowRight size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Nota de privacidad */}
      <View style={styles.privacyNote}>
        <Text style={styles.privacyText}>
          🔒 Tu información religiosa es completamente privada y opcional. 
          Solo se usa para mejorar tu experiencia de conexión.
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
  spiritualityContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
  },
  spiritualityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF5A5F',
    marginTop: 10,
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f9f9f9',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  optionsContainer: {
    marginBottom: 30,
  },
  categoryContainer: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5A5F',
    marginBottom: 15,
    paddingLeft: 5,
  },
  optionContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 8,
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
    padding: 14,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    marginRight: 10,
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

export default ReligionStep;
