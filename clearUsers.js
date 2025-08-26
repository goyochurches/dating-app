// Script para limpiar usuarios registrados y mantener solo los 3 de ejemplo
import { authService } from './src/services/authService.js';

async function clearAllRegisteredUsers() {
  try {
    console.log('Limpiando usuarios registrados...');
    await authService.clearRegisteredUsers();
    console.log('✅ Usuarios limpiados exitosamente');
    console.log('Solo quedan los 3 usuarios de ejemplo:');
    console.log('- ana@ejemplo.com (Ana García)');
    console.log('- carlos@ejemplo.com (Carlos López)');
    console.log('- maria@ejemplo.com (María Rodríguez)');
  } catch (error) {
    console.error('❌ Error limpiando usuarios:', error);
  }
}

clearAllRegisteredUsers();
