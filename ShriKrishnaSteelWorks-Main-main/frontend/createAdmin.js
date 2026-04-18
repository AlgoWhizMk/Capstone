import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import axios from "axios";

// Firebase initialization using the env keys
const firebaseConfig = {
    apiKey: "AIzaSyAFFjNynJmjT074g8i-3uoK2DONTi3LWrE",
    authDomain: "capstoneproject-f1344.firebaseapp.com",
    projectId: "capstoneproject-f1344",
    storageBucket: "capstoneproject-f1344.firebasestorage.app",
    messagingSenderId: "348371613602",
    appId: "1:348371613602:web:dce1e7e6176b5f153024fb",
    measurementId: "G-RRCCD89JX1",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
    try {
        console.log("Creating user...");
        const cred = await createUserWithEmailAndPassword(auth, "SKSWadmin@shrikrishnasteelwork.in", "sksw@sksw");
        console.log("✔ Firebase auth user created with UID:", cred.user.uid);

        await updateProfile(cred.user, { displayName: "Super Admin" });
        console.log("✔ Firebase auth profile updated");

        // Write to Firestore
        await setDoc(doc(db, "users", cred.user.uid), {
            uid: cred.user.uid,
            email: cred.user.email,
            name: "Super Admin",
            role: "admin",
            createdAt: serverTimestamp(),
        });
        console.log("✔ Firestore user profile created/updated with role: 'admin'");

        // Sync to MongoDB backend
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
    }
    process.exit();
}

main();
