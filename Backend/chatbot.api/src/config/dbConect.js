import mongoose from "mongoose";

mongoose.connect('mongodb+srv://wesleymoraes:hbNZ0K66he7QdqD1@chatbot.x2hnrky.mongodb.net/Chatbot');

let db = mongoose.connection;

export default db;