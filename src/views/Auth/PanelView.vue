<template>
  <div class="panel-container">
    <!-- Panel Admina -->
    <div v-if="authStore.isAdmin" class="admin-main">
      <h1>Admin Panel</h1>
      <div class="tabs">
        <button
          :class="{ active: activeTab === 'products' }"
          @click="activeTab = 'products'">
          Manage Products
        </button>
        <button
          :class="{ active: activeTab === 'contacts' }"
          @click="activeTab = 'contacts'">
          Contact Messages
        </button>
      </div>

      <!-- Zarządzanie produktami -->
      <div v-if="activeTab === 'products'" class="admin-section">
        <h2>Products</h2>
        <form class="product-form" @submit.prevent="handleAddProduct">
          <h3>Add New Product</h3>
          <div class="form-group">
            <label>Title:</label>
            <input type="text" v-model="newProduct.title" required />
          </div>
          <div class="form-group">
            <label>Thumbnail:</label>
            <input
              type="text"
              v-model="newProduct.thumbnail"
              placeholder="e.g. product10v1.webp"
              required />
          </div>
          <div class="form-group">
            <label>Price:</label>
            <input
              type="number"
              v-model.number="newProduct.price"
              min="0"
              required />
          </div>
          <div class="form-group">
            <label>Stock:</label>
            <input
              type="number"
              v-model.number="newProduct.stock"
              min="0"
              required />
          </div>
          <button type="submit" class="primary-btn">Add Product</button>
        </form>

        <table class="admin-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="prod in paginatedProducts" :key="prod.id">
              <td>
                <img
                  :src="getImageUrl(prod.thumbnail)"
                  alt="Product"
                  class="admin-product-img" />
              </td>
              <td>
                <input type="text" v-model="prod.title" />
              </td>
              <td>
                <input type="number" v-model.number="prod.price" min="0" />
              </td>
              <td>
                <input type="number" v-model.number="prod.stock" min="0" />
              </td>
              <td>
                <button
                  class="secondary-btn"
                  @click="handleUpdateProduct(prod)">
                  Update
                </button>
                <button
                  class="danger-btn"
                  @click="handleDeleteProduct(prod.id)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Paginacja -->
        <div class="pagination">
          <button
            v-for="page in totalPages"
            :key="page"
            :class="{ active: currentPage === page }"
            @click="currentPage = page">
            {{ page }}
          </button>
        </div>
      </div>

      <!-- Widok wiadomości kontaktowych -->
      <div v-if="activeTab === 'contacts'" class="admin-section">
        <h2>Contact Messages</h2>
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Subject</th>
              <th>Message</th>
              <th>Sent At</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="msg in contactMessages" :key="msg.id">
              <td>{{ msg.name }}</td>
              <td>{{ msg.email }}</td>
              <td>{{ msg.subject }}</td>
              <td>{{ msg.message }}</td>
              <td>{{ formatDate(msg.sent_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Panel Użytkownika -->
    <div v-else>
      <h1>User Panel</h1>
      <p>
        This is your personal panel. Below are your purchased products grouped
        by day:
      </p>
      <div
        v-for="(purchases, day) in groupedPurchases"
        :key="day"
        class="purchase-day-group">
        <h2>{{ day }}</h2>
        <table class="purchase-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th class="hide">Quantity</th>
              <th class="hide">Price</th>
              <th class="hide">Purchased At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="purchase in purchases" :key="purchase.id">
              <td>
                <img
                  :src="getImageUrl(purchase.product.thumbnail)"
                  alt="Product Image"
                  class="purchase-item-image" />
              </td>
              <td>
                <router-link
                  :to="{
                    name: 'product',
                    params: { id: purchase.product.id },
                  }">
                  {{ purchase.product.title }}
                </router-link>
              </td>
              <td class="hide">{{ purchase.quantity }}</td>
              <td class="hide">${{ purchase.price }}</td>
              <td class="hide">{{ formatDate(purchase.created_at) }}</td>
              <td>
                <button
                  class="details-btn"
                  @click="showShippingDetails(purchase)">
                  Shipping Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="!hasPurchases" class="no-purchases">
        You have no purchased products.
      </p>
    </div>

    <!-- Modal for shipping details -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" :class="modalType" @click.stop>
        <h3>Shipping Details</h3>
        <div v-if="currentShipping">
          <p>
            <strong>Name:</strong> {{ currentShipping.first_name }}
            {{ currentShipping.last_name }}
          </p>
          <p><strong>Address:</strong> {{ currentShipping.address }}</p>
          <p><strong>City:</strong> {{ currentShipping.city }}</p>
          <p><strong>State:</strong> {{ currentShipping.state }}</p>
          <p><strong>Postal Code:</strong> {{ currentShipping.postal_code }}</p>
          <p><strong>Country:</strong> {{ currentShipping.country }}</p>
          <p v-if="currentShipping.phone">
            <strong>Phone:</strong> {{ currentShipping.phone }}
          </p>
        </div>
        <div v-else>
          <p>No shipping details available.</p>
        </div>
        <button class="modal-close" @click="closeModal">Close</button>
      </div>
    </div>

    <!-- Komunikat modal -->
    <div
      v-if="notification.show"
      class="modal-overlay"
      @click="closeNotification">
      <div class="modal-content" :class="notification.type" @click.stop>
        <p>{{ notification.message }}</p>
        <button class="modal-close" @click="closeNotification">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/firebase";

const authStore = useAuthStore();

// Panel admina - produkty
const products = ref([]);
const newProduct = ref({
  title: "",
  thumbnail: "",
  price: 0,
  stock: 0,
});

// Panel admina - wiadomości kontaktowe
const contactMessages = ref([]);

// Panel użytkownika - zakupy
const purchases = ref([]);

// Modal do wyświetlania danych wysyłki/invoice
const showModal = ref(false);
const currentShipping = ref(null);

// Komunikaty
const notification = ref({
  show: false,
  message: "",
  type: "success", // "success" lub "error"
});

// Aktywny tab w panelu admina
const activeTab = ref("products");

// Paginacja produktów
const currentPage = ref(1);
const pageSize = 10;
const totalPages = computed(() => Math.ceil(products.value.length / pageSize));
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return products.value.slice(start, start + pageSize);
});

