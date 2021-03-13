const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');

const apiRouter = require('./routers/api');
const tokenApi = require('./routers/token-api');

const chatrooms = require('./db/chatrooms');

const PORT = process.env.PORT || 8080;

// Socket
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        credentials: true
    }
});
const NEW_CHAT_MESSAGE_EVENT = 'new_chat_message';
const USER_LEFT_EVENT = 'user_left';
const USER_TYPING_EVENT = 'user_typing';
const USER_STOPPED_TYPING_EVENT = 'user_stopped_typing';

app.use(bodyParser.json())
app.use('/api', apiRouter);
// app.use('/login', tokenApi);
app.use(cors());

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


io.on('connection', (socket) => {
    let room_id_hist = [];
    socket.on('new_connection', (username, userId, roomId) => {
        socket.username = username;
        socket.userId = userId;
        socket.roomId = roomId;

        // Join the room, add the room ID to the tracking history
        socket.join(roomId);
        room_id_hist.push(roomId);
        
        // Leave the previous room
        if (room_id_hist.length > 1) {
            socket.leave(room_id_hist[room_id_hist.length-2]);
            room_id_hist.splice(0,1);
        }
    });

    socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
        io.in(socket.roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
        // Save message to database
        chatrooms.saveMessage(socket.roomId, data, client);
    });

    socket.on(USER_TYPING_EVENT, (data) => {
        socket.to(socket.roomId).emit(USER_TYPING_EVENT, data);
    })

    socket.on(USER_STOPPED_TYPING_EVENT, (data) => {
        socket.to(socket.roomId).emit(USER_STOPPED_TYPING_EVENT, data);
    })

    socket.on(USER_LEFT_EVENT, (data) => {
        socket.to(socket.roomId).emit(USER_LEFT_EVENT, data);
    })
})

const server = http.listen(PORT, () => {
    console.log(`Listening on ${PORT}`)
})
