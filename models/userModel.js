const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A user must have a name"]
    },
    email: {
        type: String,
        required: [true, "A user must have an email"],
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "A user must have a password"],
        minlength: 4
    },
    passwordConfirm: {
        type: String,
        required: [true, "A user must confirm the password"],
        minlength: 4,
        validate: {
            validator: function(el) {
                return el === this.password
            },
            message: "Passwords are not the same!"
        }
    }
})

userSchema.pre("save", async function(next) {
    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
})

userSchema.methods.correctPassowrd = async function (inputPass, userPass) {
    return await bcrypt.compare(inputPass, userPass)
}

const User = mongoose.model("User", userSchema)

module.exports = User