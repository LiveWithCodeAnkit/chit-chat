import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyBzRbpemqZ7akb_CWIix69F7SRGzKiiqmU",
    authDomain: "chat-app-liveankit.firebaseapp.com",
    projectId: "chat-app-liveankit",
    storageBucket: "chat-app-liveankit.appspot.com",
    messagingSenderId: "753343913547",
    appId: "1:753343913547:web:322788002d54dca69ab7ce",
  
};
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);