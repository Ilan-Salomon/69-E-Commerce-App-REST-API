const Pool = require('pg').Pool
const pool = new Pool({
  user: 'ilansalomon',
  host: 'localhost',
  database: 'ecommercerestapi',
  password: 'password',
  port: 5432,
})

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



  module.exports = {
    getProductPrice
  }