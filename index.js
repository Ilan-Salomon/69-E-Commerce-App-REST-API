const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 3000
const db = require('./queries')
const authenticateToken = require('./middleware/auth')
require('dotenv').config();

//const cors = require('cors')
//app.use(cors())

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.get('/', (request, response) => {
    response.json({ info: 'Codecademy Portafolio Project E-Commerce REST API' })
  })

//GET Routes:
app.get('/users', db.getUsers)
app.get('/orders', db.getOrders)
app.get('/products', db.getProducts)
app.get('/users/:id', db.getUserById)
app.get('/orders/:user_id', db.getOrdersByUserId)
app.get('/profile', authenticateToken, (req, res) => {
  res.json({
    message: 'User profile info',
    user: req.user
  })
})

//POST Routes:
app.post('/users', db.createUser)
app.post('/products', db.createProduct)
app.post('/payment_methods', db.createPaymentMethod)
app.post('/login', db.loginUser)


//app.post('/orders/:id', db.createOrder) //add to kart

/*
app.put('/users/:id', db.updateUser)
app.delete('/users/:id', db.deleteUser)
*/

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
  })