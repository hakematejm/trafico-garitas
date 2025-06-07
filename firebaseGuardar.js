import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { initializeApp, cert } from 'firebase-admin/app';

const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);

export const guardarCruce = async ({ garita, tipoLinea, tiempoMinutos }) => {
  try {
    await addDoc(collection(db, 'cruces'), {
      garita,
      tipoLinea,
      tiempoMinutos,
      timestamp: Timestamp.now()
    });
    console.log('✅ Cruce guardado en Firebase');
  } catch (error) {
    console.error('❌ Error al guardar cruce:', error);
  }
};
