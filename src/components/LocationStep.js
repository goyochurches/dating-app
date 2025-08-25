import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList
} from 'react-native';
import { ArrowRight, ArrowLeft, MapPin, Heart, ChevronDown } from 'lucide-react-native';

// Datos de países, estados y ciudades (muestra simplificada)
const locationData = {
  'España': {
    'Andalucía': ['Sevilla', 'Málaga', 'Córdoba', 'Granada', 'Cádiz', 'Almería', 'Huelva', 'Jaén'],
    'Cataluña': ['Barcelona', 'Tarragona', 'Lleida', 'Girona'],
    'Madrid': ['Madrid', 'Alcalá de Henares', 'Móstoles', 'Fuenlabrada', 'Leganés'],
    'Valencia': ['Valencia', 'Alicante', 'Castellón', 'Elche', 'Gandía'],
    'País Vasco': ['Bilbao', 'San Sebastián', 'Vitoria', 'Barakaldo'],
    'Galicia': ['A Coruña', 'Vigo', 'Santiago de Compostela', 'Ourense', 'Lugo'],
    'Castilla y León': ['Valladolid', 'Salamanca', 'León', 'Burgos', 'Zamora'],
    'Aragón': ['Zaragoza', 'Huesca', 'Teruel'],
    'Asturias': ['Oviedo', 'Gijón', 'Avilés'],
    'Murcia': ['Murcia', 'Cartagena', 'Lorca']
  },
  'Francia': {
    'Île-de-France': ['París', 'Versalles', 'Boulogne-Billancourt', 'Saint-Denis'],
    'Provence-Alpes-Côte d\'Azur': ['Marsella', 'Niza', 'Toulon', 'Aix-en-Provence'],
    'Auvergne-Rhône-Alpes': ['Lyon', 'Grenoble', 'Saint-Étienne', 'Annecy'],
    'Occitanie': ['Toulouse', 'Montpellier', 'Nîmes', 'Perpignan'],
    'Nouvelle-Aquitaine': ['Bordeaux', 'Limoges', 'Poitiers', 'La Rochelle']
  },
  'Italia': {
    'Lazio': ['Roma', 'Latina', 'Frosinone', 'Viterbo'],
    'Lombardía': ['Milán', 'Brescia', 'Bergamo', 'Monza'],
    'Campania': ['Nápoles', 'Salerno', 'Caserta', 'Benevento'],
    'Sicilia': ['Palermo', 'Catania', 'Messina', 'Siracusa'],
    'Veneto': ['Venecia', 'Verona', 'Padua', 'Vicenza']
  },
  'Portugal': {
    'Lisboa': ['Lisboa', 'Sintra', 'Cascais', 'Oeiras'],
    'Oporto': ['Oporto', 'Vila Nova de Gaia', 'Matosinhos', 'Gondomar'],
    'Braga': ['Braga', 'Guimarães', 'Famalicão', 'Barcelos'],
    'Aveiro': ['Aveiro', 'Águeda', 'Ovar', 'Ílhavo']
  },
  'Reino Unido': {
    'Inglaterra': ['Londres', 'Manchester', 'Birmingham', 'Liverpool', 'Bristol'],
    'Escocia': ['Edimburgo', 'Glasgow', 'Aberdeen', 'Dundee'],
    'Gales': ['Cardiff', 'Swansea', 'Newport', 'Wrexham'],
    'Irlanda del Norte': ['Belfast', 'Derry', 'Lisburn', 'Newtownabbey']
  },
  'Alemania': {
    'Baviera': ['Múnich', 'Núremberg', 'Augsburgo', 'Würzburg'],
    'Renania del Norte-Westfalia': ['Colonia', 'Düsseldorf', 'Dortmund', 'Essen'],
    'Baden-Württemberg': ['Stuttgart', 'Mannheim', 'Karlsruhe', 'Freiburg'],
    'Berlín': ['Berlín'],
    'Hamburgo': ['Hamburgo']
  },
  'México': {
    'Ciudad de México': ['Ciudad de México', 'Ecatepec', 'Guadalajara', 'Puebla'],
    'Jalisco': ['Guadalajara', 'Zapopan', 'Tlaquepaque', 'Tonalá'],
    'Nuevo León': ['Monterrey', 'Guadalupe', 'San Nicolás', 'Apodaca'],
    'Puebla': ['Puebla', 'Tehuacán', 'San Martín', 'Atlixco'],
    'Guanajuato': ['León', 'Irapuato', 'Celaya', 'Salamanca']
  },
  'Estados Unidos': {
    'California': ['Los Ángeles', 'San Francisco', 'San Diego', 'Sacramento'],
    'Texas': ['Houston', 'Dallas', 'San Antonio', 'Austin'],
    'Nueva York': ['Nueva York', 'Buffalo', 'Rochester', 'Syracuse'],
    'Florida': ['Miami', 'Tampa', 'Orlando', 'Jacksonville'],
    'Illinois': ['Chicago', 'Aurora', 'Peoria', 'Rockford']
  },
  'Argentina': {
    'Buenos Aires': ['Buenos Aires', 'La Plata', 'Mar del Plata', 'Bahía Blanca'],
    'Córdoba': ['Córdoba', 'Villa María', 'Río Cuarto', 'San Francisco'],
    'Santa Fe': ['Rosario', 'Santa Fe', 'Rafaela', 'Reconquista'],
    'Mendoza': ['Mendoza', 'San Rafael', 'Godoy Cruz', 'Maipú']
  },
  'Colombia': {
    'Bogotá': ['Bogotá', 'Soacha', 'Chía', 'Zipaquirá'],
    'Antioquia': ['Medellín', 'Bello', 'Itagüí', 'Envigado'],
    'Valle del Cauca': ['Cali', 'Palmira', 'Buenaventura', 'Tuluá'],
    'Atlántico': ['Barranquilla', 'Soledad', 'Malambo', 'Galapa']
  }
};

