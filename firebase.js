// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCsuINJLpezkLrO72ul2waIsHMrI1-Vnhc",
    authDomain: "flashcards-saas-f70c4.firebaseapp.com",
    projectId: "flashcards-saas-f70c4",
    storageBucket: "flashcards-saas-f70c4.appspot.com",
    messagingSenderId: "840872481513",
    appId: "1:840872481513:web:4ab83cc5b93ad27ee89678",
    measurementId: "G-Q5QB8JDFPK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
export {db}