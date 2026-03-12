const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },

    password: {
        type: String,
        required: true
    },

    phone: {
        type: String
    },

    avatar: {
        type: String,
        default: ""
    },

    bio: {
        type: String,
        default: ""
    },

    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },

    ridesCreated: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ride"
        }
    ],

    ridesJoined: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Ride"
        }
    ],

    rideCreatedCount: {
        type: Number,
        default: 0
    },

    rideJoinedCount: {
        type: Number,
        default: 0
    },

    rating: {
        type: Number,
        default: 0
    },

    ratingCount: {
        type: Number,
        default: 0
    },

    isVerified: {
        type: Boolean,
        default: false
    }

},
{ timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
