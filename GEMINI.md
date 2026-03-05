# Project Overview: Product List with Cart (Data & Assets)

This directory contains the essential data and visual assets for the **Product List with Cart** project, typically associated with a Frontend Mentor challenge. It serves as a foundational resource for building a responsive web application that manages a product catalog and a shopping cart.

## Directory Overview

The project is structured to provide structured data and optimized images for different screen sizes:

- **Data**: A JSON file containing product details.
- **Assets**: A collection of product images and interactive icons.

## Key Files

### `data.json`
The core data source for the application. It contains an array of product objects, each including:
- `name`: The name of the dessert.
- `category`: The type of dessert (e.g., Waffle, Cake).
- `price`: The unit price.
- `image`: A nested object providing paths to responsive images (`thumbnail`, `mobile`, `tablet`, `desktop`).

### `assets/images/`
A comprehensive set of images and SVGs:
- **Product Images**: Four variants for each product (desktop, mobile, tablet, and thumbnail) to support responsive design using `<picture>` or `srcset`.
- **Icons**: SVG icons for user interactions:
  - `icon-add-to-cart.svg`: Initial action to add an item.
  - `icon-increment-quantity.svg` & `icon-decrement-quantity.svg`: Controls for adjusting cart quantities.
  - `icon-remove-item.svg`: To remove a specific item from the cart.
  - `icon-order-confirmed.svg`: Visual feedback for successful checkout.
  - `icon-carbon-neutral.svg`: A badge for environmental impact.
- **Illustrations**: `illustration-empty-cart.svg` for the empty state of the shopping cart.

## Usage

This directory is intended to be used as a starting point for a frontend development task. Developers should:
1. **Fetch/Import Data**: Use `data.json` to dynamically render the product list.
2. **Implement Responsive Images**: Use the provided variants in `assets/images` to ensure optimal loading and display across devices.
3. **Build Cart Logic**: Implement functionality to add, remove, and update quantities of items in a shopping cart, calculating totals based on the prices in `data.json`.
4. **State Management**: Manage the cart's state, including the empty state and the "Order Confirmed" modal.
