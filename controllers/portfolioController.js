const Portfolio = require("./../models/portfolioModel")
const Position = require("./../models/positionModel")
const User = require("./../models/userModel")
const axios = require("axios")
// ENDPOINTS BUSINESS LOGIC

exports.getUserPortfolio = async (req, res, next) => {
    try {
        const user = req.user
        const portfolio = await Portfolio.findOne({ ownerId: user._id })

        if (!portfolio) {
            res.status(404).json({
                status: "fail",
                message: "No Portfolios were found associated with the user that made the request"
            })
        }

        let positions = (await Position.find()).filter(c => c.ownerId = user._id)

        if (req.query.history !== "1") {
            portfolio.set('closedPositions', undefined, {strict: false})
            return res.status(200).json({
                status: "success",
                portfolio,
                positions
            })
        }
        
        res.status(200).json({
            status: "success",
            portfolio,
            positions
        })
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: "Something went wrong"
        })
    }
}

exports.openPortfolioPosition = async (req, res, next) => {
    try {
        const user = req.user
        const portfolio = await Portfolio.findOne({ ownerId: user._id })
        const { symbol, quantity } = req.body
        let symbolPrice

        if (!portfolio) {
            return res.status(404).json({
                status: "fail",
                message: "No Portfolios were found associated with the user that made the request"
            })
        }

        if (!quantity) {
            return res.status(404).json({
                status: "fail",
                message: "User must specify the amount of shares that wants to aquire"
            })
        }

        // Validating the symbol coming from the request body with the Finnhub API
        const response = await axios
            .get(`https://finnhub.io/api/v1/search?q=${symbol}&token=${process.env.FINNHUB_API_KEY}`)
        
        if (response.data.count === 0 || response.data.result[0].displaySymbol !== symbol) {
            return res.status(404).json({
                status: "fail",
                message: "The symbol provided is not a valid stock symbol"
            });
        }

        // Getting the price of the symbol
        const quoteRes = await axios
            .get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`)

        // Price Calculation Logic
        symbolPrice = parseInt(quoteRes.data.c)
        totalPrice = symbolPrice * parseInt(quantity)

        // this is only for development purposes, for production
        // a third party library like "Stripe" would be used instead
        // and Security methods and hooks inside the portfolioModel.js would be applied
        portfolio.addFunds(400)

        if (portfolio.balance < totalPrice) {
            return res.status(402).json({
                status: "fail",
                message: "Not enough funds"
            });
        }

        portfolio.removeFunds(totalPrice)

        // Creating a new opened position
        const newPostion = await Position.create({
            symbol: symbol,
            shares: quantity,
            ownerId: user,
            opening: {
                price: symbolPrice
            }
        })

        portfolio.positions.push(newPostion)

        let positions = (await Position.find()).filter(c => c.ownerId = user._id)

        await portfolio.save()

        res.status(201).json({
            status: "success",
            portfolio,
            positions
        })
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: "Something went wrong"
        })
    }
}

exports.closePortfolioPosition = async (req, res, next) => {
    try {
        const user = req.user
        let portfolio = await Portfolio.findOne({ ownerId: user._id })
        const { positionId } = req.body
        const position = await Position.findOne({ _id: positionId })

        if (!position) {
            return res.status(404).json({
                status: "fail",
                message: "No position was found corresponding to the provided id"
            });
        }

        if (position.status === "closed") {
            return res.status(404).json({
                status: "fail",
                message: "Position is already closed"
            });
        }

        const symbol = position.symbol
        const shares = position.shares
        const openingPrice = parseInt(position.opening.price)
        let symbolPrice
        let profit

        // Getting the price of the symbol
        const quoteRes = await axios
            .get(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`)

        // Price Calculation Logic
        symbolPrice = parseInt(quoteRes.data.c)

        if (symbolPrice > openingPrice) {
            const fundsToAdd = 
                (symbolPrice * parseInt(shares)) - 
                (parseInt(position.price) * parseInt(position.shares))

            portfolio.addFunds(fundsToAdd)
            profit = "profit"
        }

        if (symbolPrice < openingPrice) {
            const fundsToRemove = 
                (parseInt(position.price) * parseInt(position.shares)) -
                (symbolPrice * parseInt(shares))

            if (fundsToRemove > portfolio.balance) {
                return res.status(402).json({
                    status: "fail",
                    message: "Not enough funds"
                });
            }

            portfolio.removeFunds(fundsToRemove)
            profit = "loss"
        }

        if (symbolPrice === openingPrice) {
            profit = "same"
        }

        position.closing = {
            date: Date.now(),
            price : symbolPrice
        }
        position.status = "closed"
        portfolio.positions.pull(position._id);
        portfolio.closedPositions.push(position._id);

        await position.save()
        await portfolio.save()

        res.status(201).json({
            status: "success",
            portfolio,
            position,
            profit
        })

    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err
        })
    }
}