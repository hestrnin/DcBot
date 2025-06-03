import db from "../firebase.js";

// Kelime ekle
export async function addTabuWordToList(listName, keyword, forbiddenWords) {
  try {
    const listRef = db.collection("tabu_lists").doc(listName);
    const listDoc = await listRef.get();

    // Liste daha önce oluşturulmamışsa boş bir obje ile başlat
    const listData = listDoc.exists ? listDoc.data() : {};

    // Yeni kelimeyi ekle
    const updatedData = {
        ...listData,
        [keyword]: forbiddenWords
    };

    await listRef.set(updatedData);
    
  } catch (err) {
    console.error('Tabu listeye ekleme hatası:', err);
    throw err;
  }
}

//Toplu Kelime Girme
export async function topluTabuKelimeleriEkle(kelimeListesi) {
  for (const word of kelimeListesi) {
    const listeAdi = word.liste || "Genel"; // Liste adı yoksa 'Genel' varsayılan

    const docRef = db.collection("tabu_lists").doc(listeAdi); // Belirli liste dokümanı
    const docSnap = await docRef.get(); // Liste dokümanını çek

    const kelimeler = docSnap.exists ? docSnap.data() : {}; // Eğer varsa, içeriğini al

    const mevcutKelimeler = Object.keys(kelimeler).map(k => k.toLowerCase());
    const yeniKelime = word.keyword.toLowerCase(); // Anahtar (keyword) küçük harfe çevrilir (çakışma önleme)

    // Eğer bu keyword zaten varsa atla
    if (mevcutKelimeler.includes(yeniKelime)) {
      console.log(`⚠️ '${word.keyword}' kelimesi '${listeAdi}' listesinde zaten var, atlandı.`);
      continue;
    }

    // Yeni kelimeyi listeye ekle
    mevcutKelimeler[yeniKelime] = word.yasaklar;

    // Güncellenmiş listeyi veritabanına yaz
    await docRef.set(mevcutKelimeler);
    console.log(`✅ '${word.keyword}' kelimesi '${listeAdi}' listesine eklendi.`);
  }

  console.log("🚀 Tüm kelimeler işlendi.");
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