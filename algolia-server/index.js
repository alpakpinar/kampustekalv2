const algoliasearch = require('algoliasearch');
const dotenv = require('dotenv');
const firebase = require('firebase');

dotenv.config()

firebase.initializeApp({
    databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const database = firebase.database();

// configure algolia
const algolia = algoliasearch(
    process.env.ALGOLIA_APP_ID,
    process.env.ALGOLIA_API_KEY
);

const index = algolia.initIndex(process.env.ALGOLIA_INDEX_NAME);

database.ref('rooms').once('value', chatrooms => {
    let records = []
    chatrooms.forEach(chatroom => {
        const childKey = chatroom.key
        const childData = chatroom.val()
        
        childData.objectID = childKey

        records.push(childData)
        
    })
    index
    .saveObjects(records)
    .then(() => {
      console.log('Contacts imported into Algolia');
    })
    .catch(error => {
      console.error('Error when importing contact into Algolia', error);
      process.exit(1);
    })
})