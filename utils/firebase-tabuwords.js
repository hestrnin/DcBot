import db from "../firebase.js";
import { FieldValue } from 'firebase-admin/firestore';

// Kelime ekle
export async function addTabuWordToList(listName, keyword, forbiddenWords) {
  try {
    const listRef = db.collection("tabu_lists").doc(listName);
    const listDoc = await listRef.get();

    // Liste daha önce oluşturulmamışsa boş bir obje ile başlat
    const listData = listDoc.exists ? listDoc.data() : {};

    // Aynı kelime daha önce eklenmiş mi kontrolü
    if (listData[keyword]) {
    return { success: false, reason: `'${keyword}' kelimesi bu listede zaten var.` };
    }

    // Yeni kelimeyi ekle
    const updatedData = {
        ...listData,
        [keyword]: forbiddenWords
    };

    await listRef.set(updatedData);
  return { success: true };
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