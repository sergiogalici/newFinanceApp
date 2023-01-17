const { promisify } = require("util")
const jwt = require("jsonwebtoken")
const User = require("./../models/userModel")
const Watchlist = require("./../models/watchlistModel")
const bcrypt = require("bcryptjs")

// MIDDLEWARES

exports.validateToken = async (req, res, next) => {
    const auth = req.headers.authorization
    let token = ""

    // checking the correct input of the token in the request
    if (auth && auth.startsWith("Bearer")) {
        token = auth.split(" ")[1]
    }

    // checking if a token is provided
    if (!token) {
        return res.status(401).json({
            status: "fail",
            message: "You are not logged in"
        })
    }

    try {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)

        const currentUser = await User.findById(decoded.id)

        // Checking if the user associated to the token still exists
        if (!currentUser) {
            return res.status(401).json({
                status: "fail",
                message: "The user belonging to the token no longer exists"
            })
        }

        // Adding the user to the request
        req.user = currentUser

    } catch (err) {
        return res.status(401).json({
            status: "fail",
            message: "Invalid Token"
        })
    }

    next()
}

exports.validateWatchlist = async (req, res, next) => {
    try {
        const currentUser = req.user
        const watchlistId = req.params.id

        const currentWatchlist = await Watchlist
            .findOne({
                _id: watchlistId,
            ownerId: currentUser._id
            })

        if (!currentWatchlist) {
            return res.status(404).json({
                status: "fail",
                message: "Watchlist with provided id was not found or doesn't belong to the user that made the request"
            })
        }

        // adding the validated watchlist to the request
        req.watchlist = currentWatchlist
        next()
    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: err
        });
    }
}