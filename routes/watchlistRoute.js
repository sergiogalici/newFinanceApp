const express = require("express")
const watchlistController = require("./../controllers/watchlistController")

const router = express.Router()

router
    .route("/")
    .get(watchlistController.getAllWatchlistsByUserId)
    .post(watchlistController.createWatchlist)

module.exports = router