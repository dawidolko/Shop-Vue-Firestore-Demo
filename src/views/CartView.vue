<template>
  <div class="cart-container">
    <h1 style="text-align: center; font-size: 3rem; margin-top: 50px">Cart</h1>
    <table class="cart-table" v-if="cartItems.length > 0">
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Price</th>
          <th>Quantity</th>
          <th class="hide">Stock</th>
          <th class="hide">Subtotal</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in cartItems" :key="item.id">
          <td>
            <img
              :src="fullImagePath(item.thumbnail)"
              alt="Product Image"
              class="cart-item-image" />
          </td>
          <td>{{ item.title }}</td>
          <td>${{ item.price }}</td>
          <td class="quantity-cell">
            <button class="quantity-btn minus-btn" @click="decrement(item)">
              -
            </button>
            <input
              type="number"
              v-model.number="item.pivot.quantity"
              :max="item.stock"
              min="1"
              @change="updateQuantity(item)" />
            <button class="quantity-btn plus-btn" @click="increment(item)">
              +
            </button>
          </td>
          <td class="hide">{{ item.stock }}</td>
          <td class="hide">
            ${{ (item.price * item.pivot.quantity).toFixed(2) }}
          </td>
          <td>
            <button class="remove-btn" @click="removeItem(item.id)">
              Remove
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    <p style="text-align: center; font-size: 2rem" v-else>
      Your cart is empty.
    </p>
    <div v-if="cartItems.length > 0" class="total-section">
      <h2>Total: ${{ totalPrice.toFixed(2) }}</h2>
    </div>
    <div v-if="cartItems.length > 0" class="buy-section">
      <button class="buy-btn" @click="proceedToCheckout">Buy Now</button>
    </div>
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" :class="modalType" @click.stop>
        <p>{{ modalMessage }}</p>
        <button class="modal-close" @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { db } from "@/firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

const cartItems = ref([]);
const router = useRouter();
const authStore = useAuthStore();

const showModal = ref(false);
const modalMessage = ref("");
const modalType = ref("");

// Obliczenie łącznej ceny koszyka
const totalPrice = computed(() =>
  cartItems.value.reduce(
    (sum, item) => sum + item.price * item.pivot.quantity,
    0
  )
);

// Pobieranie koszyka: Firestore dla zalogowanych, localStorage dla gości
async function fetchCart() {
  if (authStore.user) {
    try {
      const cartRef = collection(db, "users", authStore.user.uid, "cart");
      const cartSnapshot = await getDocs(cartRef);
      cartItems.value = [];
      cartSnapshot.forEach((docSnap) => {
        let data = docSnap.data();
        // Ujednolicamy strukturę – w Firestore mamy pole "quantity"
        data.pivot = { quantity: data.quantity };
        // Używamy id dokumentu jako id produktu
        data.id = docSnap.id;
        cartItems.value.push(data);
      });
    } catch (error) {
      console.error("Error fetching cart from Firestore:", error);
      openModal("Error fetching cart data", "error");
    }
  } else {
    // Dla gościa pobieramy dane z localStorage
    let guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    cartItems.value = guestCart.map((item) => ({
      ...item,
      id: item.product_id,
      pivot: { quantity: item.quantity },
    }));
  }
}

// Pomocnicza funkcja do budowania pełnej ścieżki do obrazu
function fullImagePath(path) {
  return path
    ? "http://localhost:5173/src/assets/" + path.replace("//", "/")
    : "";
}

// Funkcja otwierająca modal
function openModal(message, type = "error") {
  modalMessage.value = message;
  modalType.value = type;
  showModal.value = true;
}

// Zamknięcie modala
function closeModal() {
  showModal.value = false;
  modalMessage.value = "";
  modalType.value = "";
}

// Zwiększanie ilości – aktualizacja Firestore lub localStorage
function increment(item) {
  if (item.pivot.quantity < item.stock) {
    item.pivot.quantity++;
    updateQuantity(item);
  } else {
    openModal("Cannot exceed available stock", "error");
  }
}

// Zmniejszanie ilości – aktualizacja Firestore lub localStorage
function decrement(item) {
  if (item.pivot.quantity > 1) {
    item.pivot.quantity--;
    updateQuantity(item);
  }
}

