import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, "firebase-key.json");
const jsonData = JSON.parse(readFileSync(jsonPath, "utf8"));

if (!getApps().length) {
  initializeApp({
    credential: cert(jsonData),
  });
}

const db = getFirestore();
export default db;
