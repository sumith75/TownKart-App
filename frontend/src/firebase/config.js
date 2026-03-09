import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDleJec8YsYHLNdfXKGnuVb0UytnWVadLw",
    authDomain: "townkart-99208.firebaseapp.com",
    projectId: "townkart-99208",
    storageBucket: "townkart-99208.firebasestorage.app",
    messagingSenderId: "1027137017264",
    appId: "1:1027137017264:web:2f7ce3fef5fe2755bc7275",
    measurementId: "G-B8Z36X13N6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
});

export default app;