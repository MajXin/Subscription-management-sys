import User from "../models/user.models.js";
import bcrypt from "bcryptjs";

export const getUsers = async (req, res, next) => {
    try{
        const users = await User.find().select('-password');
        if(!users || users.length === 0){
            const error = new Error('No users found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ success: true, data: users});
    } catch (error) {
        next(error);
    }
}

export const getUser = async (req, res, next) => {
    try{
        const user = await User.findById(req.params.id).select('-password');
        if(!user){
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({ success: true, data: user});
    } catch (error) {
        next(error);
    }
}

/**
 * @desc    Create a new user (admin function)
 * @route   POST /api/users
 * @access  Admin/Public
 * @returns {Object} User object without authentication token
 * 
 * This function creates a user account without authentication.
 * Unlike signUp in auth.controller.js, this doesn't:
 * - Use transactions
 * - Generate authentication tokens
 * - Log the user in automatically
 * 
 * This is typically used for admin user management rather than self-registration.
 */
export const createUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error('User with this email already exists');
            error.statusCode = 409;
            throw error;
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });
        
        // Remove password from response
        const userResponse = newUser.toObject();
        delete userResponse.password;
        
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: userResponse
        });
    } catch (error) {
        next(error);
    }
}

export const updateUser = async (req, res, next) => {
    try {
        // Check if user exists
        const user = await User.findById(req.params.id);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Check if user is authorized to update this profile
        if (req.user && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this profile'
            });
        }
        
        const { name, email, password } = req.body;
        const updateData = {};
        
        // Only update fields that are provided
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        
        // If password is provided, hash it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }
        
        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');
        
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        next(error);
    }
}

export const deleteUser = async (req, res, next) => {
    try {
        // Check if user exists
        const user = await User.findById(req.params.id);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Check if user is authorized to delete this profile
        if (req.user && req.user._id.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this profile'
            });
        }
        
        // Delete user
        await User.findByIdAndDelete(req.params.id);
        
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}