// firestore-test.js
import db from "./firebase.js";

try {
  await db.collection("test").doc("demo").set({ value: "ok" });
  console.log("✅ Firestore bağlantısı başarılı.");
} catch (err) {
  console.error("❌ Firestore hatası:", err);
}
