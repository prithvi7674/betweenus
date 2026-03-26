import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBtS2E18BEc1RPoyEdJED6JXoboyaR6IfQ",
  authDomain: "betweenus-ca598.firebaseapp.com",
  projectId: "betweenus-ca598",
  storageBucket: "betweenus-ca598.firebasestorage.app",
  messagingSenderId: "572090117717",
  appId: "1:572090117717:web:596d4bdf70a25c8f526edc",
};

export const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
