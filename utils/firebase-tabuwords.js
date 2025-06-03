import db from "../firebase.js";
import { FieldValue } from 'firebase-admin/firestore';

// Kelime ekle
export async function addTabuWordToList(listId, keyword, forbidden) {
  try {
    const listRef = db.collection('tabu_lists').doc(listId);
    const doc = await listRef.get();

    const newWord = { keyword, forbidden };

    if (doc.exists) {
      // Mevcut listeye ekle
      await listRef.update({
        words: FieldValue.arrayUnion(newWord),
      });
    } else {
      // Yeni liste oluştur
      await listRef.set({
        words: [newWord],
      });
    }
    return true;
  } catch (err) {
    console.error('Tabu listeye ekleme hatası:', err);
    throw err;
  }
}

// Tüm kelimeleri al
export async function getAllTabuWords() {
  try {
    const snapshot = await db.collection("tabu_words").get();
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.error("Tabu kelimeleri çekme hatası:", err);
    throw err;
  }
}
