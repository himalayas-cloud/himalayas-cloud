const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAkP-fay54DVjH3YlA-yMPtqhVR1y5LYM4",
  authDomain: "rent-himalayas.firebaseapp.com",
  projectId: "rent-himalayas",
  storageBucket: "rent-himalayas.firebasestorage.app",
  messagingSenderId: "776510304323",
  appId: "1:776510304323:web:e00a9446ce4ee52b1130d2",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, "properties"));
  let totalBytes = 0;
  for (const d of snap.docs) {
    const data = d.data();
    const photos = data.photos || [];
    const bytes = photos.reduce((acc, p) => acc + p.length, 0);
    totalBytes += bytes;
    console.log(`Doc ${d.id}: ${photos.length} photos, ${(bytes / 1024).toFixed(1)} KB`);
  }
  console.log(`TOTAL across all docs: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  process.exit(0);
}

run();
