# Bakery API

A Node.js/Express + MongoDB backend for the "Product list with cart" React project: products, sign-up and login (JWT), a per-user cart, and orders. Product images are hosted on Cloudinary.

- **Live API:** https://bakery-api-qqsg.onrender.com
- **API docs (Swagger):** https://ralpmike.github.io/my-bakery-api/ (also served by the API at `/api-docs`, raw spec at `/api-docs.json`). The Pages site is rebuilt from `src/docs/openapi.js` on every push to `main` by `.github/workflows/docs.yml`.

## Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Create `.env`** in the project root:
    ```
    MONGODB_URI=<MongoDB connection string, including the database name>
    JWT_SECRET=<any long random string>
    CLOUDINARY_URL=cloudinary://<api_key>:<api_secret>@<cloud_name>   # only for migrateToCloud.js
    ```
    `JWT_EXPIRES_IN` is optional (default `7d`).

3.  **Run the server**:
    - For production: `npm start`
    - For development (with auto-reload): `npm run dev`

The server will be running at `http://localhost:3000`.

## Scripts

| Command | What it does |
| :--- | :--- |
| `node migrateToCloud.js` | Uploads the product images in `data.json` to Cloudinary and creates/updates the products with those URLs. Safe to re-run. |
| `node seed.js` | **Deletes all products** and reloads them from `data.json` with local `/assets/...` image paths. |
| `node makeAdmin.js <email>` | Gives a registered user the admin role, which is needed to create, edit or delete products. |

## API Endpoints

🔒 = needs `Authorization: Bearer <token>` (get a token from register or login).

### Products

`:idOrName` is the product `_id` or its exact name (case-insensitive).

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/products` | Public | All products. |
| **GET** | `/api/products/:idOrName` | Public | One product. |
| **POST** | `/api/products` | 🔒 Admin | Add a product. |
| **PUT** | `/api/products/:idOrName` | 🔒 Admin | Replace a product. |
| **PATCH** | `/api/products/:idOrName` | 🔒 Admin | Update some fields of a product. |
| **DELETE** | `/api/products/:idOrName` | 🔒 Admin | Remove a product. |

### Auth

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Create a user (`name`, `email`, `password`). Returns a token. |
| **POST** | `/api/auth/login` | Public | Log in with `email` and `password`. Returns a token. |
| **GET** | `/api/auth/me` | 🔒 | The current user. |

### Cart

Each route returns the whole cart: `{ items: [{ product, quantity, lineTotal }], totalItems, totalPrice }`.

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/cart` | 🔒 | My cart. |
| **POST** | `/api/cart/items` | 🔒 | Add `{ productId, quantity? }` (adds to the quantity if already in the cart). |
| **PATCH** | `/api/cart/items/:productId` | 🔒 | Set `{ quantity }`; `0` removes the item. |
| **DELETE** | `/api/cart/items/:productId` | 🔒 | Remove an item. |
| **DELETE** | `/api/cart` | 🔒 | Empty the cart. |

### Orders

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/orders` | 🔒 | Place an order from the cart, then empty the cart. |
| **GET** | `/api/orders` | 🔒 | My orders, newest first. |
| **GET** | `/api/orders/:id` | 🔒 | One of my orders. |

### Static Assets

The icons (and local copies of the product images) are served at `/assets`, e.g. `http://localhost:3000/assets/images/icon-add-to-cart.svg`.

## Project Structure (MVC Architecture)

- `src/config/`: Database connection.
- `src/models/`: Mongoose models (Product, User, Cart, Order).
- `src/controllers/`: Request handling.
- `src/routes/`: Route definitions.
- `src/middleware/`: `protect` (requires a valid token) and `admin` (requires the admin role).
- `src/docs/openapi.js`: The OpenAPI spec behind `/api-docs`. Update it when you change an endpoint.
- `src/app.js`: Express app, middleware and route mounting.
- `index.js`: Server entry point.
- `assets/`: Icons and original product images.
- `data.json`: Source product data for the seed and migration scripts.
