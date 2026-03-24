import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import firebaseConfig from './firebase-applet-config.json';

// Use service account if available, otherwise default
const app = initializeApp({
  projectId: firebaseConfig.projectId
});

const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seedAdmin() {
  const adminEmail = 'qazxswedc7144@gmail.com';
  const userRef = db.collection('users').doc('admin-user');
  
  await userRef.set({
    email: adminEmail,
    role: 'ministry_admin',
    permissions: [
      'access_admin_dashboard',
      'manage_users',
      'manage_facilities',
      'view_reports',
      'view_patient',
      'create_patient',
      'edit_patient',
      'view_prescription',
      'create_prescription',
      'dispense_medication',
      'upload_lab_result',
      'view_radiology',
      'upload_lab_request'
    ],
    name: 'System Admin',
    createdAt: new Date().toISOString()
  });
  
  console.log('Admin user seeded successfully');
}

seedAdmin().catch(console.error);
