import mongoose from "mongoose";
import { DB_URI, NODE_ENV } from "../config/env.js";

if(!DB_URI) {
    throw new Error('Database URI is not defined');
}

const connectToDatabase = async () => {
    try{
        await mongoose.connect(DB_URI);
        console.log(`Connected to MongoDB in ${NODE_ENV} mode`);
    }
    catch (error) {
        console.error('Error connecting to database:', error);
        throw error;
    }
}

export default connectToDatabase;