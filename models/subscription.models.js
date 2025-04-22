import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subscription Name is required'],
        trim: true,
        minLength: 2,
        maxLength: 100,
    },
    price:{
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be a positive number'],
    },
    currency:{
        type: String,
        enum: ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'HKD'],
        required: [true, 'Currency is required'],
        default: 'INR',
    },
    frequency:{
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
    },
    category: {
        type: String,
        enum: ['sports', 'entertainment', 'news', 'education', 'health', 'lifestyle', 'technology', 'business', 'other'],
        required: true,
    },
    paymentMethod: {
        type: String,
        required: true,
        trim: true,
    },
    status: {
        type: String,
        enum: ['active', 'cancelled', 'expired'],
        default: 'active',
    },
    startDate: {
        type: Date,
        required: true,
        validate : {
            validator: (value) => value <= new Date(),
            message: 'Start date must be in the past',
        }
    },
    renewalDate: {
        type: Date,
        validate: {
            validator: function(value){
                return value > this.startDate;
            },
            message: 'Renewal date must be after start date',
        }
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    }
}, {timestamps: true});

subscriptionSchema.pre('save',  function(next) {
    if(!this.renewalDate){
        const renewalPeriods = {
            daily: 1,
            weekly: 7,
            monthly: 30,
            yearly: 365,
        };
        this.renewalDate = new Date(this.startDate);
        this.renewalDate.setDate(this.startDate.getDate() + renewalPeriods[this.frequency]);
    }
    if(this.renewalDate < this.startDate){
        this.status = 'expired';
    }
    next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;
