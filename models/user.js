const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        required: true,
        type: String,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    contact: {
        type: Number,
        required: true,
    },
    username: {
        type: String,
    },
    city: {
        type: String,
    },
    member: {
        type: Boolean
    },
    token: {
        type: String
    },
    tokenexpiration: {
        type: Date
    },
    paymentmode: {
        type: String
    },
    transdate: {
        type: String
    },
    committee1: {
        type: String
    },
    prefrence11: {
        type: String
    },
    prefrence12: {
        type: String
    },
    prefrence13: {
        type: String
    },
    committee2: {
        type: String
    },
    prefrence21: {
        type: String
    },
    prefrence22: {
        type: String
    },
    prefrence23: {
        type: String
    },
    committee3: {
        type: String
    },
    prefrence31: {
        type: String
    },
    prefrence32: {
        type: String
    },
    prefrence33: {
        type: String
    },
    pastexp: {
        type: String
    }
});

module.exports = mongoose.model("User", userSchema);