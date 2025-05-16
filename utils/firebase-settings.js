import db from "../firebase.js";

export async function saveSettings(guildId, data) {
  await db.collection("settings").doc(guildId).set(data, { merge: true });
}

export async function getSettings(guildId) {
  const doc = await db.collection("settings").doc(guildId).get();
  return doc.exists ? doc.data() : null;
}
