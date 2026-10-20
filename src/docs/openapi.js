// OpenAPI 3 description of the API, served as Swagger UI at /api-docs and as JSON at /api-docs.json

const bearer = [{ bearerAuth: [] }];
const json = (schema, example) => ({ 'application/json': { schema, ...(example && { example }) } });
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const error = (description, message) => ({
    description,
    content: json(ref('Error'), { success: false, message })
});

const errors = {
    notLoggedIn: error('Missing, invalid or expired token', 'Not authorized, no token'),
    notAdmin: error('Logged in, but not an admin', 'Admin access required'),
    productNotFound: error('No product with that id or name', 'Product not found')
};

const idOrName = {
    name: 'idOrName',
    in: 'path',
    required: true,
    description: 'The product `_id`, or its exact name (case-insensitive)',
    schema: { type: 'string' },
    example: 'Waffle with Berries'
};
const productId = {
    name: 'productId',
    in: 'path',
    required: true,
    description: 'The `_id` of the product in the cart',
    schema: { type: 'string' }
};

const cartResponse = (description) => ({ description, content: json(ref('Cart')) });

module.exports = {
    openapi: '3.0.3',
    info: {
        title: 'Bakery API',
        version: '1.0.0',
        description: [
            'Backend for the **Product list with cart** React project: browse desserts, sign up and log in, manage a cart, and place orders.',
            '',
            '**Logging in with Swagger:** call `POST /api/auth/login` (or `register`), copy the `token` from the response, click **Authorize** and paste it. Routes with a padlock then send `Authorization: Bearer <token>`.',
            '',
            '**In React:** send the same header yourself, for example',
            '`fetch(url, { headers: { Authorization: `Bearer ${token}` } })`.',
            '',
            '**Errors** all have the shape `{ "success": false, "message": "..." }` (validation errors use `error` instead of `message`).',
            '',
            'The live server sleeps when idle, so the first request after a while can take up to a minute.'
        ].join('\n')
    },
    servers: [
        { url: 'https://bakery-api-qqsg.onrender.com', description: 'Live' },
        { url: 'http://localhost:3000', description: 'Local' }
    ],
    tags: [
        { name: 'Products', description: 'Anyone can read products. Only admins can change them.' },
        { name: 'Auth', description: 'Sign up, log in, and get the current user.' },
        { name: 'Cart', description: "The logged-in user's cart. Every route needs a token." },
        { name: 'Orders', description: "Check out the cart and view the logged-in user's orders. Every route needs a token." }
    ],
    paths: {
        '/api/products': {
            get: {
                tags: ['Products'],
                summary: 'Get all products',
                responses: { 200: { description: 'All products', content: json({ type: 'array', items: ref('Product') }) } }
            },
            post: {
                tags: ['Products'],
                summary: 'Create a product (admin)',
                security: bearer,
                requestBody: { required: true, content: json(ref('ProductInput')) },
                responses: {
                    201: { description: 'Created product', content: json(ref('Product')) },
                    400: error('Missing fields or duplicate name', 'Product validation failed: price: Please add a price'),
                    401: errors.notLoggedIn,
                    403: errors.notAdmin
                }
            }
        },
        '/api/products/{idOrName}': {
            parameters: [idOrName],
            get: {
                tags: ['Products'],
                summary: 'Get a single product',
                responses: {
                    200: { description: 'The product', content: json(ref('Product')) },
                    404: errors.productNotFound
                }
            },
            put: {
                tags: ['Products'],
                summary: 'Replace a product (admin)',
                security: bearer,
                requestBody: { required: true, content: json(ref('ProductInput')) },
                responses: {
                    200: { description: 'Updated product', content: json(ref('Product')) },
                    400: error('Invalid fields', 'Validation failed'),
                    401: errors.notLoggedIn,
                    403: errors.notAdmin,
                    404: errors.productNotFound
                }
            },
            patch: {
                tags: ['Products'],
                summary: 'Update some fields of a product (admin)',
                security: bearer,
                requestBody: {
                    required: true,
                    description: 'Any of the ProductInput fields',
                    content: json({ type: 'object', additionalProperties: true }, { price: 7 })
                },
                responses: {
                    200: { description: 'Updated product', content: json(ref('Product')) },
                    401: errors.notLoggedIn,
                    403: errors.notAdmin,
                    404: errors.productNotFound
                }
            },
            delete: {
                tags: ['Products'],
                summary: 'Delete a product (admin)',
                security: bearer,
                responses: {
                    200: { description: 'Deleted', content: json(ref('Message'), { success: true, message: 'Product deleted successfully' }) },
                    401: errors.notLoggedIn,
                    403: errors.notAdmin,
                    404: errors.productNotFound
                }
            }
        },
        '/api/auth/register': {
            post: {
                tags: ['Auth'],
                summary: 'Sign up',
                requestBody: {
                    required: true,
                    content: json(ref('RegisterInput'), { name: 'Ada Lovelace', email: 'ada@example.com', password: 'secret123' })
                },
                responses: {
                    201: { description: 'Account created and logged in', content: json(ref('AuthResponse')) },
                    400: error('Email already used, or a field is missing or invalid', 'Email is already registered')
                }
            }
        },
        '/api/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Log in',
                requestBody: {
                    required: true,
                    content: json(ref('LoginInput'), { email: 'ada@example.com', password: 'secret123' })
                },
                responses: {
                    200: { description: 'Logged in', content: json(ref('AuthResponse')) },
                    400: error('Email or password missing', 'Please provide an email and password'),
                    401: error('Wrong email or password', 'Invalid email or password')
                }
            }
        },
        '/api/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Get the logged-in user',
                description: 'Use this when the app loads with a saved token, to check it is still valid.',
                security: bearer,
                responses: {
                    200: { description: 'The current user', content: json({ type: 'object', properties: { success: { type: 'boolean' }, user: ref('User') } }) },
                    401: errors.notLoggedIn
                }
            }
        },
        '/api/cart': {
            get: {
                tags: ['Cart'],
                summary: 'Get my cart',
                security: bearer,
                responses: { 200: cartResponse('The cart (empty if nothing has been added)'), 401: errors.notLoggedIn }
            },
            delete: {
                tags: ['Cart'],
                summary: 'Empty my cart',
                security: bearer,
                responses: { 200: cartResponse('The now-empty cart'), 401: errors.notLoggedIn }
            }
        },
        '/api/cart/items': {
            post: {
                tags: ['Cart'],
                summary: 'Add a product to my cart',
                description: 'If the product is already in the cart, `quantity` is added to it.',
                security: bearer,
                requestBody: {
                    required: true,
                    content: json({
                        type: 'object',
                        required: ['productId'],
                        properties: {
                            productId: { type: 'string', description: 'The product `_id`' },
                            quantity: { type: 'integer', minimum: 1, default: 1 }
                        }
                    }, { productId: '<_id from GET /api/products>', quantity: 1 })
                },
                responses: {
                    201: cartResponse('The updated cart'),
                    400: error('Invalid quantity', 'Quantity must be a whole number of at least 1'),
                    401: errors.notLoggedIn,
                    404: errors.productNotFound
                }
            }
        },
        '/api/cart/items/{productId}': {
            parameters: [productId],
            patch: {
                tags: ['Cart'],
                summary: 'Change the quantity of a cart item',
                description: 'Sets the quantity (it does not add to it). A quantity of 0 removes the item. Use this for the + and − buttons.',
                security: bearer,
                requestBody: {
                    required: true,
                    content: json({ type: 'object', required: ['quantity'], properties: { quantity: { type: 'integer', minimum: 0 } } }, { quantity: 2 })
                },
                responses: {
                    200: cartResponse('The updated cart'),
                    400: error('Invalid quantity', 'Quantity must be a whole number of 0 or more'),
                    401: errors.notLoggedIn,
                    404: error('That product is not in the cart', 'Item not in cart')
                }
            },
            delete: {
                tags: ['Cart'],
                summary: 'Remove a product from my cart',
                security: bearer,
                responses: {
                    200: cartResponse('The updated cart'),
                    401: errors.notLoggedIn,
                    404: error('That product is not in the cart', 'Item not in cart')
                }
            }
        },
        '/api/orders': {
            post: {
                tags: ['Orders'],
                summary: 'Confirm order (check out my cart)',
                description: 'Creates an order from everything in the cart, then empties the cart. No request body.',
                security: bearer,
                responses: {
                    201: { description: 'The new order', content: json(ref('Order')) },
                    400: error('Nothing to order', 'Cart is empty'),
                    401: errors.notLoggedIn
                }
            },
            get: {
                tags: ['Orders'],
                summary: 'Get my orders',
                description: 'Newest first.',
                security: bearer,
                responses: {
                    200: { description: 'My orders', content: json({ type: 'array', items: ref('Order') }) },
                    401: errors.notLoggedIn
                }
            }
        },
        '/api/orders/{id}': {
            get: {
                tags: ['Orders'],
                summary: 'Get one of my orders',
                security: bearer,
                parameters: [{ name: 'id', in: 'path', required: true, description: 'The order `_id`', schema: { type: 'string' } }],
                responses: {
                    200: { description: 'The order', content: json(ref('Order')) },
                    401: errors.notLoggedIn,
                    404: error("No order with that id (or it isn't yours)", 'Order not found')
                }
            }
        }
    },
    components: {
        securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
        },
        schemas: {
            Image: {
                type: 'object',
                properties: {
                    thumbnail: { type: 'string', format: 'uri' },
                    mobile: { type: 'string', format: 'uri' },
                    tablet: { type: 'string', format: 'uri' },
                    desktop: { type: 'string', format: 'uri' }
                }
            },
            Product: {
                type: 'object',
                properties: {
                    _id: { type: 'string', example: '6ad7392b096760c751c0f292' },
                    name: { type: 'string', example: 'Waffle with Berries' },
                    category: { type: 'string', example: 'Waffle' },
                    price: { type: 'number', example: 6.5 },
                    image: ref('Image'),
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            ProductInput: {
                type: 'object',
                required: ['name', 'category', 'price', 'image'],
                properties: {
                    name: { type: 'string', example: 'Chocolate Croissant' },
                    category: { type: 'string', example: 'Pastry' },
                    price: { type: 'number', example: 4.25 },
                    image: ref('Image')
                }
            },
            User: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    name: { type: 'string', example: 'Ada Lovelace' },
                    email: { type: 'string', example: 'ada@example.com' },
                    role: { type: 'string', enum: ['user', 'admin'] },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' }
                }
            },
            RegisterInput: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 }
                }
            },
            LoginInput: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' }
                }
            },
            AuthResponse: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: true },
                    token: { type: 'string', description: 'Send as `Authorization: Bearer <token>`. Valid for 7 days.' },
                    user: {
                        type: 'object',
                        properties: {
                            id: { type: 'string' },
                            name: { type: 'string', example: 'Ada Lovelace' },
                            email: { type: 'string', example: 'ada@example.com' },
                            role: { type: 'string', enum: ['user', 'admin'], example: 'user' }
                        }
                    }
                }
            },
            Cart: {
                type: 'object',
                properties: {
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                product: ref('Product'),
                                quantity: { type: 'integer', example: 2 },
                                lineTotal: { type: 'number', example: 13 }
                            }
                        }
                    },
                    totalItems: { type: 'integer', example: 2 },
                    totalPrice: { type: 'number', example: 13 }
                }
            },
            Order: {
                type: 'object',
                properties: {
                    _id: { type: 'string' },
                    user: { type: 'string' },
                    items: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                product: { type: 'string' },
                                name: { type: 'string', example: 'Waffle with Berries' },
                                price: { type: 'number', example: 6.5 },
                                quantity: { type: 'integer', example: 2 },
                                image: { type: 'string', format: 'uri', description: 'Thumbnail URL' }
                            }
                        }
                    },
                    totalPrice: { type: 'number', example: 13 },
                    createdAt: { type: 'string', format: 'date-time' }
                }
            },
            Message: {
                type: 'object',
                properties: { success: { type: 'boolean' }, message: { type: 'string' } }
            },
            Error: {
                type: 'object',
                properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string' },
                    error: { type: 'string', description: 'Used instead of message for validation errors' }
                }
            }
        }
    }
};
