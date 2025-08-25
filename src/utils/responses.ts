const RESPONSES = [
  '¡Hola! ¿Cómo estás?',
  '¡Me encanta hablar contigo!',
  '¿Qué planes tienes para hoy?',
  '¡Qué interesante! Cuéntame más.',
  '¿Te gustaría quedar algún día?',
  '¡Jajaja, qué gracioso!'
];

export function getRandomResponse(): string {
  return RESPONSES[Math.floor(Math.random() * RESPONSES.length)];
}
