const mongoose = require("mongoose")

const positionSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true
    },
    shares: {
        type: Number,
        required: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    opening: {
        date: {
            type: Date,
            default: Date.now
        },
        price: {
            type: Number,
            required: true
        }
    },
    closing: {
        date: {
            type: Date,
            default: undefined
        },
        price: {
            type: Number,
            default: undefined
        }
    },
    status: {
        type: String,
        default: "opened",
        enum: ["opened", "closed"]
    }
});

const Position = mongoose.model("Position", positionSchema)

module.exports = Position