<template>
  <main class="auth-container" style="margin-bottom: 170px">
    <h1 class="title">Update Profile</h1>
    <form @submit.prevent="submitUpdate" class="auth-form">
      <div class="form-group">
        <input
          type="text"
          placeholder="Name"
          v-model="name"
          class="input-field" />
      </div>
      <div class="form-group">
        <input
          type="password"
          placeholder="New password (optional)"
          v-model="password"
          class="input-field" />
      </div>
      <div class="form-group">
        <input
          type="password"
          placeholder="Confirm new password"
          v-model="passwordConfirmation"
          class="input-field" />
      </div>
      <button type="submit" class="primary-btn">Save changes</button>
    </form>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" :class="modalType" @click.stop>
        <p>{{ modalMessage }}</p>
        <button class="modal-close" @click="closeModal">Close</button>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";

// Pobieramy userDoc z store, żeby mieć aktualną nazwę
const authStore = useAuthStore();

const name = ref(authStore.userDoc ? authStore.userDoc.name : "");
const password = ref("");
const passwordConfirmation = ref("");

const showModal = ref(false);
const modalMessage = ref("");
const modalType = ref("");

async function submitUpdate() {
  // Czy hasła się zgadzają?
  if (password.value && password.value !== passwordConfirmation.value) {
    modalMessage.value = "Passwords do not match";
    modalType.value = "error";
    showModal.value = true;
    return;
  }

  const result = await authStore.updateProfile({
    name: name.value,
    password: password.value,
  });

  if (result.success) {
    modalMessage.value = "Profile updated successfully";
    modalType.value = "success";
    showModal.value = true;
  } else {
    modalMessage.value = result.error || "Error updating profile";
    modalType.value = "error";
    showModal.value = true;
  }
}

function closeModal() {
  showModal.value = false;
}
</script>

<style scoped>
.auth-container {
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}
@media screen and (min-width: 640px) {
  .auth-container {
    margin-left: 300px !important;
  }
}
.title {
  text-align: center;
  font-size: 2em;
  margin-bottom: 20px;
}
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.form-group {
  display: flex;
  flex-direction: column;
}
.input-field {
  padding: 10px;
  font-size: 1em;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 300px;
}
.primary-btn {
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  font-size: 1em;
  border: none;
  min-width: 150px;
  border-radius: 4px;
  cursor: pointer;
}
.primary-btn:hover {
  background-color: #0056b3;
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
