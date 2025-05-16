import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import { fileURLToPath, pathToFileURL } from "url";
import path from "path";

// __dirname elde et (ESM uyumlu)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON dosyasının tam yolu
const jsonPath = path.join(__dirname, "discortbot-4576f-firebase-adminsdk-fbsvc-c0cc90937f.json");

// JSON dosyasını oku ve parse et
const jsonData = JSON.parse(readFileSync(jsonPath, "utf8"));

// Firebase'i başlat
if (!getApps().length) {
  initializeApp({
    credential: cert(jsonData),
  });
}

const db = getFirestore();
export default db;
