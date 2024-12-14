// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "ai-video-generator-d0362.firebaseapp.com",
  projectId: "ai-video-generator-d0362",
  storageBucket: "ai-video-generator-d0362.firebasestorage.app",
  messagingSenderId: "782622218381",
  appId: "1:782622218381:web:dd8e47d07484e63f65aac4",
  measurementId: "G-9MTF2FMMK8",
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
