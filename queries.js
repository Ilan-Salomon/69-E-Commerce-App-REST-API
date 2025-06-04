const Pool = require('pg').Pool
const pool = new Pool({
  user: 'ilansalomon',
  host: 'localhost',
  database: 'ecommercerestapi',
  password: 'password',
  port: 5432,
})
const hf = require('./helper_functions')
const bcrypt = require('bcrypt')
const SALT_ROUNDS = 10
const jwt = require('jsonwebtoken')

const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
      const prettyPrint = (arr) => {
        return arr.map(user => `${user.id}, ${user.name}`); 
      }
      console.log(prettyPrint(results.rows))
    })
  }

  const getOrders = (request, response) => {
    pool.query('SELECT * FROM orders ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
      const prettyPrint = (arr) => {
        return arr.map(user => `${user.id}, ${user.name}`); 
      }
      console.log(prettyPrint(results.rows))
    })
  }

  const getProducts = (request, response) => {
    pool.query('SELECT * FROM products ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
      const prettyPrint = (arr) => {
        return arr.map(user => `${user.id}, ${user.name}`); 
      }
      console.log(prettyPrint(results.rows))
    })
  }


  const getUserById = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

  const getOrdersByUserId = (request, response) => {
    const user_id = parseInt(request.params.user_id)
  
    pool.query('SELECT * FROM orders WHERE user_id = $1', [user_id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

  const createUser = async (request, response) => {
    const { name, email, password } = request.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
      const result = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
        [name, email, hashedPassword]
      );
  
      response.status(201).json({
        message: "User created",
        user: { id: result.rows[0].id, name: result.rows[0].name, email: result.rows[0].email }
      });
    } catch (error) {
      console.error(error);
      response.status(500).send('Error creating user');
    }
  };
  

  const createProduct = (request, response) => {
    const { name, stock, price } = request.body
  
    pool.query('INSERT INTO products (name, stock, price) VALUES ($1, $2, $3) RETURNING *', [name, stock, price], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).json({
        message: "Product added",
        id: results.rows[0]
      })   
      console.log(results.rows) 
    })
  }


  const createPaymentMethod = (request, response) => {
    const { user_id, name, card_num, cvv, exp_date, balance } = request.body
  
    pool.query('INSERT INTO payment_methods (user_id, name, card_num, cvv, exp_date, balance) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [user_id, name, card_num, cvv, exp_date, balance], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).json({
        message: "New credit card added",
        id: results.rows[0]
      })   
      console.log(results.rows) 
    })
  }

/*
  const getProductPrice = async (request, response) => {
    const id = parseInt(request.params.id)
    const { products_id, qty } = request.body
  
    try {
      const result = await pool.query('SELECT price FROM products WHERE id = $1', [id])
      const rawPrice = result.rows[0].price // e.g., "$1.50"
  
      const numericPrice = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) // removes "$" and parses float
      console.log(numericPrice) // e.g., 1.5
  
      response.status(200).json({ price: numericPrice })
    } catch (error) {
      console.error(error)
      response.status(500).send('Error retrieving price')
    }
    return numericPrice * qty
  }
*/
  
const loginUser = (request, response) => {
    const { email, password } = request.body
  
    pool.query('SELECT * FROM users WHERE email = $1', [email], (error, results) => {
      if (error) {
        throw error
      }
  
      if (results.rows.length === 0) {
        return response.status(401).json({ message: 'Invalid email or password' })
      }
  
      const user = results.rows[0]
  
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          throw err
        }
  
        if (!isMatch) {
          return response.status(401).json({ message: 'Invalid email or password' })
        }
  
        // Password matches, create JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
          )
  
        response.json({ token })
      })
    })
  }


  module.exports = {
    getUsers, //GET list of all your users 
    getOrders, //GET a list of all the orders
    getProducts, //GET a list of all the products (a product catalog)
    getUserById, //GET a user by id
    getOrdersByUserId, //GET all orders from a certain user by its user_id
    createUser, //POST a new user
    createProduct, //POST a new product
    createPaymentMethod, //POST a new credit card
    //createOrder// POST a new order meaning add to kart
    loginUser //You accept user credentials (email and password) from the request body. You find the user in the DB by email. Use bcrypt to compare the password provided with the hashed password stored.If valid, generate a JWT token and send it back to the client. Client will use this token to access protected routes.

  }