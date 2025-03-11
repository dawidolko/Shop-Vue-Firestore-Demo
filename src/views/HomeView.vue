<template>
  <div class="flex flex-col min-h-screen">
    <div class="flex flex-grow">
      <!-- Przekazujemy pobrane produkty do komponentu MainSection -->
      <MainSection :products="products" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import MainSection from "@/layouts/MainSection.vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

const products = ref([]);

onMounted(async () => {
  try {
    // Pobierz wszystkie produkty z kolekcji "products" w Firestore
    const productsSnapshot = await getDocs(collection(db, "products"));
    const productsData = [];
    productsSnapshot.forEach((doc) => {
      productsData.push({ id: doc.id, ...doc.data() });
    });
    products.value = productsData;
  } catch (err) {
    console.error("Błąd podczas pobierania produktów:", err);
  }
});
</script>

<style scoped>
.flex {
  display: flex;
}
.flex-col {
  flex-direction: column;
}
.min-h-screen {
  min-height: 100vh;
}
.flex-grow {
  flex-grow: 1;
}
</style>
