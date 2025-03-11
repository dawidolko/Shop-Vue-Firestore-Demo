import { defineStore } from "pinia";
import { auth, db } from "@/firebase";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
} from "firebase/auth";

export const useAuthStore = defineStore("authStore", {
  state: () => ({
    user: null, // obiekt z Firebase Auth
    userDoc: null,
    errors: {},
    modalMessage: "",
    modalType: "",
    showModal: false,
  }),
  actions: {
    initAuth() {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
          this.user = user || null;
          if (this.user) {
            await this.fetchUserDoc();
          } else {
            this.userDoc = null;
          }
          resolve();
        });
      });
    },
    async getUser() {
      await this.initAuth();
    },
    async fetchUserDoc() {
      if (!this.user) return;
      try {
        const docRef = doc(db, "users", this.user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          this.userDoc = docSnap.data();
        } else {
          console.warn("User doc not found in Firestore");
          this.userDoc = null;
        }
      } catch (error) {
        console.error("fetchUserDoc error:", error);
      }
    },

    async login(email, password) {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        this.user = userCredential.user;
        this.errors = {};
        await this.fetchUserDoc();
      } catch (error) {
        console.error("Login error:", error);
        this.errors = { message: error.message };
      }
    },

    async register(name, email, password) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        this.user = userCredential.user;
        this.errors = {};
        await setDoc(doc(db, "users", this.user.uid), {
          name: name,
          email: email,
          role_id: 0,
          createdAt: new Date().toISOString(),
        });
        await this.fetchUserDoc();
      } catch (error) {
        console.error("Registration error:", error);
        this.errors = { message: error.message };
      }
    },

    async logout() {
      try {
        await signOut(auth);
        this.user = null;
        this.userDoc = null;
        this.errors = {};
      } catch (error) {
        console.error("Logout error:", error);
      }
    },

    async authenticate(type, formData) {
      if (type === "login") {
        await this.login(formData.email, formData.password);
      } else if (type === "register") {
        await this.register(formData.name, formData.email, formData.password);
      }
    },
    async updateProfile({ name, password }) {
      try {
        this.errors = {};
        if (this.user) {
          const docRef = doc(db, "users", this.user.uid);
          await updateDoc(docRef, { name: name });
          if (!this.userDoc) this.userDoc = {};
          this.userDoc.name = name;
        }
        if (password && password.length > 0) {
          await updatePassword(this.user, password);
        }
        return { success: true };
      } catch (error) {
        console.error("updateProfile error:", error);
        this.errors = { message: error.message };
        return { success: false, error: error.message };
      }
    },
  },
  getters: {
    isAdmin(state) {
      return state.userDoc && state.userDoc.role_id === 1;
    },
  },
});
