import Subscription from '../models/subscription.models.js'

export const createSubscription = async (req, res, next) => {
    try{
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,
        })        
        res.status(201).json({success: true, data: subscription});
    } catch (error) {
        next(error)
    }
}

/**
 * @desc    Get all subscriptions for a specific user
 * @route   GET /api/subscriptions/user/:id
 * @access  Private (User can only access their own subscriptions)
 * @returns {Array} List of user's subscription objects
 * 
 * This function retrieves all subscriptions belonging to a specific user.
 * It includes authorization check to ensure users can only access their own subscriptions.
 */
export const getSubscriptions = async (req, res, next) => {
    try{
        if(req.user.id !== req.params.id) {
            return res.status(403).json({success: false, message: 'You are not authorized to view this subscription'})
        }
        const subscriptions = await Subscription.find({user: req.params.id});
        res.status(200).json({success: true, data: subscriptions});
    } catch (error) {
        next(error)
    }
}

export const getAllSubscriptions = async (req, res, next) => {
    try {
        const subscriptions = await Subscription.find();
        res.status(200).json({success: true, data: subscriptions});
    } catch (error) {
        next(error);
    }
}

/**
 * @desc    Get a single subscription by ID
 * @route   GET /api/subscriptions/:id
 * @access  Private (User can only access their own subscription)
 * @returns {Object} Single subscription object
 * 
 * This function retrieves a specific subscription by its ID.
 * Unlike getSubscriptions which returns multiple subscriptions for a user,
 * this function returns a single subscription with detailed information.
 * It includes authorization check to ensure users can only access their own subscription.
 */
export const getSubscriptionById = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Check if user is authorized to view this subscription
        if (req.user && subscription.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({success: false, message: 'You are not authorized to view this subscription'});
        }
        
        res.status(200).json({success: true, data: subscription});
    } catch (error) {
        next(error);
    }
}

export const updateSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Check if user is authorized to update this subscription
        if (req.user && subscription.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({success: false, message: 'You are not authorized to update this subscription'});
        }
        
        const updatedSubscription = await Subscription.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        res.status(200).json({success: true, data: updatedSubscription});
    } catch (error) {
        next(error);
    }
}

export const deleteSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Check if user is authorized to delete this subscription
        if (req.user && subscription.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({success: false, message: 'You are not authorized to delete this subscription'});
        }
        
        await Subscription.findByIdAndDelete(req.params.id);
        
        res.status(200).json({success: true, message: 'Subscription deleted successfully'});
    } catch (error) {
        next(error);
    }
}

export const cancelSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.findById(req.params.id);
        if (!subscription) {
            const error = new Error('Subscription not found');
            error.statusCode = 404;
            throw error;
        }
        
        // Check if user is authorized to cancel this subscription
        if (req.user && subscription.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({success: false, message: 'You are not authorized to cancel this subscription'});
        }
        
        // Update subscription status to cancelled
        subscription.status = 'cancelled';
        await subscription.save();
        
        res.status(200).json({success: true, message: 'Subscription cancelled successfully', data: subscription});
    } catch (error) {
        next(error);
    }
}

export const getUpcomingRenewals = async (req, res, next) => {
    try {
        // Get current date
        const currentDate = new Date();
        
        // Get date 30 days from now
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(currentDate.getDate() + 30);

        // Calculate next renewal dates based on frequency
        const upcomingRenewals = await Subscription.aggregate([
            {
                $match: {
                    status: 'active',
                    ...(req.user ? { user: req.user._id } : {})
                }
            },
            {
                $addFields: {
                    nextRenewalDate: {
                        $switch: {
                            branches: [
                                {
                                    case: { $eq: ["$frequency", "monthly"] },
                                    then: {
                                        $dateAdd: {
                                            startDate: "$startDate",
                                            unit: "month",
                                            amount: {
                                                $add: [
                                                    { $floor: { 
                                                        $divide: [
                                                            { $subtract: [currentDate, "$startDate"] },
                                                            { $multiply: [1000 * 60 * 60 * 24 * 30] }
                                                        ]
                                                    } },
                                                    1
                                                ]
                                            }
                                        }
                                    }
                                },
                                {
                                    case: { $eq: ["$frequency", "quarterly"] },
                                    then: {
                                        $dateAdd: {
                                            startDate: "$startDate",
                                            unit: "month",
                                            amount: {
                                                $multiply: [
                                                    3,
                                                    {
                                                        $add: [
                                                            { $floor: { 
                                                                $divide: [
                                                                    { $subtract: [currentDate, "$startDate"] },
                                                                    { $multiply: [1000 * 60 * 60 * 24 * 90] }
                                                                ]
                                                            } },
                                                            1
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                },
                                {
                                    case: { $eq: ["$frequency", "yearly"] },
                                    then: {
                                        $dateAdd: {
                                            startDate: "$startDate",
                                            unit: "year",
                                            amount: {
                                                $add: [
                                                    { $floor: { 
                                                        $divide: [
                                                            { $subtract: [currentDate, "$startDate"] },
                                                            { $multiply: [1000 * 60 * 60 * 24 * 365] }
                                                        ]
                                                    } },
                                                    1
                                                ]
                                            }
                                        }
                                    }
                                }
                            ],
                            default: "$startDate"
                        }
                    }
                }
            },
            {
                $match: {
                    nextRenewalDate: {
                        $gte: currentDate,
                        $lte: thirtyDaysFromNow
                    }
                }
            },
            {
                $sort: { nextRenewalDate: 1 }
            }
        ]);
        
        res.status(200).json({success: true, data: upcomingRenewals});
    } catch (error) {
        next(error);
    }
}