// Aktualizacja ilości produktu w koszyku
async function updateQuantity(item) {
  if (item.pivot.quantity > item.stock) {
    openModal("Cannot exceed available stock", "error");
    item.pivot.quantity = item.stock;
    return;
  }
  if (item.stock === 0) {
    openModal("Product out of stock", "error");
    item.pivot.quantity = 1;
    return;
  }
  if (authStore.user) {
    try {
      const itemRef = doc(db, "users", authStore.user.uid, "cart", item.id);
      await updateDoc(itemRef, { quantity: item.pivot.quantity });
    } catch (error) {
      console.error("Error updating quantity in Firestore:", error);
      openModal("Error updating quantity", "error");
    }
  } else {
    // Aktualizacja koszyka gościa w localStorage
    let guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    const index = guestCart.findIndex((g) => g.product_id === item.id);
    if (index !== -1) {
      guestCart[index].quantity = item.pivot.quantity;
      localStorage.setItem("guestCart", JSON.stringify(guestCart));
    }
  }
}

// Usuwanie produktu z koszyka
async function removeItem(productId) {
  if (authStore.user) {
    try {
      const itemRef = doc(db, "users", authStore.user.uid, "cart", productId);
      await deleteDoc(itemRef);
      cartItems.value = cartItems.value.filter((item) => item.id !== productId);
      openModal("Item removed successfully!", "success");
    } catch (error) {
      console.error("Error removing item from Firestore:", error);
      openModal("Error removing item", "error");
    }
  } else {
    let guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    guestCart = guestCart.filter((item) => item.product_id !== productId);
    localStorage.setItem("guestCart", JSON.stringify(guestCart));
    await fetchCart();
    openModal("Item removed successfully!", "success");
  }
}

// Przejście do realizacji zamówienia – wymaga logowania
function proceedToCheckout() {
  if (!authStore.user) {
    openModal("You must be logged in to purchase", "error");
    return;
  }
  router.push({ name: "checkout" });
}

onMounted(() => {
  fetchCart();
});
</script>

<style scoped>
.cart-container {
  padding: 2px;
  font-family: Arial, sans-serif;
}

/* Klasa .hide pozostaje, będzie wykorzystywana w media query */
.hide {
  display: none;
}

/* Ustawienie marginesu dla szerszych ekranów */
@media screen and (min-width: 910px) {
  .cart-container {
    margin-left: 300px;
  }
}

/* Przykładowa zmiana szerokości tabeli dla ekranów poniżej 900px */
@media screen and (max-width: 900px) {
  .cart-table {
    width: auto;
  }
}

/* Media query dla ekranów poniżej 920px - ukrywanie kolumn z klasą .hide */
@media screen and (max-width: 920px) {
  .hide {
    display: none;
  }
}

.cart-table {
  border-collapse: collapse;
  margin-bottom: 20px;
}
.cart-table th,
.cart-table td {
  border: 1px solid #ccc;
  padding: 10px;
  text-align: left;
}
.cart-item-image {
  width: 80px;
  height: auto;
  object-fit: cover;
  border-radius: 4px;
}
.quantity-cell {
  display: flex;
  align-items: center;
  gap: 5px;
}
.cart-table input[type="number"] {
  padding: 2px;
  text-align: center;
}
.quantity-btn {
  background-color: #28a745;
  color: #fff;
  border: none;
  padding: 6px 10px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
}
.quantity-btn:hover {
  background-color: #218838;
}
.remove-btn {
  background-color: #f44336;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
}
.remove-btn:hover {
  background-color: red;
}
.total-section {
  margin-top: 30px;
  text-align: right;
  font-size: 1.2rem;
  font-weight: bold;
}
.buy-section {
  margin-top: 20px;
  text-align: right;
}
.buy-btn {
  background-color: #000000;
  color: #fff;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
}
.buy-btn:hover {
  background-color: #181919;
}
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
.modal-content.error {
  background-color: #f8d7da;
  color: #721c24;
}
.modal-content.success {
  background-color: #d4edda;
  color: #155724;
}
.modal-close {
  margin-top: 10px;
  padding: 6px 12px;
  border: none;
  background: #ccc;
  cursor: pointer;
}
</style>
