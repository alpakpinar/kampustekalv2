require('dotenv').config({path: __dirname+'/../.env'});

const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

const initializePassport = require('../config/passport-config');
initializePassport(passport);

const users = require('../db/users');

// Establish a database connection
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.DATABASE_URL;
let client;
MongoClient.connect(uri, (err, res) => {
    client = res;
});

router = express.Router();

router.use(flash());
router.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

router.use(passport.initialize())
router.use(passport.session())

/* 
POST to /login route
*/

router.post('/', passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
}));

module.exports = router;