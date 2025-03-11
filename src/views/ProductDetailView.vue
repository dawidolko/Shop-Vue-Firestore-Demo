<template>
  <div class="product-detail-box">
    <div class="image-container">
      <!-- Jeśli mamy więcej niż jeden obrazek, wyświetlamy slider -->
      <div v-if="hasMultipleImages" class="slider">
        <button class="arrow-btn left-arrow" @click="prevImage">
          &#10094;
        </button>
        <img
          :src="getImageUrl(currentImage)"
          alt="Product Image"
          class="slider-image"
          @click="openImageModal(getImageUrl(currentImage))" />
        <button class="arrow-btn right-arrow" @click="nextImage">
          &#10095;
        </button>
      </div>
      <!-- Jeśli nie, wyświetlamy pojedynczy obrazek -->
      <div v-else class="single-image">
        <img
          :src="getImageUrl(product.thumbnail)"
          alt="Product Image"
          class="slider-image"
          @click="openImageModal(getImageUrl(product.thumbnail))" />
      </div>
    </div>
    <div class="info-container">
      <h1 class="product-title">{{ product.title }}</h1>
      <p class="brand-category">
        <strong>Brand:</strong> {{ product.brand }} &nbsp;|&nbsp;
        <strong>Category:</strong> {{ product.category }}
      </p>
      <p class="product-description">{{ product.description }}</p>
      <div class="prices">
        <span class="old-price" v-if="hasDiscount">
          $ {{ product.price }}
        </span>
        <span class="new-price">$ {{ discountedPrice }}</span>
      </div>
      <div class="quantity-control">
        <button class="quantity-btn" @click="decrement">–</button>
        <input
          type="number"
          v-model.number="quantity"
          min="1"
          :max="product.stock"
          @change="validateQuantity" />
        <button class="quantity-btn" @click="increment">+</button>
      </div>
      <button class="primary-btn" @click="addToCart(product.id)">
        Add to cart
      </button>
    </div>
    <!-- Modal informacyjny -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" :class="modalType" @click.stop>
        <p>{{ modalMessage }}</p>
        <button class="modal-close" @click="closeModal">Close</button>
      </div>
    </div>
    <!-- Modal powiększonego obrazka -->
    <div
      v-if="showImageModal"
      class="image-modal-overlay"
      @click="closeImageModal">
      <div class="image-modal-content" @click.stop>
        <button class="close-btn" @click="closeImageModal">&times;</button>
        <img
          :src="modalImage"
          alt="Enlarged Product Image"
          class="enlarged-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const authStore = useAuthStore();

const product = ref({});
const quantity = ref(1);
const currentIndex = ref(0);

const showImageModal = ref(false);
const modalImage = ref("");
const showModal = ref(false);
const modalMessage = ref("");
const modalType = ref("");

// Pobieranie produktu z Firestore po ID
async function fetchProduct() {
  const id = route.params.id;
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      product.value = { id: docSnap.id, ...docSnap.data() };
    } else {
      console.error("Product not found");
    }
  } catch (err) {
    console.error("Error fetching product:", err);
  }
}

onMounted(() => {
  fetchProduct();
});

// Jeśli produkt zawiera więcej niż jeden obrazek
const hasMultipleImages = computed(() => {
  return product.value.images && product.value.images.length > 1;
});

// Aktualny obrazek do slidera
const currentImage = computed(() => {
  if (hasMultipleImages.value) {
    return product.value.images[currentIndex.value];
  }
  return product.value.thumbnail;
});

// Czy produkt ma zniżkę
const hasDiscount = computed(() => {
  return (
    product.value.discount_percentage && product.value.discount_percentage > 0
  );
});

// Oblicz cenę po zniżce
const discountedPrice = computed(() => {
  if (hasDiscount.value) {
    const factor = 1 - product.value.discount_percentage / 100;
    return (product.value.price * factor).toFixed(2);
  }
  return product.value.price;
});

// Funkcja pomocnicza – buduje URL do obrazu z folderu src/assets
function getImageUrl(filename) {
  if (!filename) return "";
  return new URL(`../assets/${filename}`, import.meta.url).href;
}

// Slider – poprzedni obrazek
function prevImage() {
  if (hasMultipleImages.value) {
    currentIndex.value =
      (currentIndex.value - 1 + product.value.images.length) %
      product.value.images.length;
  }
}

// Slider – następny obrazek
function nextImage() {
  if (hasMultipleImages.value) {
    currentIndex.value = (currentIndex.value + 1) % product.value.images.length;
  }
}

