# Shop-Vue-Firestore-Demo

A simple demo application showcasing how to use **Vue 3** and **Firebase Firestore** to build a basic e-commerce (shop) app.  
It demonstrates **CRUD** (Create, Read, Update, Delete) operations for products stored in a Firestore database, all in a straightforward Vue front end.

---

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [License](#license)

---

## Features

1. **List Products**: Fetch and display a list of products from Firestore.  
2. **Add Products**: Create new products by entering a name and price, then storing them in Firestore.  
3. **Real-time Updates**: (Optional) Firestore can be set up for real-time snapshots to reflect changes instantly.  
4. **Simple UI**: Built with Vue for easy component-based structure.

---

## Technologies Used

- [Vue 3](https://vuejs.org/)  
- [Firebase](https://firebase.google.com/) (Firestore)  
- [Vite](https://vitejs.dev/) or Vue CLI (depending on your setup)  
- JavaScript/TypeScript (depending on your preference)

---

## Getting Started

1. **Clone or download** this repository:
   ```bash
   git clone https://github.com/dawidolko/Shop-Vue-Firestore-Demo.git
   cd Shop-Vue-Firestore-Demo
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   or
   ```bash
   yarn
   ```

3. **Configure Firebase**:  
   - Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
   - Enable **Firestore** under the Build → Firestore Database section.
   - Copy the config from your Firebase project (apiKey, authDomain, etc.) into your `main.js`/`main.ts` file.

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   or
   ```bash
   yarn dev
   ```
   By default, your app should be available at `http://localhost:5173/` (the port may vary if you’re using different configs).

---

## Project Structure

Typical structure might look like this:
```
├─ src
│  ├─ App.vue
│  ├─ main.js (or main.ts)
│  └─ ...
├─ package.json
├─ vite.config.js (or equivalent)
└─ README.md
```

Key files:
- **`main.js`** – Initializes Firebase and sets up the Vue app, including Firestore config.
- **`Products.vue`** – Displays the product list and includes a form to add new products.
- **`App.vue`** – Root component that renders the `Products` component.

---

## Usage

1. **Listing Products**  
   - The `Products` component fetches existing products from Firestore’s `products` collection.

2. **Adding Products**  
   - Use the input fields for product name and price; click the "Add" button.  
   - The product is stored in the Firestore `products` collection with a random document ID.  
   - The UI updates automatically (fetches the new list after insertion).

3. **Modifying Products** (Optional)  
   - To enable updates, you can add `updateDoc` or `deleteDoc` from Firestore in the `Products.vue` methods.

4. **Firestore Security Rules**  
   - For demo purposes, you might allow open reads/writes in Firestore.  
   - In a real-world app, tighten security rules and/or require authenticated users.

---

## License

This project is open-source and available under the [MIT License](LICENSE), which means you can use and modify it freely for personal or commercial projects.

---

### Contact

If you have any questions or suggestions, feel free to open an issue on GitHub or reach out directly.

Enjoy building your shop with Vue and Firestore!
