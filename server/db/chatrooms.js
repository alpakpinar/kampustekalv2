/*
Database functionality regarding chat rooms
*/
const mongodb = require('mongodb');
const crypto = require('crypto');
const { getUserByName } = require('./users');

async function getMessages(chatRoomName, client) {
    /*
    Return the message list for the given chat room name. 
    */
    const chatRoom = await client.db('newdb').collection('chatrooms').findOne({chatRoomName: chatRoomName});
    if (!chatRoom) {
        return 'Not Found';
    }
    return chatRoom.messagelist;
}

async function saveMessage(chatRoomId, messageToSave, client) {
    /*
    Save the message to the message list of the relevant chat group.
    */
    const chatRoom = await client.db('newdb').collection('chatrooms').findOne({roomId: chatRoomId});
    if (!chatRoom) {
       return 'Not Found';
    }
    // Add the new message to the list
    chatRoom.messagelist.push(messageToSave);
   
    const chatRoomFilter = {
        roomId: chatRoomId
    };

    const updateChatRoom = {
        $set: {
            messagelist: chatRoom.messagelist
        }
    };
    const result = await client.db('newdb').collection('chatrooms').updateOne(chatRoomFilter, updateChatRoom);
    // console.log(`${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`);

    return result;
}

async function getAllChatRooms(client) {
    /*
    Returns a list of chatrooms saved into the database.
    */
   const result = await client.db('newdb').collection('chatrooms').find().toArray();
   return result;
}

async function getChatRoom(chatRoomName, client) {
    /*
    Retrieve the chatroom with the given name.
    */
   const result = await client.db('newdb').collection('chatrooms').findOne({name: chatRoomName});
   return result;
}

async function getChatRoomByID(chatRoomId, client) {
    /*
    Retrieve the chatroom with the given room ID.
    */
   const result = await client.db('newdb').collection('chatrooms').findOne({roomId: chatRoomId});
   return result;
}

async function saveChatRoom(chatRoomName, chatRoomId, chatRoomType, contacts, client, roomId=null) {
    /*
    Save the chat room into the database with the name and contacts properties.
    */
    let contactlist = []
    for (let idx=0; idx < contacts.length; idx++) {
        // Get the full contact information
        let thisContact = await client.db('newdb').collection('users').findOne({username: contacts[idx]});
        contactlist.push({
            username: contacts[idx],
            _id: thisContact._id
        })
    }

    // Generate a random string for the room ID (if one is not already provided)
    let roomIdToUse
    if (roomId === null) {
        const token_for_id = crypto.randomBytes(5).toString('hex')
        roomIdToUse = `${chatRoomId}-${token_for_id}`
    }
    else {
        roomIdToUse = roomId
    }

    const newChatRoom = {
        name: chatRoomName,
        type: chatRoomType,
        roomId: roomIdToUse,
        contacts: contactlist,
        messagelist: [],
        creationDate: new Date()
    };

    const result = await client.db('newdb').collection('chatrooms').insertOne(newChatRoom);
    // console.log(`${result.insertedCount} document(s) are inserted.`);

    return result, newChatRoom;
}

async function deleteChatRoom(chatRoomName, client) {
    /*
    Delete the chat room with the given name from the database.
    */
    let result = null;

    if (chatRoomName !== 'all') {
        result = await client.db('newdb').collection('chatrooms').deleteOne({name: chatRoomName});
        // console.log(`${result.deletedCount} chatroom(s) was/were deleted.`);
        }

    else {
        result = await client.db('newdb').collection('chatrooms').deleteMany({});
        // console.log(`${result.deletedCount} chatroom(s) was/were deleted.`);
        }
    
    return result
}

async function saveChatRoomToUser(chatRoom, contacts, client) {
    /*
    Save the chat room information in the user database for each contact in the group.
    */
    let result;
    for (let idx=0; idx < contacts.length; idx++) {
        let thisContact = await client.db('newdb').collection('users').findOne({username: contacts[idx]});
        // Only save chat room name, type and ID to user's info
        const newChatRoomList = [...thisContact.chatgroups, {
            name: chatRoom.name,
            roomId: chatRoom.roomId,
            type: chatRoom.type,
            _id: chatRoom._id
        }]
        
        // Update database
        const updateFilter = {
            username: contacts[idx]
        };
        const updateList = {
            $set: {
                chatgroups: newChatRoomList
            }
        };
        result = await client.db('newdb').collection('users').updateOne(updateFilter, updateList);
    }
    return result;
}

async function deleteChatRoomFromASingleUser(chatRoomId, username, client) {
    /*
    Remove the chat room from the specified user's chatgroup list.
    */
    const user = await client.db('newdb').collection('users').findOne({username: username})
    const currentChatGroups = user.chatgroups
    // Find the chat room to be deleted
    const chatRoomToDelete = currentChatGroups.find(room => {
        return room.roomId === chatRoomId
    })
    const indexToRemove = currentChatGroups.indexOf(chatRoomToDelete)
    currentChatGroups.splice(indexToRemove, 1)

    // Now, update the user records in the database
    const updateFilter = {
        username: username
    }
    const updateList = {
        $set: {
            chatgroups: currentChatGroups
        }
    }
    const result = await client.db('newdb').collection('users').updateOne(updateFilter, updateList)
    return result
}

async function deleteChatRoomFromAllUsers(deletedChatRoom, client) {
    /*
    Upon deletion from the database, delete the chat room from the user records as well
    */
    const contacts = deletedChatRoom.contacts
    for (let idx=0; idx < contacts.length; idx++) {
        let thisContact = await client.db('newdb').collection('users').findOne({username: contacts[idx].username});
        let currentChatGroups = thisContact.chatgroups
        // Find the index of the chat group to be deleted
        let chatRoom = currentChatGroups.find(function(room) {
            return room.name === deletedChatRoom.name
        })
        let chatRoomIdx = currentChatGroups.indexOf(chatRoom)
        // Remove the chat room from array, update in the database
        currentChatGroups.splice(chatRoomIdx, 1)

        const updateFilter = {
            username: contacts[idx].username
        }
        const updateList = {
            $set: {
                chatgroups: currentChatGroups
            }
        }

        result = await client.db('newdb').collection('users').updateOne(updateFilter, updateList);
    }
    return result
}

async function removeContactFromChatRoom(chatRoomId, usernameToRemove, client) {
    /* 
    Removes a specific contact (specified by username) from the specified chat room.
    */
    const chatRoom = await getChatRoomByID(chatRoomId, client)
    const currentContacts = chatRoom.contacts
    // Find the user entry to be removed
    const contactToDelete = currentContacts.find(contact => {
        return contact.username === usernameToRemove
    })
    const indexToDelete = currentContacts.indexOf(contactToDelete)
    // Delete the user entry from the contact list
    currentContacts.splice(indexToDelete, 1)

    // Now, update the chat group in the database
    const filter = {
        roomId: chatRoom.roomId 
    }
    const update = {
        $set : {
            contacts: currentContacts
        }
    }

    const result = await client.db('newdb').collection('chatrooms').updateOne(filter, update)
    return result
}

module.exports = {
    getMessages,
    saveMessage,
    getAllChatRooms,
    saveChatRoom,
    getChatRoom,
    getChatRoomByID,
    deleteChatRoom,
    saveChatRoomToUser,
    deleteChatRoomFromASingleUser,
    deleteChatRoomFromAllUsers,
    removeContactFromChatRoom
};