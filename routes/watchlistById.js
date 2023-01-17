const express = require("express")
const watchlistController = require("./../controllers/watchlistController")
const router = express.Router()

router
    .route("/")
    .get(watchlistController.getWatchlistById)
    .put(watchlistController.updateWatchlistById)
    .delete(watchlistController.deleteWatchlistById)

router
    .route("/symbols")
    .post(watchlistController.updateWatchlistSymbolsById)

module.exports = router