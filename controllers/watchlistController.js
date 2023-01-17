const User = require("./../models/userModel")
const Watchlist = require("./../models/watchlistModel")
const axios = require("axios")

// Endpoints Business Logic

exports.createWatchlist = async (req, res, next) => {
    const name = req.body.name
    const user = req.user

    // checking the validity of the name parameter provided with the request body
    if (!name) {
        return res.status(401).json({
            status: "fail",
            message: "A Watchlist must have a name"
        })
    }

    try {
        const newWatchlist = await Watchlist.create({
            name: name,
            ownerId: user
        })
    
        res.status(201).json({
            status: "success",
            watchlist: { ...newWatchlist }
        })
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: "Couldn't save watchlist"
        })
    }
}

exports.getAllWatchlistsByUserId = async (req, res, next) => {
    try {
        const user = req.user
        let watchlistArr = await Watchlist.find()

        watchlistArr = watchlistArr.filter(c => {
            return c.ownerId.toString() === user._id.toString()
        })
    
        // validating if there are watchlist associated to the user that made the request
        if (!watchlistArr.length) {
            return res.status(404).json({
                status: "fail",
                message: "No watchlists were found associated to the user that made the request"
            })
        }

        res.status(200).json({
            status: "success",
            watchlists: watchlistArr
        })

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: "Something went wrong"
        });
    }
}

exports.getWatchlistById = async (req, res, next) => {
    try {
        const watchlist = req.watchlist

        res.status(200).json({
            status: "success",
            watchlist
        });

    } catch (err) {
        res.status(404).json({
            status: "fail",
            message: "Something went wrong"
        });
    }
}

exports.updateWatchlistById = async (req, res, next) => {
    try {
        const requestName = req.body.name
        const watchlist = req.watchlist

        // Checking if the provided name
        if (!requestName.length || !requestName) {
            res.status(401).json({
                status: "fail",
                message: "A name cannot be empty"
            })
        }

        watchlist.name = requestName

        await watchlist.save()

        res.status(201).json({
            status: "success",
            updatedWatchlist: { ...watchlist }
        })

    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: "Something went wrong"
        })
    }
}

exports.deleteWatchlistById = async (req, res, next) => {
    try {
        const watchlist = req.watchlist

        await watchlist.delete()

        res.status(201).json({
            status: "success",
            deletedWatchlist: { ...watchlist }
        })

    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: "Something went wrong"
        })
    }
}

exports.updateWatchlistSymbolsById = async (req, res, next) => {
    try {
        const { add, remove } = req.body
        const watchlist = req.watchlist

        // Checking if there are symbols to remove
        if (Array.isArray(remove) && remove.length > 0) {
            watchlist.symbols = watchlist.symbols.filter(c => !remove.includes(c))
        } 

        // Checking if there are symbols to add
        if (Array.isArray(add) && add.length > 0) {

            // Checking if the requested symbols are valid symbols with Finnhub
            for (symbol of add) {
                // Checking if symbol is empty
                if (!symbol.length) {
                    return res.status(404).json({
                        status: "fail",
                        message: "One ore more than one symbols provided are empty"
                    });
                }

                // Calling the Finnhub API
                const response = await axios
                    .get(`https://finnhub.io/api/v1/search?q=${symbol}&token=${process.env.FINNHUB_API_KEY}`)

                // Checking if there are matching results
                if (response.data.count === 0 || response.data.result[0].displaySymbol !== symbol) {
                    return res.status(404).json({
                        status: "fail",
                        message: "One ore more than one symbols provided are not valid stock symbols"
                    });
                }
            }
            watchlist.symbols = Array.from(new Set([...watchlist.symbols, ...add]))
        } 

        await watchlist.save()

        res.status(201).json({
            status: "success",
            watchlist
        })

    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: "Something went wrong"
        })
    }
}