/*
Database user functionality.
*/

const mongodb = require('mongodb');
const crypto = require('crypto');
const chatrooms = require('./chatrooms');

async function getAllUsers(client) {
    result = await client.db('newdb').collection('users').find().toArray();
    return result;
}

async function getUserById(userid, client) {
    result = await client.db('newdb').collection('users').findOne({_id: mongodb.ObjectID(userid)});
    return result;
}

async function getUserByName(username, client) {
    result = await client.db('newdb').collection('users').findOne({username: username});
    return result;
}

async function addUser(name, username, hashedPassword, email, university, client) {
    const newUser = {
        name: name,
        username: username,
        password: hashedPassword,
        email: email,
        university: university,
        contacts: [],
        chatgroups: []
    }

    // First, check if a user with this username already exists
    const username_check = await getUserByName(username, client);
    if (username_check) {
        result = 'Username taken';
        return result;
    }

    result = await client.db('newdb').collection('users').insertOne(newUser);
    console.log(`New user created with ID ${result.insertedId}`);
    return result;
}

async function deleteUserByName(username, client) {
    const result = await client.db('newdb').collection('users').deleteOne({username: username});
    console.log(`${result.deletedCount} user(s) was/were deleted.`);
    return result;
}

async function updateChatRoomsOfUser(username, chatrooms, client) {
    const filter = { username: username };
    const update = {
        $set: {
            chatgroups: chatrooms
        }
    };

    const result = await client.db('newdb').collection('users').updateOne(filter, update);
    return result;
}

async function updateContactsOfUser(username, contacts, client) {
    const filter = { username: username }
    const update = {
        $set: {
            contacts: contacts
        }
    }
    
    const result = await client.db('newdb').collection('users').updateOne(filter, update);
    return result;
}

function checkIfUserIsAlreadyAContact(userContacts, contactToAdd) {
    /* Helper function to check if a new contact is already in the user's contact list. */
    const userFound = userContacts.find(user => {
        return user.username === contactToAdd.username
    })
    if (userFound) {
        return true
    }
    return false
}

async function addNewContactToUser(user, contactToAdd, client, roomId=null) {
    /* 
    Add new contact to user and add generate a chat room ID for the two contacts to message directly. 
    If roomId=null (default), a new room ID will be created. If one already exists, it should be passed to this function.
    Function returns the room ID created for the direct messaging.
    */
    const filter = { username: user.username }
    const currentContacts = user.contacts
    // First let's check if the user is already added, if this is the case, we won't proceeed to the rest of this function
    const userAlreadyFound = checkIfUserIsAlreadyAContact(currentContacts, contactToAdd)
    if (userAlreadyFound) {
         return null
    }

    // To the current contact list, append the new contact (with reduced information)
    // Also, generate a new room ID for direct messaging between the two (if not already created)
    let roomIdForDM = roomId
    if (roomIdForDM === null) {
        const roomHashForDM = crypto.randomBytes(5).toString('hex')
        roomIdForDM = `dm-${user.username}-${contactToAdd.username}-${roomHashForDM}`
    }
    
    const newContact = {
        _id: contactToAdd._id,
        roomId: roomIdForDM,
        username: contactToAdd.username,
    }  
    currentContacts.push(newContact)
    const update = {
        $set: {
            contacts: currentContacts
        }
    }
    const result = await client.db('newdb').collection('users').updateOne(filter, update)

    // Now we also need to save the chat room for DM to the database
    const chatRoomName = `${user.username}-${contactToAdd.username}`
    // Two contacts for this DM group
    const contacts = [
        user.username,
        contactToAdd.username
    ]
    const _ = await chatrooms.saveChatRoom(chatRoomName, null, 'dm-chat-room', contacts, client, roomIdForDM)

    return roomIdForDM
}

module.exports = {
    getAllUsers,
    getUserByName,
    getUserById,
    addUser,
    deleteUserByName,
    updateChatRoomsOfUser,
    updateContactsOfUser,
    addNewContactToUser,
};