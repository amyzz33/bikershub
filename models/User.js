const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: function () {
            return !this.isSocialLogin; // ✅ not required for Google users
        },
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
        required: function () {
            return !this.isSocialLogin; // ✅ not required for Google users
        }
    },

    googleId: {
        type: String
    },
    refreshToken: {
  type: String
},

    isSocialLogin: {
        type: Boolean,
        default: false
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
    // 🔥 ADD THESE (VERY IMPORTANT)
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

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