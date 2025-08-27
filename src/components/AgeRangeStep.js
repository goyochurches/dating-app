import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Platform
} from 'react-native';
import { ArrowRight, ArrowLeft, Users, Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export const AgeRangeStep = ({ userData, onNext, onBack }) => {
  const [ageRange, setAgeRange] = useState({
    min: 18,
    max: 35
  });

  const MIN_AGE = 18;
  const MAX_AGE = 80;
  const SLIDER_WIDTH = width - 80;

  // Calcular posición del slider basado en la edad
  const getSliderPosition = (age) => {
    return ((age - MIN_AGE) / (MAX_AGE - MIN_AGE)) * SLIDER_WIDTH;
  };

  // Calcular edad basado en la posición del slider
  const getAgeFromPosition = (position) => {
    const ratio = position / SLIDER_WIDTH;
    return Math.round(MIN_AGE + ratio * (MAX_AGE - MIN_AGE));
  };

  // Manejar cambio de edad mínima
  const handleMinAgeChange = (newMinAge) => {
    if (newMinAge >= MIN_AGE && newMinAge < ageRange.max) {
      setAgeRange(prev => ({ ...prev, min: newMinAge }));
    }
  };

  // Manejar cambio de edad máxima
  const handleMaxAgeChange = (newMaxAge) => {
    if (newMaxAge <= MAX_AGE && newMaxAge > ageRange.min) {
      setAgeRange(prev => ({ ...prev, max: newMaxAge }));
    }
  };

  // Renderizar botones de edad predefinidos
  const renderAgePresets = () => {
    const presets = [
      { label: '18-25', min: 18, max: 25 },
      { label: '26-35', min: 26, max: 35 },
      { label: '36-45', min: 36, max: 45 },
      { label: '46-55', min: 46, max: 55 },
      { label: '56+', min: 56, max: 80 }
    ];

    return (
      <View style={styles.presetsContainer}>
        <Text style={styles.presetsTitle}>Rangos populares:</Text>
        <View style={styles.presetsButtons}>
          {presets.map((preset, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.presetButton,
                ageRange.min === preset.min && ageRange.max === preset.max && styles.presetButtonSelected
              ]}
              onPress={() => setAgeRange({ min: preset.min, max: preset.max })}
            >
              <Text style={[
                styles.presetButtonText,
                ageRange.min === preset.min && ageRange.max === preset.max && styles.presetButtonTextSelected
              ]}>
                {preset.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  // Renderizar controles manuales
  const renderManualControls = () => (
    <View style={styles.manualContainer}>
      <Text style={styles.manualTitle}>O ajusta manualmente:</Text>
      
      {/* Control edad mínima */}
      <View style={styles.ageControl}>
        <Text style={styles.ageLabel}>Edad mínima:</Text>
        <View style={styles.ageButtons}>
          <TouchableOpacity
            style={styles.ageButton}
            onPress={() => handleMinAgeChange(ageRange.min - 1)}
          >
            <Text style={styles.ageButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.ageValue}>{ageRange.min}</Text>
          <TouchableOpacity
            style={styles.ageButton}
            onPress={() => handleMinAgeChange(ageRange.min + 1)}
          >
            <Text style={styles.ageButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Control edad máxima */}
      <View style={styles.ageControl}>
        <Text style={styles.ageLabel}>Edad máxima:</Text>
        <View style={styles.ageButtons}>
          <TouchableOpacity
            style={styles.ageButton}
            onPress={() => handleMaxAgeChange(ageRange.max - 1)}
          >
            <Text style={styles.ageButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.ageValue}>{ageRange.max}</Text>
          <TouchableOpacity
            style={styles.ageButton}
            onPress={() => handleMaxAgeChange(ageRange.max + 1)}
          >
            <Text style={styles.ageButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Continuar al siguiente paso
  const handleNext = () => {
    const updatedUserData = {
      ...userData,
      preferredAgeRange: {
        min: ageRange.min,
        max: ageRange.max
      }
    };

    onNext(updatedUserData);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Heart size={32} color="#FF5A5F" fill="#FF5A5F" />
        <Text style={styles.title}>Preferencias de Edad</Text>
        <Text style={styles.subtitle}>
          Paso 3 de 7: ¿Qué grupo de edad se adapta mejor a tus preferencias de citas?
        </Text>
      </View>

      {/* Visualización del rango actual */}
      <View style={styles.currentRangeContainer}>
        <View style={styles.rangeDisplay}>
          <Users size={24} color="#FF5A5F" />
          <Text style={styles.rangeText}>
            Buscando personas entre {ageRange.min} y {ageRange.max} años
          </Text>
        </View>
        
        {/* Barra visual del rango */}
        <View style={styles.rangeBar}>
          <View style={styles.rangeTrack}>
            <View 
              style={[
                styles.rangeActive,
                {
                  left: `${((ageRange.min - MIN_AGE) / (MAX_AGE - MIN_AGE)) * 100}%`,
                  width: `${((ageRange.max - ageRange.min) / (MAX_AGE - MIN_AGE)) * 100}%`
                }
              ]}
            />
          </View>
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabelText}>{MIN_AGE}</Text>
            <Text style={styles.rangeLabelText}>{MAX_AGE}</Text>
          </View>
        </View>
      </View>

      {/* Botones de rangos predefinidos */}
      {renderAgePresets()}

      {/* Controles manuales */}
      {renderManualControls()}

      {/* Información adicional */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>💡 Consejo:</Text>
        <Text style={styles.infoText}>
          Un rango más amplio te dará más opciones para encontrar a alguien especial. 
          Siempre puedes cambiar estas preferencias más tarde en tu perfil.
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
  },
  currentRangeContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
  },
  rangeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  rangeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    textAlign: 'center',
  },
  rangeBar: {
    width: '100%',
  },
  rangeTrack: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    position: 'relative',
  },
  rangeActive: {
    position: 'absolute',
    height: '100%',
    backgroundColor: '#FF5A5F',
    borderRadius: 3,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  rangeLabelText: {
    fontSize: 12,
    color: '#999',
  },
  presetsContainer: {
    marginBottom: 30,
  },
  presetsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  presetsButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  presetButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    backgroundColor: '#f9f9f9',
    minWidth: 80,
    alignItems: 'center',
  },
  presetButtonSelected: {
    backgroundColor: '#FF5A5F',
    borderColor: '#FF5A5F',
  },
  presetButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  presetButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  manualContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  manualTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  ageControl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  ageLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  ageButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  ageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF5A5F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  ageValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5A5F',
    minWidth: 30,
    textAlign: 'center',
  },
  infoContainer: {
    backgroundColor: '#e8f4fd',
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
  nextButtonText: {
    marginRight: 8,
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default AgeRangeStep;
