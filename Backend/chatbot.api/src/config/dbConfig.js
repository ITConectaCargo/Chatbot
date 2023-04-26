import mongoose from "mongoose";

mongoose.connect("mongodb+srv://wesleymoraes:Tuco0periquito@chatbot.x2hnrky.mongodb.net/ChatBot")

let db = mongoose.connection

export default db