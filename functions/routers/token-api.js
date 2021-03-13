require('dotenv').config({path: __dirname+'/../.env'});

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const users = require('../db/users');

const tokenApi = express.Router();
tokenApi.use(cors());

const MongoClient = require('mongodb').MongoClient;
const uri = process.env.DATABASE_URL;

// Establish a database connection
let client = null;
MongoClient.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
}, (err, res) => {
    if (err) {
        throw(err);
    }
    else {
        client = res;
    }
});

tokenApi.use('/', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        // Find the user in our database by username
        const user = await users.getUserByName(username, client);
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }
    
        // Validate user password
        if (await bcrypt.compare(password, user.password)) {
            const tokenstr = crypto.randomBytes(10).toString('base64');
            const response = {
                username: username,
                token: tokenstr,
                message: 'logged-in'
            };
            res.json(response);
        }
        else {
            res.status(400).json({ message: 'Wrong password' })
        }
    
    } catch (error) {
        res.status(500).json({ message: error.message })
        
    }
})

module.exports = tokenApi;