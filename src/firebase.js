import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAluRQGOINapX8-TgyUa17PG5Zl3mynDrM",
  authDomain: "votacao-fonacon.firebaseapp.com",
  databaseURL: "https://votacao-fonacon-default-rtdb.firebaseio.com",
  projectId: "votacao-fonacon",
  storageBucket: "votacao-fonacon.firebasestorage.app",
  messagingSenderId: "486696695846",
  appId: "1:486696695846:web:f2dbe2deaf93c816480ee7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
