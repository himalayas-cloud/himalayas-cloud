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
  console.log("TOTAL_PROPERTIES:", snap.docs.length);
  const byStatus = {};
  const byDistrict = {};
  snap.docs.forEach((d) => {
    const data = d.data();
    byStatus[data.status] = (byStatus[data.status] || 0) + 1;
    byDistrict[data.district] = (byDistrict[data.district] || 0) + 1;
    const photosCount = Array.isArray(data.photos) ? data.photos.length : 0;
    const imagesCount = Array.isArray(data.images) ? data.images.length : 0;
    const thumbsCount = Array.isArray(data.thumbs) ? data.thumbs.length : 0;
    console.log(
      `ID: ${d.id} | status: ${data.status} | district: ${data.district} | city: ${data.city} | photos: ${photosCount} | images: ${imagesCount} | thumbs: ${thumbsCount}`
    );
  });
  console.log("BY_STATUS:", byStatus);
  console.log("BY_DISTRICT:", byDistrict);
  process.exit(0);
}

run().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
