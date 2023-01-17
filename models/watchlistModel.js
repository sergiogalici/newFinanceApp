const mongoose = require("mongoose")

const watchlistSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    symbols: [{
        type: String
    }]
})

const Watchlist = mongoose.model("Watchlist", watchlistSchema)

module.exports = Watchlist