// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCmbPBwXznXnnX4hbp4OFC1hhB6pmW9wh8",
  authDomain: "dating-app-43c65.firebaseapp.com",
  projectId: "dating-app-43c65",
  storageBucket: "dating-app-43c65.firebasestorage.app",
  messagingSenderId: "10509867796",
  appId: "1:10509867796:web:521e5ef73dfeb9ba898001"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Firebase Storage and get a reference to the service
const storage = getStorage(app);

export { db, auth, storage };
