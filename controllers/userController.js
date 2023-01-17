const { promisify } = require("util")
const jwt = require("jsonwebtoken")
const User = require("./../models/userModel")
const Portfolio = require("./../models/portfolioModel")
const bcrypt = require("bcryptjs")

// INTERNAL FUNCTION

const signToken = id => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET)
}

// ENDPOINTS BUSINESS LOGIC

exports.signup = async (req, res, next) => {

    // handling all the cases of incorrect or missing inputs

    if (!req.body.name) {
        return res.status(400).json({
            status: "fail",
            message: "A User must have a name"
        })
    }

    if (!req.body.email) {
        return res.status(400).json({
            status: "fail",
            message: "A User must have an email"
        })
    }

    if (!req.body.password) {
        return res.status(400).json({
            status: "fail",
            message: "A User must have a password"
        })
    }

    if (!req.body.passwordConfirm) {
        return res.status(400).json({
            status: "fail",
            message: "A User must confirm his/her password"
        })
    }

    if (req.body.password !== req.body.passwordConfirm) {
        return res.status(400).json({
            status: "fail",
            message: "User's passwords must match"
        })
    }

    try {
        const newUser = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
            passwordConfirm: req.body.passwordConfirm
        })
        
        const userPortfolio = await Portfolio.create({
            ownerId: newUser
        })

        res.status(201).json({
            status: "success",
            user: { ...newUser },
            portfolio: { ...userPortfolio }
        })
    } catch (err) {
        return res.status(400).json({
            status: "fail",
            message: "Something went wrong"
        })
    }  
}

exports.signin = async (req, res, next) => {

    try {
        const { email, password } = req.body

        // handling the case where password and/or email are not provided

        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "Please insert email and password"
            })
        }
    
        const user = await User.findOne({ email })

        // checking if the user exists and if the password is correct
        //both are in the same condition to increase the security
        
        if (!user || !(await user.correctPassowrd(password, user.password))) {
            return res.status(400).json({
                status: "fail",
                message: "User does not exist or password is incorrect"
            })
        }
    
        const token = signToken(user._id)
    
        res.status(200).json({
            status: "success",
            token
        })
    } catch (err) {
        return res.status(400).json({
            status: "fail",
            message: "bad request"
        })
    }
}