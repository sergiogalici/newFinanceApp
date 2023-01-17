const mongoose = require("mongoose")

const portfolioSchema = new mongoose.Schema({
    name: {
        type: String,
        default: "default"
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    positions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Position"
    }],
    closedPositions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Position"
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
})

// These methods are added only for development purposes

portfolioSchema.methods.addFunds = function(amount) {
    if (amount <= 0) {
        throw new Error('Invalid amount');
    }
    this.balance += amount;
}

portfolioSchema.methods.removeFunds = function(amount) {
    if (this.balance - amount < 0) {
        throw new Error('Invalid amount');
    }
    this.balance -= amount;
}

const Portfolio = mongoose.model("Portfolio", portfolioSchema)

module.exports = Portfolio