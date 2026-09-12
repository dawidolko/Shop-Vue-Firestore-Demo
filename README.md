# Shop — Vue + Firestore

> 🔥 **The same shop, without a backend** — Vue 3 talking straight to Firestore, with security rules doing the work a controller used to

**Shop — Vue + Firestore** is the serverless twin of a classic Laravel storefront. The catalogue, baskets, purchases and checkout details live in Firestore collections; the Vue 3 app reads and writes them directly, and Firebase Authentication decides who may write what. There is no API layer in between, because the security rules are the API layer.

The repository ships the whole dataset as JSON plus an import script, so a fresh Firebase project can be filled in one command instead of by hand.

![Vue.js](https://img.shields.io/badge/Vue.js-3-4FC08D?logo=vuedotjs&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-9-FFCA28?logo=firebase&logoColor=black)
![Firestore](https://img.shields.io/badge/Firestore-NoSQL-FFA000?logo=firebase&logoColor=black)
![Pinia](https://img.shields.io/badge/Pinia-2-FFD859?logo=vuedotjs&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Key Features

- **No backend to run** — the browser talks to Firestore. What a controller used to enforce is enforced by security rules: anyone may read, only an authenticated user may write, and a user document may only be written by its owner.
- **The dataset ships with the code** — nine JSON files in `database/` and `importData.js` load a complete shop (products, users, baskets, purchases, shipping, invoice and payment details, newsletter, contact messages) into a fresh project.
- **A basket per account** — `user_product` links a line to a user, so the basket follows the account rather than the browser.
- **Checkout keeps its paperwork separate** — shipping, invoice and payment details are their own collections, the same split a relational version would use.
- **Browse by category or brand** — each has its own view and its own query, rather than filtering a full product list in the page.
- **Session in Pinia** — one store holds the Firebase user; route guards read it, components read it, nothing re-derives it.
- **The whole shop, not just the happy path** — help, support, contact, settings, an account panel and a 404 view are all part of the router.

---

## 🔥 Firestore Collections

| Collection          | What it holds                                        |
| ------------------- | ---------------------------------------------------- |
| `products`          | The catalogue: name, brand, category, price, images. |
| `users`             | Account profiles; writable only by their owner.      |
| `user_product`      | Basket lines, tied to a user.                        |
| `purchases`         | Completed orders.                                    |
| `shipping_details`  | Delivery data captured at checkout.                  |
| `invoice_details`   | Billing data captured at checkout.                   |
| `payment_details`   | Payment data captured at checkout.                   |
| `newsletter`        | Sign-ups.                                            |
| `contact_messages`  | Messages from the contact form.                      |

The rules that guard them are in `database/rules.txt`.

---

## 🛠️ Technology Stack

| Technology        | Version | Role                                                    |
| ----------------- | ------- | ------------------------------------------------------- |
| **Vue.js**        | 3.4     | Composition API single-file components.                 |
| **Vue Router**    | 4       | Views and guarded routes.                               |
| **Pinia**         | 2       | Session store around the Firebase user.                 |
| **Firebase**      | 9       | Firestore, Authentication, Analytics.                   |
| **firebase-admin**| 13      | The import script, run with a service account.          |
| **Vite**          | 5       | Dev server and build.                                   |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or newer
- A Firebase project with Firestore and Email/Password authentication enabled

### 1. Clone and install

```bash
git clone https://github.com/dawidolko/Shop-Vue-Firestore-Demo.git
cd Shop-Vue-Firestore-Demo
npm install
```

### 2. Point it at your Firebase project

Replace the config object in `src/firebase.js` with your own from the Firebase console.

### 3. Load the data

Download a service account key from the Firebase console, save it as `serviceAccountKey.json` in the project root, then:

```bash
node importData.js
```

This writes every file in `database/` into the matching Firestore collection.

### 4. Publish the rules

Copy `database/rules.txt` into the Firestore Rules tab, or deploy it with the Firebase CLI.

### 5. Run

```bash
npm run dev       # development server
npm run build     # production build
npm run preview   # serve the build locally
```

---

## 📁 Project Structure

```
Shop-Vue-Firestore-Demo/
├── database/                      # the dataset and the security rules
│   ├── products.json  users.json  user_product.json
│   ├── purchases.json  shipping_details.json
│   ├── invoice_details.json  payment_details.json
│   ├── newsletter.json  contact_messages.json
│   └── rules.txt
├── importData.js                  # firebase-admin loader for the files above
└── src/
    ├── firebase.js                # app, auth, firestore, analytics
    ├── views/
    │   ├── HomeView.vue  CategoryView.vue  BrandView.vue
    │   ├── ProductDetailView.vue  CartView.vue
    │   ├── AboutView.vue  ContactView.vue  HelpView.vue  SupportView.vue
    │   ├── ErrorView.vue
    │   └── Auth/                  # Login, Register, Panel, Settings
    ├── stores/auth.js             # Pinia session
    ├── router/                    # routes and guards
    └── layouts/
```

---

## 📄 License

MIT © [Dawid Olko](https://dawidolko.pl)
