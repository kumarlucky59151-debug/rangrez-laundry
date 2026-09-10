/* ============================================================
   RANGREZ LAUNDRY — FIREBASE CONFIG
   ------------------------------------------------------------
   Yeh file already aapke Rangrez Laundry Firebase project se
   connected hai. Isko edit karne ki zaroorat nahi hai.
   ============================================================ */
const firebaseConfig = {
  apiKey: "AIzaSyBKyTiLNwGsTSKHH3fLmMvWYfQjanreGSM",
  authDomain: "rangrez-laundry.firebaseapp.com",
  projectId: "rangrez-laundry",
  storageBucket: "rangrez-laundry.firebasestorage.app",
  messagingSenderId: "242373282310",
  appId: "1:242373282310:web:5fb5f5b95853c262909187"
};

// Everything below is attached directly to "window" so the rest of the site
// can safely check window.FIREBASE_READY / use window.db even if this file
// fails to load for any reason (slow network, wrong file path, etc.) —
// that check will simply be "undefined" instead of crashing the page.
try {
  firebase.initializeApp(firebaseConfig);
  window.db = firebase.firestore();
  window.auth = firebase.auth();
  window.FIREBASE_READY = firebaseConfig.apiKey !== "PASTE_YOUR_API_KEY_HERE";
} catch (e) {
  console.error("Firebase failed to initialize:", e);
  window.FIREBASE_READY = false;
}
