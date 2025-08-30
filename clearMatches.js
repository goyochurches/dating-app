// Script para limpiar todos los matches, likes y dislikes de la base de datos
import { db } from './src/services/firebase.js';
import { collection, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';

const clearMatches = async () => {
  console.log('🧹 Iniciando limpieza de matches, likes y dislikes...');

  try {
    // Función para borrar una colección completa
    const deleteCollection = async (collectionName) => {
      console.log(`📋 Limpiando colección: ${collectionName}`);
      
      const querySnapshot = await getDocs(collection(db, collectionName));
      
      if (querySnapshot.empty) {
        console.log(`✅ La colección ${collectionName} ya está vacía`);
        return;
      }

      // Firebase permite máximo 500 operaciones por batch
      const batches = [];
      let currentBatch = writeBatch(db);
      let operationCount = 0;
      let totalDocs = 0;

      querySnapshot.forEach((document) => {
        if (operationCount === 500) {
          // Guardar el batch actual y crear uno nuevo
          batches.push(currentBatch);
          currentBatch = writeBatch(db);
          operationCount = 0;
        }
        
        currentBatch.delete(doc(db, collectionName, document.id));
        operationCount++;
        totalDocs++;
      });

      // Agregar el último batch si tiene operaciones
      if (operationCount > 0) {
        batches.push(currentBatch);
      }

      // Ejecutar todos los batches
      console.log(`🔄 Borrando ${totalDocs} documentos en ${batches.length} lote(s)...`);
      
      for (const batch of batches) {
        await batch.commit();
      }

      console.log(`✅ Se borraron ${totalDocs} documentos de ${collectionName}`);
    };

    // Limpiar todas las colecciones relacionadas con matches
    await deleteCollection('matches');
    await deleteCollection('likes');  
    await deleteCollection('dislikes');

    // Opcional: también limpiar conversaciones de chat si existen
    console.log('🗨️ Verificando conversaciones...');
    try {
      await deleteCollection('conversations');
      await deleteCollection('messages');
    } catch (error) {
      console.log('ℹ️ No se encontraron conversaciones o mensajes para limpiar');
    }

    console.log('🎉 ¡Limpieza completada exitosamente!');
    console.log('📝 Ahora todos los usuarios pueden hacer match nuevamente con cualquier persona');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    process.exit(1);
  }
};

// Ejecutar el script
clearMatches().then(() => {
  console.log('✨ Script de limpieza terminado');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Error ejecutando el script:', error);
  process.exit(1);
});