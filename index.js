const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const db = require('./queries')
const authenticateToken = require('./middleware/auth')
require('dotenv').config()
const setupSwagger = require('./swagger');

setupSwagger(app)

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/', (request, response) => {
  response.json({ info: 'Codecademy Portafolio Project E-Commerce REST API' })
})

// Middleware to get or create cart based on user or session ID
const extractCartIdMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?.id // from JWT if logged in
    const sessionId = req.headers['x-session-id'] || req.cookies?.session_id

    if (!userId && !sessionId) {
      return res.status(400).json({ message: 'No user or session identifier found.' })
    }

    const cart = await db.getOrCreateCart(userId, sessionId)
    req.cartId = cart.id
    next()
  } catch (error) {
    next(error)
  }
}

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: A list of users
 */
app.get('/users', db.getUsers)

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: A list of orders
 */
app.get('/orders', db.getOrders)

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: A list of products
 */
app.get('/products', db.getProducts)

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User data
 */
app.get('/users/:id', db.getUserById)

/**
 * @swagger
 * /orders/{user_id}:
 *   get:
 *     summary: Get orders by user ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of user's orders
 */
app.get('/orders/:user_id', db.getOrdersByUserId)

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get authenticated user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile info
 */
app.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'User profile info',
    user: req.user,
  })
})

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: The user's cart
 */
app.get('/cart', authenticateToken, extractCartIdMiddleware, async (req, res) => {
  try {
    const items = await db.getCartItems(req.cartId)
    res.json({ cartId: req.cartId, items })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add or update a cart item
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               product_id:
 *                 type: integer
 *               quantity:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Item added or updated
 */
app.post('/cart/items', authenticateToken, extractCartIdMiddleware, async (req, res) => {
  const { product_id, quantity } = req.body
  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid product or quantity' })
  }

  try {
    const item = await db.addOrUpdateCartItem(req.cartId, product_id, quantity)
    res.status(201).json({ message: 'Item added/updated', item })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /cart/items/{itemId}:
 *   delete:
 *     summary: Remove an item from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Item removed
 */
app.delete('/cart/items/:itemId', authenticateToken, extractCartIdMiddleware, async (req, res) => {
  const itemId = parseInt(req.params.itemId)
  try {
    const deletedItem = await db.removeCartItem(req.cartId, itemId)
    if (deletedItem) {
      res.json({ message: 'Item removed', item: deletedItem })
    } else {
      res.status(404).json({ message: 'Item not found' })
    }
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /cart:
 *   delete:
 *     summary: Clear the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
app.delete('/cart', authenticateToken, extractCartIdMiddleware, async (req, res) => {
  try {
    await db.clearCartItems(req.cartId)
    res.json({ message: 'Cart cleared' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created
 */
app.post('/users', db.createUser)

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               stock:
 *                 type: integer
 *               price:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product created
 */
app.post('/products', db.createProduct)

/**
 * @swagger
 * /payment_methods:
 *   post:
 *     summary: Add a payment method
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: integer
 *               name:
 *                 type: string
 *               card_num:
 *                 type: string
 *               cvv:
 *                 type: string
 *               exp_date:
 *                 type: string
 *               balance:
 *                 type: number
 *     responses:
 *       201:
 *         description: Payment method added
 */
app.post('/payment_methods', db.createPaymentMethod)

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authenticated successfully
 */
app.post('/login', db.loginUser)

// Start server
app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})
