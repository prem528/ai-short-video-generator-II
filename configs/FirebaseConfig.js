// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCWBmJQenFvVJ2Fvc_DK7Q_Z-J2q56uRRg",
  authDomain: "ai-short-videos-28e83.firebaseapp.com",
  projectId: "ai-short-videos-28e83",
  storageBucket: "ai-short-videos-28e83.firebasestorage.app",
  messagingSenderId: "783408802324",
  appId: "1:783408802324:web:60435a845939253bf75501",
  measurementId: "G-ZJ3JJZV8ML"
};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
