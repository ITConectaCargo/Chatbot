import mongoose from "mongoose";
import dotenv from 'dotenv'
dotenv.config()

const dbUser = process.env.DBUSER
const dbPass = process.env.DBPASS

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@chatbot.x2hnrky.mongodb.net/ChatBot`)

let db = mongoose.connection

export default db