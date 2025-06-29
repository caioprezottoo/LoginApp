// firebase.js (Compat Mode with Firestore)
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDiF9iKBehp1WPIt7-VA87BL5UIm18rP3M",
    authDomain: "fir-reactnative-70c38.firebaseapp.com",
    projectId: "fir-reactnative-70c38",
    storageBucket: "fir-reactnative-70c38.firebasestorage.app",
    messagingSenderId: "13232464010",
    appId: "1:13232464010:web:dc0a3d08d9578ee10c8d73"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const firestore = firebase.firestore();
export default firebase;