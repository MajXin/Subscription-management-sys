import mongoose from "mongoose"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { JWT_EXPIRES_IN, JWT_SECRET } from "../config/env.js";
import User from "../models/user.models.js";

/**
 * @desc    Register a new user with authentication
 * @route   POST /api/auth/signup
 * @access  Public
 * @returns {Object} User object with authentication token
 * 
 * This function handles user registration with immediate authentication.
 * It creates a new user account and returns a JWT token for immediate login.
 * Uses MongoDB transaction to ensure data consistency.
 */
export const signUp = async(req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const {name, email, password} = req.body;
        const existingUser  = await User.findOne({email});
        if(existingUser){
            const error = new Error('User already exists');
            error.statusCode = 409;
            throw error;
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUsers = await User.create([{ name , email , password: hashedPassword}], {session});
        const token = jwt.sign({userId: newUsers[0]._id}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});

        await session.commitTransaction();
        await session.endSession();
        res.status(201).json({
            success: true,
            message: 'User created',
            data: {
                token,
                user: newUsers[0],
            }
        });

    }catch(error){
        await session.abortTransaction();
        session.endSession();
        next(error);
    }
}

/**
 * @desc    Authenticate existing user and get token
 * @route   POST /api/auth/signin
 * @access  Public
 * @returns {Object} User object with authentication token
 * 
 * This function verifies user credentials and generates a JWT token
 * for authenticated API access.
 */
export const signIn = async(req, res, next) => {
    try{
     const {email, password} = req.body;
     const user = await User.findOne({email});
     
     if(!user){
        const error = new Error('User not found');
        error.statusCode = 404;
        throw error;
     }   

     const isPasswordValid = await bcrypt.compare(password, user.password);
     if(!isPasswordValid){
        const error = new Error('Invalid password');
        error.statusCode = 401;
        throw error;
     }
     
     const token = jwt.sign({userId: user._id}, JWT_SECRET, {expiresIn: JWT_EXPIRES_IN});
        res.status(200).json({
            success: true,
            message: 'User logged in',
            data: {
                token,
                user,
            }
        });
    }catch(error){
        next(error);
    }
}

/**
 * @desc    Log out user / clear cookie
 * @route   POST /api/auth/signout
 * @access  Private
 * @returns {Object} Success message
 * 
 * This function handles user logout. Note that token invalidation
 * happens on the client side as JWTs are stateless.
 */
export const signOut = async(req, res, next) => {
    //remove or invalidate the token on the client side
    try{
        res.status(200).json({
            success: true,
            message: 'User logged out',
        });
    }catch(error){
        next(error);
    }
}