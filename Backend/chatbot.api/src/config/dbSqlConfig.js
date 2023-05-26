import mysql from 'mysql';
import dotenv from 'dotenv'
dotenv.config()

const connection = mysql.createConnection({
    host: process.env.SQLHOST,
    user: process.env.SQLUSER,
    password: process.env.SQLPASS,
    database: process.env.SQLDB,
});

export default connection;