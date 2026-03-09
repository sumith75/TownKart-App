import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDleJec8YsYHLNdfXKGnuVb0UytnWVadLw",
    authDomain: "townkart-99208.firebaseapp.com",
    projectId: "townkart-99208",
    storageBucket: "townkart-99208.firebasestorage.app",
    messagingSenderId: "1027137017264",
    appId: "1:1027137017264:web:2f7ce3fef5fe2755bc7275",
    measurementId: "G-B8Z36X13N6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function check() {
    await signInWithEmailAndPassword(auth, "chitturimanikanta048@gmail.com", "Mani@561");
    const uid = auth.currentUser.uid;
    console.log("UID:", uid);

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        console.log("User doc:", docSnap.data());
    } else {
        console.log("No user doc found!");
    }
    process.exit(0);
}
check();
