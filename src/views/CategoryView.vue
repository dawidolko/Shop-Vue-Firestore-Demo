<template>
  <div class="w3-content">
    <h1 class="category-title">Category: {{ categoryName }}</h1>
    <div class="w3-container w3-text-grey" id="products">
      <p>{{ products.length }} items</p>
    </div>
    <div class="w3-row w3-grayscale">
      <div
        v-for="prod in products"
        :key="prod.id"
        class="w3-col l3 s6 product-card">
        <div class="w3-container product-container">
          <img
            :src="getImageUrl(prod.thumbnail)"
            alt="Product Image"
            class="enlarge-on-hover"
            @click.stop="openEnlargedImage(getImageUrl(prod.thumbnail))" />
          <RouterLink
            :to="{ name: 'product', params: { id: prod.id } }"
            class="product-text-link">
            <p>
              <span class="product-title-hover">{{ prod.title }}</span
              ><br />
              <b>$ {{ prod.price }}</b>
            </p>
          </RouterLink>
          <button class="cart-button" @click.stop="addToCart(prod.id)">
            <i class="fa fa-shopping-cart"></i>
          </button>
        </div>
      </div>
    </div>
    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" :class="modalType" @click.stop>
        <p>{{ modalMessage }}</p>
        <button class="modal-close" @click="closeModal">Close</button>
      </div>
    </div>
    <!-- Enlarged image modal -->
    <div
      v-if="showEnlargedImage"
      class="image-modal-overlay"
      @click="closeEnlargedImage">
      <div class="image-modal-content" @click.stop>
        <button class="close-btn" @click="closeEnlargedImage">&times;</button>
        <img
          :src="enlargedImageSrc"
          alt="Enlarged Product Image"
          class="enlarged-image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const categoryName = ref(route.params.cat);
const products = ref([]);

const showModal = ref(false);
const modalMessage = ref("");
const modalType = ref("");
const showEnlargedImage = ref(false);
const enlargedImageSrc = ref("");

// Pobiera produkty dla danej kategorii z Firestore
async function fetchProductsByCategory(cat) {
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("category", "==", cat));
    const snapshot = await getDocs(q);
    const catProducts = [];
    snapshot.forEach((docSnap) => {
      catProducts.push({ id: docSnap.id, ...docSnap.data() });
    });
    products.value = catProducts;
  } catch (err) {
    console.error("Error fetching products by category:", err);
  }
}

// Inicjalizacja przy montowaniu oraz przy zmianie parametru trasy
onMounted(() => {
  fetchProductsByCategory(categoryName.value);
});
watch(
  () => route.params.cat,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      categoryName.value = newVal;
      fetchProductsByCategory(newVal);
    }
  }
);

// Buduje URL obrazu z assets
function getImageUrl(thumbnail) {
  if (!thumbnail) return "";
  return new URL(`../assets/${thumbnail}`, import.meta.url).href;
}

function openEnlargedImage(src) {
  enlargedImageSrc.value = src;
  showEnlargedImage.value = true;
}

function closeEnlargedImage() {
  showEnlargedImage.value = false;
}

// Dodawanie produktu do koszyka – wyszukiwanie pełnych danych produktu
async function addToCart(productId) {
  const authStore = useAuthStore();
  const product = products.value.find((p) => p.id === productId);
  if (!product) {
    modalMessage.value = "Product not found";
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
        await updateDoc(itemRef, { quantity: docSnap.data().quantity + 1 });
      } else {
        await setDoc(itemRef, {
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          stock: product.stock,
          quantity: 1,
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
      existingItem.quantity += 1;
    } else {
      guestCart.push({
        product_id: productId,
        title: product.title,
        price: product.price,
        thumbnail: product.thumbnail,
        stock: product.stock,
        quantity: 1,
      });
    }
    localStorage.setItem("guestCart", JSON.stringify(guestCart));
    modalMessage.value = "Added successfully";
    modalType.value = "success";
  }
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  modalMessage.value = "";
  modalType.value = "";
}
</script>

<style scoped>
.w3-content {
  margin: 0 auto;
  max-width: 1200px;
  margin-bottom: 50px;
}
@media (min-width: 640px) {
  .w3-content {
    margin-left: 300px;
    margin-right: auto;
  }
}
.category-title {
  margin-top: 50px;
  padding: 10px;
  font-size: 1.8rem;
  font-weight: bold;
}
.product-card {
  position: relative;
}
.product-container {
  position: relative;
  text-align: center;
}
.enlarge-on-hover {
  max-width: 80%;
  height: auto;
  display: block;
  margin: 0 auto;
  transition: transform 0.3s;
  cursor: pointer;
}
.enlarge-on-hover:hover {
  transform: scale(1.05);
}
.cart-button {
  position: absolute;
  top: 8px;
  right: 70px;
  background-color: black;
  border: none;
  font-size: 1.5rem;
  color: #fff;
  opacity: 0;
  transition: opacity 0.3s, color 0.3s;
  cursor: pointer;
  border-radius: 5px;
  padding: 5px 10px;
  z-index: 100;
}
.cart-button:hover {
  color: #ffa500;
}
.product-container:hover .cart-button {
  opacity: 1;
}
.product-title-hover {
  transition: text-decoration 0.3s;
}
.product-title-hover:hover {
  text-decoration: underline;
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
  font-size: 1.5rem;
  padding: 8px 12px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 210;
}
</style>
