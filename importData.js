import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Ustal __dirname w ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Inicjalizacja Firebase Admin SDK przy użyciu klucza Service Account
const serviceAccount = JSON.parse(
  fs.readFileSync(path.join(__dirname, "serviceAccountKey.json"), "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// Funkcja importująca dane z pliku JSON do kolekcji
async function importCollection(collectionName, jsonFilePath) {
  const data = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));

  for (const item of data) {
    // Jeśli w danych jest pole "id", użyj go jako identyfikatora dokumentu
    const docId = item.id ? item.id.toString() : undefined;
    if (docId) {
      await db.collection(collectionName).doc(docId).set(item);
    } else {
      await db.collection(collectionName).add(item);
    }
    console.log(`Imported document into ${collectionName}`);
  }
}

async function main() {
  try {
    await importCollection(
      "users",
      path.join(__dirname, "database", "users.json")
    );
    await importCollection(
      "products",
      path.join(__dirname, "database", "products.json")
    );
    await importCollection(
      "user_product",
      path.join(__dirname, "database", "user_product.json")
    );
    await importCollection(
      "purchases",
      path.join(__dirname, "database", "purchases.json")
    );
    await importCollection(
      "shipping_details",
      path.join(__dirname, "database", "shipping_details.json")
    );
    await importCollection(
      "invoice_details",
      path.join(__dirname, "database", "invoice_details.json")
    );
    await importCollection(
      "payment_details",
      path.join(__dirname, "database", "payment_details.json")
    );
    await importCollection(
      "newsletter",
      path.join(__dirname, "database", "newsletter.json")
    );
    await importCollection(
      "contact_messages",
      path.join(__dirname, "database", "contact_messages.json")
    );
    console.log("Import completed.");
  } catch (error) {
    console.error("Error during import:", error);
  }
}

main();
