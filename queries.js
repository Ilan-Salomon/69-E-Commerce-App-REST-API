const Pool = require('pg').Pool
const pool = new Pool({
  user: 'ilansalomon',
  host: 'localhost',
  database: 'ecommercerestapi',
  password: 'password',
  port: 5432,
})

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

  const getUserById = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
  }

  const createUser = (request, response) => {
    const { name } = request.body
  
    pool.query('INSERT INTO users (name) VALUES ($1) RETURNING *', [name], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).json({
        message: "User added",
        id: results.rows[0]
      })   
      console.log(results.rows) 
    })
  }

  module.exports = {
    getUsers,
    getOrders,
    getUserById, 
    createUser
  }