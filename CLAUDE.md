# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm install`: install dependencies
- `npm run dev`: run the server with nodemon auto-reload (port `PORT`, default 3000)
- `npm start`: run the server without reload
- `node seed.js`: **wipe** the `products` collection and reload it from `data.json`, with image paths rewritten to local `/assets/...` URLs
- `node migrateToCloud.js`: upload every image in `data.json` to Cloudinary (folder `bakery_project`) and upsert products with Cloudinary URLs
- `node makeAdmin.js <email>`: give a registered user the `admin` role
- `node scripts/buildDocs.js`: build the static Swagger site into `_site/` (CI deploys it to GitHub Pages at https://ralpmike.github.io/my-bakery-api/)

There is no test suite or linter (`npm test` is a placeholder that exits with an error).

## Environment

Values come from `.env` (gitignored) through `dotenv`:
- `MONGODB_URI`: required. `src/config/database.js` calls `process.exit(1)` if the connection fails, so the server won't start without a reachable MongoDB. The URI names the `bakery` database.
- `JWT_SECRET`: required for auth. `JWT_EXPIRES_IN` is optional (default `7d`).
- `CLOUDINARY_URL`: used only by `migrateToCloud.js`.

The app is deployed on Render at https://bakery-api-qqsg.onrender.com (free tier, so it cold-starts). Render has its own copy of these variables.

## Architecture

Express 5 + Mongoose REST API, laid out as MVC: `index.js` → `src/app.js` (DB connect, middleware, static `/assets`, route mounting, Swagger UI at `/api-docs`) → `src/routes/*` → `src/controllers/*` → `src/models/*`. Resources: products (`/api/products`), auth (`/api/auth`), cart (`/api/cart`) and orders (`/api/orders`).

Things that aren't obvious from any one file:
- **This API is the backend for a React course final project.** Students consume it from the live URL, so changing a route or response shape breaks their apps. Keep `src/docs/openapi.js` (the hand-written OpenAPI spec behind `/api-docs`) in sync with any endpoint change.
- **Auth:** `protect` in `src/middleware/authMiddleware.js` reads `Authorization: Bearer <token>` and sets `req.user`. `admin` must come after `protect`. Product reads are public; product writes need `protect, admin`. Cart and order routers apply `protect` to every route. The `User` password field is `select: false`, so add `.select('+password')` to any query that needs it.
- **Product lookup:** `/:name` routes accept either a 24-hex `_id` or the exact name (case-insensitive, regex-escaped); see `productFilter` in `productController.js`. Don't use `mongoose.isValidObjectId` for this, because it accepts any 12-character string.
- **Cart:** one `Cart` document per user, holding product references. `loadCart`/`formatCart` in `cartController.js` populate the products, drop items whose product was deleted, and compute `lineTotal`/`totalPrice`. `orderController` reuses them. Orders copy name, price and thumbnail at checkout, so later product edits don't change past orders.
- **Image URLs come in two forms, depending on which script loaded the data.** After `seed.js`, they are root-relative paths served by the app's static `/assets` route. After `migrateToCloud.js`, they are absolute Cloudinary URLs. The migration script can be re-run: it upserts each product by `name`, and it uploads each image with a fixed `public_id` (the file name) and `overwrite: true`.
- `PUT` runs validators, but `PATCH` (`$set`) does not.
- Responses: success bodies return the document(s) or cart directly. Error bodies have the shape `{ success: false, message | error }`.
