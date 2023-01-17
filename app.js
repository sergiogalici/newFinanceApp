const express = require("express")
const logicMiddlewares = require("./middlewares/logicMiddlewares")
const userRoute = require("./routes/userRoute")
const watchlistRoute = require("./routes/watchlistRoute")
const watchlistById = require("./routes/watchlistById")
const portfolioRoute = require("./routes/portfolioRoute")

const app = express()

// MIDDLEWARES

app.use(express.json());

// ROUTES

app.use("/api/v1/users", userRoute)
app.use("/api/v1/watchlist", logicMiddlewares.validateToken, watchlistRoute)
app.use(
    "/api/v1/watchlist/:id", 
    logicMiddlewares.validateToken, 
    logicMiddlewares.validateWatchlist, 
    watchlistById
    )
app.use("/api/v1/portfolio", logicMiddlewares.validateToken, portfolioRoute)

module.exports = app