import admin from 'firebase-admin';
import serviceAccount from './serviceAccountKey.json'; // ← usa tu archivo real

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const db = admin.firestore();
