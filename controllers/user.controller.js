import User from "../models/user.models.js";

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