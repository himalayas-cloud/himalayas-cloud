const sharp = require("sharp");
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

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

async function test() {
  const d = await getDoc(doc(db, "properties", "3thcsm2yTZR9EzFnEzlF"));
  const photos = d.data().photos || [];
  console.log("Original photos count:", photos.length);
  for (let i = 0; i < photos.length; i++) {
    const orig = photos[i];
    const match = orig.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
    const data = match ? match[1] : orig;
    const inputBuffer = Buffer.from(data, "base64");

    const thumbBuffer = await sharp(inputBuffer)
      .resize({ width: 400, withoutEnlargement: true })
      .jpeg({ quality: 55 })
      .toBuffer();

    console.log(
      `Photo ${i + 1}: original = ${(orig.length / 1024).toFixed(1)} KB -> thumb = ${(thumbBuffer.length / 1024).toFixed(1)} KB`
    );
  }
  process.exit(0);
}

test().catch(console.error);
