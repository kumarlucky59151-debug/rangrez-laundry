const firebaseConfig = {
  apiKey: "AIzaSyBKyTiLNwGsTSKHH3fLmMvWYfQjanreGSM",
  authDomain: "rangrez-laundry.firebaseapp.com",
  projectId: "rangrez-laundry",
  storageBucket: "rangrez-laundry.firebasestorage.app",
  messagingSenderId: "242373282310",
  appId: "1:242373282310:web:5fb5f5b95853c262909187"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const FIREBASE_READY = firebaseConfig.apiKey !== "PASTE_YOUR_API_KEY_HERE";
