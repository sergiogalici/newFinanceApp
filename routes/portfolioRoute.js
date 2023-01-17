const express = require("express")
const userController = require("./../controllers/userController")
const portfolioController = require("./../controllers/portfolioController")

const router = express.Router()

router.post("/signup", userController.signup)

router
    .route("/")
    .get(portfolioController.getUserPortfolio)

router
    .route("/positions/open")
    .post(portfolioController.openPortfolioPosition)

router.
    route("/positions/close")
    .post(portfolioController.closePortfolioPosition)

module.exports = router