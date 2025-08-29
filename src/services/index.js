// Servicios principales
export { default as AuthService } from './authService';
export { presenceService } from './presenceService';

// Instancia singleton del servicio de autenticación
import AuthService from './authService';
export const authService = new AuthService();