// Funkcja pomocnicza budująca URL obrazu – zakładamy, że obrazy znajdują się pod: http://localhost:5173/src/assets/
function getImageUrl(path) {
  if (!path) return "";
  return "http://localhost:5173/src/assets/" + path;
}

// Formatowanie daty
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString();
}

// CRUD dla produktów
async function fetchProducts() {
  try {
    const snapshot = await getDocs(collection(db, "products"));
    let prods = [];
    snapshot.forEach((docSnap) => {
      prods.push({ id: docSnap.id, ...docSnap.data() });
    });
    products.value = prods;
  } catch (error) {
    console.error("Error fetching products:", error);
    showNotification("Error fetching products", "error");
  }
}

async function handleAddProduct() {
  if (newProduct.value.price < 0 || newProduct.value.stock < 0) {
    showNotification("Price and stock must be 0 or greater.", "error");
    return;
  }
  try {
    const docRef = await addDoc(collection(db, "products"), newProduct.value);
    products.value.push({ ...newProduct.value, id: docRef.id });
    newProduct.value = { title: "", thumbnail: "", price: 0, stock: 0 };
    showNotification("Product added successfully.", "success");
  } catch (error) {
    console.error("Error adding product:", error);
    showNotification("Error adding product", "error");
  }
}

async function handleUpdateProduct(prod) {
  if (prod.price < 0 || prod.stock < 0) {
    showNotification("Price and stock must be 0 or greater.", "error");
    return;
  }
  try {
    await updateDoc(doc(db, "products", prod.id.toString()), {
      title: prod.title,
      thumbnail: prod.thumbnail,
      price: prod.price,
      stock: prod.stock,
    });
    showNotification("Product updated successfully.", "success");
  } catch (error) {
    console.error("Error updating product:", error);
    showNotification("Error updating product", "error");
  }
}

async function handleDeleteProduct(id) {
  try {
    await deleteDoc(doc(db, "products", id.toString()));
    products.value = products.value.filter((p) => p.id !== id);
    showNotification("Product deleted successfully.", "success");
  } catch (error) {
    console.error("Error deleting product:", error);
    showNotification("Error deleting product", "error");
  }
}

// Pobieranie wiadomości kontaktowych
async function fetchContactMessages() {
  try {
    const snapshot = await getDocs(collection(db, "contact_messages"));
    let messages = [];
    snapshot.forEach((docSnap) => {
      messages.push({ id: docSnap.id, ...docSnap.data() });
    });
    contactMessages.value = messages;
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    showNotification("Error fetching contact messages", "error");
  }
}

// Pobieranie zakupów użytkownika
async function fetchPurchases() {
  if (!authStore.user) return;
  try {
    const q = query(
      collection(db, "purchases"),
      where("user_id", "==", authStore.user.uid)
    );
    const snapshot = await getDocs(q);
    let items = [];
    for (const docSnap of snapshot.docs) {
      const purchaseData = docSnap.data();
      if (purchaseData.items && Array.isArray(purchaseData.items)) {
        for (const item of purchaseData.items) {
          if (!item.product_id) continue;
          const prodDoc = await getDoc(doc(db, "products", item.product_id));
          const productData = prodDoc.exists()
            ? { id: prodDoc.id, ...prodDoc.data() }
            : {};
          items.push({
            id: docSnap.id + "-" + item.product_id,
            quantity: item.quantity,
            price: item.price,
            created_at: purchaseData.created_at,
            shipping: purchaseData.shipping,
            product: productData,
          });
        }
      } else if (purchaseData.product_id) {
        const prodDoc = await getDoc(
          doc(db, "products", purchaseData.product_id)
        );
        const productData = prodDoc.exists()
          ? { id: prodDoc.id, ...prodDoc.data() }
          : {};
        items.push({
          id: docSnap.id,
          quantity: purchaseData.quantity,
          price: purchaseData.price,
          created_at: purchaseData.created_at,
          shipping: purchaseData.shipping,
          product: productData,
        });
      } else {
        console.warn(
          "Purchase document",
          docSnap.id,
          "lacks 'items' or 'product_id'."
        );
      }
    }
    purchases.value = items;
  } catch (error) {
    console.error("Error fetching purchases:", error);
    showNotification("Error fetching purchases", "error");
  }
}

