<template>
  <div class="app-wrapper">
    <Navbar />
    <main class="app-main">
      <Sidebar :categories="categories" />
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase";
import Navbar from "@/layouts/Navbar.vue";
import Footer from "@/layouts/Footer.vue";
import Sidebar from "@/layouts/Sidebar.vue";

const categories = ref([]);

onMounted(async () => {
  try {
    const productsSnapshot = await getDocs(collection(db, "products"));
    const categorySet = new Set();
    productsSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.category) {
        categorySet.add(data.category);
      }
    });
    categories.value = Array.from(categorySet);
  } catch (err) {
    console.error("Błąd podczas pobierania kategorii:", err);
  }
});
</script>

<style scoped>
.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.app-main {
  display: flex;
  flex: 1;
}
</style>
