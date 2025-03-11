<template>
  <footer class="w3-light-grey w3-small w3-center mt-auto" id="footer">
    <div class="w3-container w3-black w3-padding-32">
      <h1 style="text-align: left; margin-bottom: 10px">Subscribe</h1>
      <p style="text-align: left; margin-bottom: 10px">
        To get special offers and VIP treatment:
      </p>
      <form @submit.prevent="submitSubscribe" style="margin-bottom: 0">
        <p>
          <input
            class="w3-input w3-border"
            type="text"
            placeholder="Enter e-mail"
            v-model="subscribeEmail"
            style="width: 100%" />
        </p>
        <button
          type="submit"
          class="w3-button w3-red w3-margin-bottom"
          style="margin-top: 10px; display: flex">
          Subscribe
        </button>
      </form>
    </div>

    <div class="w3-row-padding">
      <div class="w3-col s4">
        <h4 style="margin-top: 10px">CONTACT:</h4>
        <p style="margin-top: 10px">Questions? Go ahead.</p>
        <form @submit.prevent="submitContact">
          <p style="margin-top: 10px">
            <input
              class="w3-input w3-border"
              type="text"
              placeholder="Name"
              v-model="contactForm.name"
              required />
          </p>
          <p style="margin-top: 10px">
            <input
              class="w3-input w3-border"
              type="text"
              placeholder="Email"
              v-model="contactForm.email"
              required />
          </p>
          <p style="margin-top: 10px">
            <input
              class="w3-input w3-border"
              type="text"
              placeholder="Subject"
              v-model="contactForm.subject"
              required />
          </p>
          <p style="margin-top: 10px">
            <input
              class="w3-input w3-border"
              type="text"
              placeholder="Message"
              v-model="contactForm.message"
              required />
          </p>
          <button type="submit" class="w3-button w3-block w3-black">
            Send
          </button>
        </form>
      </div>

      <div class="w3-col s4">
        <h4 style="margin-top: 10px">ABOUT:</h4>
        <p style="margin-top: 10px">
          <router-link to="/about">About us</router-link>
        </p>
        <p style="margin-top: 10px">
          <router-link to="/support">Support</router-link>
        </p>
        <p style="margin-top: 10px">
          <a href="https://www.ur.pl" target="_blank" rel="noopener noreferrer"
            >Find store</a
          >
        </p>
        <p style="margin-top: 10px">
          <router-link to="/help">Help</router-link>
        </p>
      </div>

      <div class="w3-col s4 w3-justify">
        <h4 style="margin-top: 10px">STORE:</h4>
        <p style="margin-top: 10px">
          <i class="fa fa-fw fa-map-marker"></i> Uniwersytet Rzeszowski
          (Rzeszów)
        </p>
        <p style="margin-top: 10px">
          <i class="fa fa-fw fa-phone"></i> +48 123 123 123
        </p>
        <p style="margin-top: 10px">
          <i class="fa fa-fw fa-envelope"></i> info@ur.pl
        </p>

        <h4 style="margin-top: 10px">WE ACCEPT:</h4>
        <p style="margin-top: 10px"><i class="fa fa-fw fa-cc-amex"></i> Amex</p>
        <p style="margin-top: 10px">
          <i class="fa fa-fw fa-credit-card"></i> Credit Card
        </p>
        <br />
        <i class="fa fa-facebook-official w3-hover-opacity w3-large"></i>
        <i class="fa fa-instagram w3-hover-opacity w3-large"></i>
        <i class="fa fa-snapchat w3-hover-opacity w3-large"></i>
        <i class="fa fa-pinterest-p w3-hover-opacity w3-large"></i>
        <i class="fa fa-twitter w3-hover-opacity w3-large"></i>
        <i class="fa fa-linkedin w3-hover-opacity w3-large"></i>
      </div>
    </div>

    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" :class="modalType" @click.stop>
        <p>{{ modalMessage }}</p>
        <button class="modal-close" @click="closeModal">Close</button>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { RouterLink } from "vue-router";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/firebase";

const authStore = useAuthStore();

const subscribeEmail = ref("");
const contactForm = ref({
  name: "",
  email: "",
  subject: "",
  message: "",
});

const showModal = ref(false);
const modalMessage = ref("");
const modalType = ref("");

function openModal(message, type = "error") {
  modalMessage.value = message;
  modalType.value = type;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  modalMessage.value = "";
  modalType.value = "";
}

// Funkcja zapisywania newslettera do kolekcji "newsletter"
async function submitSubscribe() {
  try {
    await addDoc(collection(db, "newsletter"), {
      email: subscribeEmail.value,
      subscribed_at: new Date().toISOString(),
    });
    openModal("Subscribed successfully!", "success");
    subscribeEmail.value = "";
  } catch (error) {
    console.error("Error subscribing:", error);
    openModal("Error subscribing", "error");
  }
}

// Funkcja zapisywania wiadomości kontaktowej do kolekcji "contact_messages"
async function submitContact() {
  try {
    await addDoc(collection(db, "contact_messages"), {
      name: contactForm.value.name,
      email: contactForm.value.email,
      subject: contactForm.value.subject,
      message: contactForm.value.message,
      sent_at: new Date().toISOString(),
    });
    openModal("Message sent successfully!", "success");
    contactForm.value = { name: "", email: "", subject: "", message: "" };
  } catch (error) {
    console.error("Error sending contact message:", error);
    openModal("Error sending message", "error");
  }
}
</script>

<style scoped>
.mt-auto {
  margin-top: auto;
}
.w3-hover-opacity {
  margin: 5px;
}
.w3-button {
  margin-top: 10px;
  margin-bottom: 10px;
  border-radius: 5px;
}
@media screen and (min-width: 640px) {
  footer {
    min-width: 65%;
    margin-left: 250px;
    z-index: 10;
    position: relative;
  }
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
  z-index: 999;
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
