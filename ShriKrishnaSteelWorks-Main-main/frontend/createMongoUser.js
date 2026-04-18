import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import axios from "axios";

const firebaseConfig = {
  apiKey: "AIzaSyCszXf_pf2sZGDmu-ozZpzEpQUkLJs0J0c",
  authDomain: "capstone-login-a5c91.firebaseapp.com",
  projectId: "capstone-login-a5c91",
  storageBucket: "capstone-login-a5c91.firebasestorage.app",
  messagingSenderId: "341590185981",
  appId: "1:341590185981:web:30684a3d216d3975796b94",
  measurementId: "G-PDTL6MPM8Q",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function main() {
  try {
    let cred;
    try {
      cred = await signInWithEmailAndPassword(auth, "kadumanasvi9@gmail.com", "123456");
      console.log("✔ Firebase logged in with UID:", cred.user.uid);
    } catch (authErr) {
      if (authErr.code === "auth/invalid-credential" || authErr.code === "auth/user-not-found" || authErr.code === "auth/wrong-password") {
        console.log("User not found or invalid credential. Creating new account in Firebase...");
        cred = await createUserWithEmailAndPassword(auth, "kadumanasvi9@gmail.com", "123456");
        console.log("✔ Firebase user created with UID:", cred.user.uid);
      } else {
        throw authErr;
      }
    }
    
    console.log("Syncing to MongoDB...");
    const mongoRes = await axios.post("http://localhost:5000/api/users", {
      firebaseUid: cred.user.uid,
      name: "Super Admin",
      email: cred.user.email,
      role: "admin",
      company: "ShriKrishna SteelWorks",
      phone: ""
    });
    
    console.log("✔ Synced with MongoDB Backend. Role assigned:", mongoRes.data.role);

  } catch (err) {
    console.error("❌ Error setting up admin:", err.message);
    if (err.response) {
      console.error("Detailed error:", err.response.data);
    }
  }
  process.exit();
}

main();
