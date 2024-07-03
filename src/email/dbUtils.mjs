import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.connect()
  .then(client => {
    console.log('Database connected successfully');
    client.release();
  })
  .catch(err => {
    console.error('Error connecting to the database', err.stack);
  });

export default pool;


async function getPolicyStatus(toEmail) {
  try {
    const result = await pool.query('SELECT policy_status FROM policy_user_details WHERE email_address = $1', [toEmail]);
    return result.rows[0].policy_status;
  } catch (error) {
    console.error('Error fetching policy status:', error);
    throw error;
  }
}

async function updateMobileNumber(newNumber, toEmail) {
  try {
    const result = await pool.query('UPDATE policy_user_details SET mobile_number = $1 WHERE email_address = $2', [newNumber, toEmail]);
    return result.rowCount;
  } catch (error) {
    console.error('Error updating mobile number:', error);
    throw error;
  }
}

export { getPolicyStatus, updateMobileNumber };
