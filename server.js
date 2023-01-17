const mongoose = require("mongoose")
const dotenv = require("dotenv")

dotenv.config({path: "./config.env" })

const app = require("./app")

const db = process.env.DATABASE_URI.replace("<PASSWORD>", process.env.DATABASE_PASSWORD)

mongoose.connect(db)
    .then(() => {
        console.log("WE ARE CONNECTED TO THE DB")
    })


const port = process.env.PORT
app.listen(port, () => {
    console.log("app running on port ", port)
})

