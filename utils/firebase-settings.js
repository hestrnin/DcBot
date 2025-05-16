import db from "../firebase.js";

export async function saveSettings(guildId, data) {
  try {
    await db.collection("settings").doc(guildId).set(data, { merge: true});
  } catch (err) {
    console.error("Firestore yazma hatası:", err);
  }
}

export async function getSettings(guildId) {
  try {
    const doc = await db.collection("settings").doc(guildId).get();
    return doc.exists ? doc.data() : null;
  } catch (err) {
    console.error("Firestore yazma hatası:", err);
  }
}
