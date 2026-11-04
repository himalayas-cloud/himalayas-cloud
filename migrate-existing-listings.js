const sharp = require("sharp");
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  writeBatch,
  setDoc,
} = require("firebase/firestore");

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

async function createThumb(base64Str) {
  try {
    if (!base64Str || !base64Str.startsWith("data:image")) {
      return base64Str;
    }
    const match = base64Str.match(/^data:image\/[a-zA-Z+]+;base64,(.+)$/);
    const data = match ? match[1] : base64Str;
    const inputBuffer = Buffer.from(data, "base64");

    const thumbBuffer = await sharp(inputBuffer)
      .resize({ width: 400, withoutEnlargement: true })
      .jpeg({ quality: 55 })
      .toBuffer();

    return `data:image/jpeg;base64,${thumbBuffer.toString("base64")}`;
  } catch (err) {
    console.warn("Failed to create thumb, returning original:", err.message);
    return base64Str;
  }
}

async function migrate() {
  console.log("Starting migration of existing Firestore listings...");
  const snap = await getDocs(collection(db, "properties"));
  console.log(`Found ${snap.docs.length} documents.`);

  let count = 0;
  for (const d of snap.docs) {
    const data = d.data();
    const photos = data.photos || data.images || [];

    if (photos.length === 0) {
      console.log(`Doc ${d.id}: No photos found, skipping.`);
      continue;
    }

    console.log(`Processing Doc ${d.id} with ${photos.length} photos...`);
    const thumbs = [];
    for (const p of photos) {
      const t = await createThumb(p);
      thumbs.push(t);
    }

    // 1. Save full-size images to propertyImages collection
    await setDoc(
      doc(db, "propertyImages", d.id),
      {
        ownerUid: data.ownerUid || "legacy",
        images: photos,
      },
      { merge: true }
    );

    // 2. Update properties collection with lightweight thumbs array
    await setDoc(
      doc(db, "properties", d.id),
      {
        thumbs: thumbs,
        coverThumb: thumbs[0] || "",
        imageCount: thumbs.length,
        photos: thumbs, // set photos to thumbs as well for backward compatibility
      },
      { merge: true }
    );

    count++;
    console.log(`Migrated Doc ${d.id} (${count}/${snap.docs.length}) successfully.`);
  }

  console.log(`Migration finished! Successfully processed ${count} listings.`);
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