// Pobieranie invoice_details (do danych wysyłki) – przyjmujemy, że jest jeden dokument dla użytkownika
async function fetchInvoiceDetails() {
  if (!authStore.user) return null;
  try {
    const q = query(
      collection(db, "invoice_details"),
      where("user_id", "==", authStore.user.uid)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs[0].data();
    }
  } catch (error) {
    console.error("Error fetching invoice details:", error);
    showNotification("Error fetching invoice details", "error");
  }
  return null;
}

// Funkcja wyświetlająca dane wysyłki – jeśli zakup ma shipping, używamy go, w przeciwnym razie pobieramy dane z invoice_details
async function showShippingDetails(purchase) {
  if (purchase.shipping) {
    currentShipping.value = purchase.shipping;
  } else {
    const invoice = await fetchInvoiceDetails();
    currentShipping.value = invoice;
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  currentShipping.value = null;
}

// Funkcja wyświetlająca komunikat modalny
function showNotification(message, type) {
  notification.value.message = message;
  notification.value.type = type;
  notification.value.show = true;
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
}

// Grupowanie zakupów po dacie zakupu
const groupedPurchases = computed(() => {
  const groups = {};
  purchases.value.forEach((purchase) => {
    const day = new Date(purchase.created_at).toLocaleDateString();
    if (!groups[day]) groups[day] = [];
    groups[day].push(purchase);
  });
  return groups;
});

const hasPurchases = computed(
  () => Object.keys(groupedPurchases.value).length > 0
);

onMounted(async () => {
  if (authStore.user) {
    await fetchProducts();
    await fetchContactMessages();
    await fetchPurchases();
  }
});
</script>

<style scoped>
/* Ogólne style */
.panel-container {
  margin: 0 auto;
  margin-bottom: 170px;
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* Style dla zakładek */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}
.tabs button {
  padding: 10px 20px;
  border: none;
  background-color: #eee;
  cursor: pointer;
  transition: background-color 0.3s;
}
.tabs button.active {
  background-color: #333;
  color: #fff;
}

/* Style dla sekcji admina */
.admin-section {
  margin-bottom: 30px;
}
.product-form {
  border: 1px solid #ccc;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 5px;
}
.product-form h3 {
  margin-top: 0;
}
.form-group {
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
}
.form-group label {
  margin-bottom: 5px;
  font-weight: bold;
}
.form-group input {
  padding: 8px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.primary-btn {
  padding: 10px 20px;
  background-color: #000;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}
.primary-btn:hover {
  background-color: #333;
}
.secondary-btn {
  padding: 8px 12px;
  background-color: #ccc;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
}
.danger-btn {
  padding: 8px 12px;
  background-color: #f44336;
  border: none;
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
}

/* Tabele */
.admin-table,
.purchase-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
.admin-table th,
.admin-table td,
.purchase-table th,
.purchase-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}
.admin-product-img,
.purchase-item-image {
  max-width: 70px;
  border-radius: 4px;
}

/* Paginacja */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}
.pagination button {
  padding: 8px 12px;
  margin: 0 5px;
  border: none;
  background-color: #eee;
  cursor: pointer;
  transition: background-color 0.3s;
}
.pagination button.active {
  background-color: #333;
  color: #fff;
}

/* Style dla modalów */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-content {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  min-width: 300px;
  text-align: center;
}
.modal-content.success {
  background-color: #d4edda;
  color: #155724;
}
.modal-content.error {
  background-color: #f8d7da;
  color: #721c24;
}
.modal-close {
  margin-top: 10px;
  padding: 6px 12px;
  border: none;
  background: #ccc;
  cursor: pointer;
}

@media screen and (max-width: 1250px) {
  .admin-main {
    margin-left: 300px;
  }
}
@media screen and (max-width: 640px) {
  .admin-main {
    margin-left: 0;
  }
}

/* Responsywność */
@media screen and (max-width: 768px) {
  .panel-container {
    padding: 10px;
  }
  .tabs {
    flex-direction: column;
  }
  .admin-table,
  .purchase-table {
    font-size: 0.9rem;
  }
}
</style>