// Otwórz modal z powiększonym obrazkiem
function openImageModal(src) {
  modalImage.value = src;
  showImageModal.value = true;
}

function closeImageModal() {
  showImageModal.value = false;
}

// Zmiana ilości produktu
function increment() {
  if (quantity.value < product.value.stock) {
    quantity.value++;
  } else {
    modalMessage.value = "No more products available";
    modalType.value = "error";
    showModal.value = true;
  }
}

function decrement() {
  if (quantity.value > 1) {
    quantity.value--;
  }
}

function validateQuantity() {
  if (quantity.value < 1) {
    quantity.value = 1;
  } else if (quantity.value > product.value.stock) {
    quantity.value = product.value.stock;
    modalMessage.value = "No more products available";
    modalType.value = "error";
    showModal.value = true;
  }
}

// Dodawanie produktu do koszyka
async function addToCart(productId) {
  const qty = Number(quantity.value) || 1;
  if (qty > product.value.stock) {
    modalMessage.value = "Requested quantity exceeds available stock";
    modalType.value = "error";
    showModal.value = true;
    return;
  }
  if (authStore.user) {
    try {
      const itemRef = doc(
        db,
        "users",
        authStore.user.uid,
        "cart",
        productId.toString()
      );
      const docSnap = await getDoc(itemRef);
      if (docSnap.exists()) {
        await updateDoc(itemRef, { quantity: docSnap.data().quantity + qty });
      } else {
        await setDoc(itemRef, {
          title: product.value.title,
          price: product.value.price,
          thumbnail: product.value.thumbnail,
          stock: product.value.stock,
          quantity: qty,
        });
      }
      modalMessage.value = "Added successfully";
      modalType.value = "success";
    } catch (error) {
      console.error("Error adding product to Firestore:", error);
      modalMessage.value = "Error adding to cart";
      modalType.value = "error";
    }
  } else {
    let guestCart = JSON.parse(localStorage.getItem("guestCart") || "[]");
    const existingItem = guestCart.find(
      (item) => item.product_id === productId
    );
    if (existingItem) {
      existingItem.quantity += qty;
    } else {
      guestCart.push({
        product_id: productId,
        title: product.value.title,
        price: product.value.price,
        thumbnail: product.value.thumbnail,
        stock: product.value.stock,
        quantity: qty,
      });
    }
    localStorage.setItem("guestCart", JSON.stringify(guestCart));
    modalMessage.value = "Added successfully";
    modalType.value = "success";
  }
  showModal.value = true;
  quantity.value = 1;
}

function closeModal() {
  showModal.value = false;
  modalMessage.value = "";
  modalType.value = "";
}
</script>

<style scoped>
.product-detail-box {
  max-width: 1200px;
  min-height: 700px;
  padding: 20px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.image-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.info-container {
  width: 100%;
  max-width: 600px;
  text-align: center;
  margin-bottom: 10px;
}

.product-title {
  font-size: 2.2rem;
  margin-bottom: 10px;
}

.brand-category {
  margin-bottom: 10px;
  color: #555;
}

.product-description {
  margin-top: 10px;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 20px;
}

.prices {
  font-size: 1.6rem;
  margin-bottom: 20px;
}

.old-price {
  text-decoration: line-through;
  color: #888;
  margin-right: 10px;
}

.new-price {
  color: #facc15;
  font-weight: bold;
}

.quantity-control {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10px;
}

.quantity-btn {
  background-color: #28a745;
  color: #fff;
  border: none;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  margin: 0 5px;
}

.quantity-btn:hover {
  background-color: #218838;
}

.quantity-control input[type="number"] {
  width: 60px;
  text-align: center;
  font-size: 1rem;
  padding: 5px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.primary-btn {
  padding: 12px 24px;
  background: linear-gradient(45deg, #000000, #181818);
  color: #fff;
  border: none;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.primary-btn:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  transform: scale(1.03);
}

.slider {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.slider-image {
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
}

.arrow-btn {
  background: none;
  border: none;
  color: #333;
  font-size: 2rem;
  cursor: pointer;
  font-weight: bold;
  transition: color 0.2s;
}

.arrow-btn:hover {
  color: #ff3c00;
}

.left-arrow {
  position: absolute;
  left: -40px;
}

.right-arrow {
  position: absolute;
  right: -40px;
}

.single-image img {
  max-width: 250px;
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.3s;
}

.single-image img:hover {
  transform: scale(1.05);
}

.image-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.image-modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.enlarged-image {
  width: 100%;
  height: auto;
  border-radius: 4px;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: red;
  color: #fff;
  border: none;
  font-size: 1.3rem;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 210;
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
  z-index: 300;
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
