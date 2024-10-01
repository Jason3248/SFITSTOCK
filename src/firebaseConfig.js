import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyCxFgrgcHkEJG40vLzdaCB2L89ELSLYmzY",
  authDomain: "sfit-stock.firebaseapp.com",
  projectId: "sfit-stock",
  storageBucket: "sfit-stock.appspot.com",
  messagingSenderId: "1047052626022",
  appId: "1:1047052626022:web:446acc270c0811e70b25a7",
  measurementId: "G-L5WKLVNE84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const storage = getStorage(app);

export { storage }