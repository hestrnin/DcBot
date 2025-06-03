import db from "../firebase.js";

export async function Birlestir() {
    const list1 = db.collection("tabu_lists").doc("Genel");
    const list2 = db.collection("tabu_lists").doc("genel");

    const listDoc1 = await list1.get();
    const listDoc2 = await list2.get();

    const kelimeler1 = listDoc1.exists ? listDoc1.data() : {};
    const kelimeler2 = listDoc2.exists ? listDoc2.data() : {};

    console.log(kelimeler2);
    /*for(const word of kelimeler2)
    {
        const yeniKelime = word.keyword.toLowerCase();

        if(kelimeler1.hasOwnProperty(yeniKelime)){
            console.log(`⚠️ '${word.keyword}' kelimesi '${listeAdi}' listesinde zaten var, atlandı.`);
            continue;
        }

        kelimeler1[yeniKelime] = word.yasaklar;

        await list1.set(kelimeler1);
        console.log(`✅ '${word.keyword}' kelimesi 'Genel' listesine eklendi.`);
    }*/
}