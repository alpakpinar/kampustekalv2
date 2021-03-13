require('dotenv').config({path: __dirname+'/../.env'});

const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const users = require('../db/users');
const chatrooms = require('../db/chatrooms');

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

const apiRouter = express.Router();

apiRouter.get('/users', async (req, res) => {
    try {
        const userlist = await users.getAllUsers(client);
        res.json(userlist);
    } catch (error) {
        res.status(500).json({ message: error.message })        
    }
});

apiRouter.post('/users', async (req, res) => {
    const name = req.body.name
    const username = req.body.username
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const email = req.body.email
    const university = req.body.university

    if (!username) {
        return res.status(400).send('Username not specified.')
    }

    try {
        const result = await users.addUser(name, username, hashedPassword, email, university, client);
        if (result) {
            if (result === 'Username taken') {
                res.status(400).json({ message: "Username taken" });
            }
            else {
                res.status(201).json(req.body);
            }
        }
    } catch (error) {
            res.status(500).json({ message: error.message });
        }

});

apiRouter.get('/users/:username', async (req, res) => {
    try {
        const user = await users.getUserByName(req.params.username, client);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.send({user: user})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

apiRouter.patch('/users/:username', async (req, res) => {
    /* 
    Update information regarding the specified user (by username):
    1. Chat room list that the user is registered to
    2. Contact list of the user
    How it works --> Just specify the new chat group OR contact list in the HTTP request body and
    the user information will simply be reset. 
    */
    const validReq = (req.body.chatgroups) || (req.body.contacts)
    if (!validReq) {
        return res.status(400).json({ message: 'Neither the new chat room list or contact list is provided' })
    }
    const newChatRoomList = req.body.chatgroups;
    const newContactList = req.body.contacts;
    try {
        const user = await users.getUserByName(req.params.username, client);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // If user exists, update either the chat room list or the contact list of the user
        if (newChatRoomList) {
            const result = await users.updateChatRoomsOfUser(req.params.username, newChatRoomList, client);
        }
        if (newContactList) {
            const result = await users.updateContactsOfUser(req.params.username, newContactList, client);
        }
        res.status(204).json();

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

apiRouter.post('/users/:username', async (req, res) => {
    /* POST request for the specified user. 
    Used to add a new contact for the relevant users upon POST request.
    How it works --> Specify the new contact information (just the username) in the HTTP request body and the contact info
    will be appended to the contact list in the database.   
    */
   const usernameToAdd = req.body.usernameToAdd
   if (!usernameToAdd) {
       return res.status(400).json({ message: 'Username information is not provided' })
   }
   try {
       // Retrieve the users in question
       const userAdding = await users.getUserByName(req.params.username, client)
       const userBeingAdded = await users.getUserByName(usernameToAdd, client)
       if (!(userAdding && userBeingAdded)) {
           return res.status(404).json({ message: 'User not found' });
       }
       // If user exists, update the contact list of the user (do it for both users)
       // At the same time, we generate a chat room ID for the two users to enable direct messaging
       let roomIdForDM = await users.addNewContactToUser(userAdding, userBeingAdded, client)
       // In the second func call, just pass in the already generated room ID for DM
       roomIdForDM = await users.addNewContactToUser(userBeingAdded, userAdding, client, roomIdForDM)
       res.status(204).json()
   } catch (error) {
       res.status(500).json({ message: error.message });   
   }
});

apiRouter.delete('/users/:username', async (req, res) => {
    const username = req.params.username;
    try {
        const result = await users.deleteUserByName(username, client);
        res.status(204).json({ message: 'User deleted' });        
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

apiRouter.get('/chatrooms', async (req, res) => {
    try {
        const chatroomlist = await chatrooms.getAllChatRooms(client);
        res.json(chatroomlist);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

apiRouter.delete('/chatrooms', async (req, res) => {
    /* Use this path to directly delete a chatroom from all users */
    const validRequest = req.body.chatRoomName !== undefined;
    if (!validRequest) {
        return res.status(400).json({ message: 'Chat room name not provided' });
    }
    try {
        // First, retrieve the chatroom
        const chatRoomBeingDeleted = await chatrooms.getChatRoom(req.body.chatRoomName, client);
        const deleteResult = await chatrooms.deleteChatRoom(req.body.chatRoomName, client);

        // After sending the response, delete the chat room from the user records as well
        chatrooms.deleteChatRoomFromAllUsers(chatRoomBeingDeleted, client)
        res.json({ message: 'Chatroom deleted' });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// TODO: 
// Before posting, check if a group with the same name already exists

apiRouter.post('/chatrooms', async (req, res) => {
    const validReq = (req.body.chatRoomName) && (req.body.chatRoomId) && (req.body.chatRoomType) && (req.body.contacts);
    let result, newChatRoom;
    if (!validReq) {
        return res.status(400).json({ message: 'Information missing' });
    } 
    try {
        result, newChatRoom = await chatrooms.saveChatRoom(req.body.chatRoomName, req.body.chatRoomId, req.body.chatRoomType, req.body.contacts, client);
        res.status(201).json(newChatRoom);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

    chatrooms.saveChatRoomToUser(newChatRoom, req.body.contacts, client);
});

apiRouter.get('/chatrooms/:chatRoomId', async (req, res) => {
    const chatroom = await chatrooms.getChatRoomByID(req.params.chatRoomId, client);
    if (!chatroom) {
        return res.status(404).json({ message: "Chat room not found" });
    }
    res.json(chatroom);
});

apiRouter.patch('/chatrooms', async (req, res) => {
    /* Used to patch the message list of the given chat room (with the name). (can be expanded later) */
    const validReq = (req.body.newMessage !== undefined) && (req.body.chatRoomName !== undefined);
    if (!validReq) {
        return res.status(400).json({ message: "Information missing" });
    }
    try {
        const result = await chatrooms.saveMessage(req.body.chatRoomName, req.body.newMessage, client);
        res.status(204).json();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

apiRouter.delete('/chatrooms/:chatRoomId', async (req, res) => {
    /* 
    Delete a specified contact from the chat room with the given chat room ID.
    */
    const usernameToRemove = req.body.usernameToRemove
    if (!usernameToRemove) {
        return res.status(400).json({ message: "Username not specified" })
    }
    // Remove the user from the chatroom contacts list
    let result
    try {
        result = await chatrooms.removeContactFromChatRoom(req.params.chatRoomId, usernameToRemove, client)
        // Also remove the chat room from user records for consistency
        _ = await chatrooms.deleteChatRoomFromASingleUser(req.params.chatRoomId, usernameToRemove, client)
        res.json({ message: `User ${usernameToRemove} removed from ${req.params.chatroomId} chat group`})
    } catch (error) {
        res.status(500).json({ message: error.message })
    }

});

// Handle login
apiRouter.use('/login', async (req, res) => {
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

module.exports = apiRouter;