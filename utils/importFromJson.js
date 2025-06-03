// utils/importFromJson.js
import db from "../firebase.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { EmbedBuilder } from 'discord.js';

//Toplu Kelime Girme
export async function topluTabuKelimeleriEkle(interaction, kelimeListesi) {
  for (const word of kelimeListesi) {
    const listeAdi = word.liste || "Genel"; // Liste adı yoksa 'Genel' varsayılan

    const docRef = db.collection("tabu_lists").doc(listeAdi); // Belirli liste dokümanı
    const docSnap = await docRef.get(); // Liste dokümanını çek

    const kelimeler = docSnap.exists ? docSnap.data() : {}; // Eğer varsa, içeriğini al

    const mevcutKelimeler = Object.keys(kelimeler).map(k => k.toLowerCase());
    const yeniKelime = word.keyword.toLowerCase(); // Anahtar (keyword) küçük harfe çevrilir (çakışma önleme)

    // Eğer bu keyword zaten varsa atla
    if (mevcutKelimeler.includes(yeniKelime)) {
      await interaction.send({ content: `⚠️ '${word.keyword}'  kelimesi  '${word.liste}'  listesinde zaten var.`});
      console.log(`⚠️ '${word.keyword}' kelimesi '${listeAdi}' listesinde zaten var, atlandı.`);
      continue;
    }

    // Yeni kelimeyi listeye ekle
    kelimeler[yeniKelime] = word.yasaklar;

    // Güncellenmiş listeyi veritabanına yaz
    await docRef.set(kelimeler);

    const embed = new EmbedBuilder()
      .setTitle("Yeni Tabu Kelimesi")
      .addFields(
        { name: "Liste", value: word.liste, inline: true },
        { name: "Kelime", value: word.keyword, inline: true },
        {
          name: "Yasaklı Kelimeler",
          value: word.yasaklar.map((y, i) => `**${i + 1}.** ${y}`).join("\n"),
          inline: false,
        }
      )
      .setColor("Random")
      .setTimestamp();
    await interaction.send({ embeds: [embed] });
    console.log(`✅ '${word.keyword}' kelimesi '${listeAdi}' listesine eklendi.`);
  }

  console.log("🚀 Tüm kelimeler işlendi.");
}

export async function test(interaction)
{
  // __dirname tanımı (ESM için gerekli)
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // JSON dosyasının yolu
  const jsonPath = path.join(__dirname, "./tabu_kelime_listesi.json");

  // Dosyayı oku
  const rawData = fs.readFileSync(jsonPath, "utf-8");

  // JSON'u objeye çevir
  const jsonData = JSON.parse(rawData);



  // Firebase'e uygun formata çevir
  const kelimeListesi = Object.entries(jsonData).map(([keyword, yasaklar]) => ({
    keyword,
    yasaklar,
    liste: "Genel", // İstersen farklı liste adı da verebilirsin
  }));


  // Kelimeleri veritabanına ekle
  topluTabuKelimeleriEkle(interaction, kelimeListesi);
  
}
