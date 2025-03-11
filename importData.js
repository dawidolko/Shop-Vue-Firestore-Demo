// importData.js
const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Inicjalizacja Firebase Admin SDK przy użyciu klucza Service Account
const serviceAccount = require("./serviceAccountKey.json");

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
    console.log("Import completed.");
  } catch (error) {
    console.error("Error during import:", error);
  }
}

main();