const distanceOptions = [50, 100, 150, 200, 250, 500, 1000];

const LocationStep = ({ userData, onNext, onBack }) => {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistance, setSelectedDistance] = useState(100);
  
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [showDistanceModal, setShowDistanceModal] = useState(false);

  // Resetear estado y ciudad cuando cambia el país
  useEffect(() => {
    if (selectedCountry) {
      setSelectedState('');
      setSelectedCity('');
    }
  }, [selectedCountry]);

  // Resetear ciudad cuando cambia el estado
  useEffect(() => {
    if (selectedState) {
      setSelectedCity('');
    }
  }, [selectedState]);

  const countries = Object.keys(locationData);
  const states = selectedCountry ? Object.keys(locationData[selectedCountry] || {}) : [];
  const cities = selectedCountry && selectedState ? locationData[selectedCountry][selectedState] || [] : [];

  const renderDropdown = (title, value, placeholder, onPress, disabled = false) => (
    <View style={styles.dropdownContainer}>
      <Text style={styles.dropdownLabel}>{title}</Text>
      <TouchableOpacity
        style={[styles.dropdown, disabled && styles.dropdownDisabled]}
        onPress={onPress}
        disabled={disabled}
      >
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
          {value || placeholder}
        </Text>
        <ChevronDown size={20} color={disabled ? "#ccc" : "#666"} />
      </TouchableOpacity>
    </View>
  );

  const renderModal = (visible, onClose, data, onSelect, title) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={styles.modalItemText}>{item}</Text>
              </TouchableOpacity>
            )}
            style={styles.modalList}
          />
        </View>
      </View>
    </Modal>
  );

  const handleNext = () => {
    console.log('LocationStep - handleNext called');
    console.log('Selected values:', { selectedCountry, selectedState, selectedCity, selectedDistance });
    
    if (!selectedCountry) {
      alert('Por favor selecciona al menos un país');
      return;
    }

    const updatedUserData = {
      ...userData,
      location: {
        country: selectedCountry,
        state: selectedState || '',
        city: selectedCity || '',
        maxDistance: selectedDistance
      }
    };

    console.log('LocationStep - calling onNext with:', updatedUserData);
    onNext(updatedUserData);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Heart size={32} color="#FF5A5F" fill="#FF5A5F" />
        <Text style={styles.title}>Ubicación Preferida</Text>
        <Text style={styles.subtitle}>
          Paso 4 de 7: ¿Cuál es el lugar preferido para encontrar pareja?
        </Text>
        <Text style={styles.description}>
          ¿Buscas a alguien cercano por conveniencia o abierto a explorar conexiones a través de las fronteras?
        </Text>
      </View>

      {/* Selección de ubicación */}
      <View style={styles.locationContainer}>
        <View style={styles.locationHeader}>
          <MapPin size={24} color="#FF5A5F" />
          <Text style={styles.locationTitle}>Selecciona tu ubicación preferida</Text>
        </View>

        {renderDropdown(
          'País',
          selectedCountry,
          'Selecciona un país',
          () => setShowCountryModal(true)
        )}

        {renderDropdown(
          'Estado/Provincia',
          selectedState,
          'Selecciona estado/provincia',
          () => setShowStateModal(true),
          !selectedCountry
        )}

        {renderDropdown(
          'Ciudad',
          selectedCity,
          'Selecciona una ciudad',
          () => setShowCityModal(true),
          !selectedState
        )}

        {/* Selector de distancia */}
        <View style={styles.distanceContainer}>
          <Text style={styles.distanceTitle}>Distancia máxima de búsqueda</Text>
          <TouchableOpacity
            style={styles.distanceSelector}
            onPress={() => setShowDistanceModal(true)}
          >
            <Text style={styles.distanceText}>{selectedDistance} km</Text>
            <ChevronDown size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Resumen de selección */}
      {selectedCountry && selectedState && selectedCity && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>📍 Tu configuración:</Text>
          <Text style={styles.summaryText}>
            Buscando en <Text style={styles.summaryHighlight}>{selectedCity}, {selectedState}, {selectedCountry}</Text>
          </Text>
          <Text style={styles.summaryText}>
            Hasta <Text style={styles.summaryHighlight}>{selectedDistance} km</Text> de distancia
          </Text>
        </View>
      )}

      {/* Información adicional */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>💡 Consejo:</Text>
        <Text style={styles.infoText}>
          Una distancia mayor te dará más opciones, pero considera la practicidad para encuentros reales. 
          Siempre puedes cambiar estas preferencias más tarde.
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

      {/* Modales */}
      {renderModal(
        showCountryModal,
        () => setShowCountryModal(false),
        countries,
        setSelectedCountry,
        'Selecciona un país'
      )}

      {renderModal(
        showStateModal,
        () => setShowStateModal(false),
        states,
        setSelectedState,
        'Selecciona estado/provincia'
      )}

      {renderModal(
        showCityModal,
        () => setShowCityModal(false),
        cities,
        setSelectedCity,
        'Selecciona una ciudad'
      )}

      {renderModal(
        showDistanceModal,
        () => setShowDistanceModal(false),
        distanceOptions.map(d => `${d} km`),
        (item) => setSelectedDistance(parseInt(item)),
        'Selecciona distancia máxima'
      )}
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
  locationContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  dropdownContainer: {
    marginBottom: 15,
  },
  dropdownLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dropdownDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e0e0e0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  dropdownPlaceholder: {
    color: '#999',
  },
  distanceContainer: {
    marginTop: 10,
  },
  distanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  distanceSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF5A5F',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  distanceText: {
    fontSize: 16,
    color: '#FF5A5F',
    fontWeight: '600',
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
  summaryText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
    lineHeight: 20,
  },
  summaryHighlight: {
    color: '#FF5A5F',
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#666',
  },
  modalList: {
    maxHeight: 400,
  },
  modalItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default LocationStep;
