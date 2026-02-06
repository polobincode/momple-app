import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// User provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCwtfVUHeQbSQFB0e6AF5acpe8DDnpWJKg",
  authDomain: "momple.firebaseapp.com",
  projectId: "momple",
  storageBucket: "momple.firebasestorage.app",
  messagingSenderId: "112399320084",
  appId: "1:112399320084:web:59d32a0036eceb8a915301",
  measurementId: "G-NQNVYC774D"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
