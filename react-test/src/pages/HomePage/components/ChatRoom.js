import React from 'react';
import './ChatRoom.css';
import './RightSidebar.css';
import { io } from 'socket.io-client';
// import { MessageBox } from 'react-chat-elements';
import RightSidebar from './RightSidebar'

import { db } from '../../../services/firebase'
import firebase from 'firebase'

const NEW_CHAT_MESSAGE_EVENT = 'new_chat_message';
const USER_LEFT_EVENT = 'user_left';
const USER_TYPING_EVENT = 'user_typing';
const USER_STOPPED_TYPING_EVENT = 'user_stopped_typing';
// const SOCKET_SERVER_URL = 'http://localhost:8080';

class ChatRoom extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            roomId: this.props.roomId,
            messagelist: [],
            current_message: '',
            userTypingMsg: '',
            userJoinedOrLeftMsg: '',
            // socket: io(SOCKET_SERVER_URL),
        }

        // Send username, user ID (socket ID) and room ID
        // this.state.socket.emit('new_connection', this.props.username, this.state.socket.id, this.props.roomId)

        this.handleNewMessageChange = this.handleNewMessageChange.bind(this);
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.handleExit = this.handleExit.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
    }

    scrollToBottom() {
        // Automatically scroll to the bottom of the message list
        this.messagesEnd.scrollIntoView()
    }

    componentDidUpdate(prevProps) {
        this.scrollToBottom()
        const newRoomId = this.props.roomId;
        if (prevProps.roomId !== newRoomId)  {
            // Load the messages from the database
            db.ref(`messages/${this.props.roomId}`).orderByChild('timestamp').on('value', (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val()
                const messagelist = Object.values(data)
                this.setState({messagelist: messagelist})
            }
            else {
                this.setState({messagelist: []})
            }
        })
        }
    }

    async componentDidMount() {
        this.scrollToBottom()

        // Load the messages from the database
        db.ref(`messages/${this.props.roomId}`).orderByChild('timestamp').on('value', (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val()
                const messagelist = Object.values(data)
                this.setState({messagelist: messagelist})
            }
        })

        // Listen for "user typing" events
        db.ref(`rooms/${this.props.roomId}`).on('child_changed', (snapshot) => {
            const data = snapshot.val()
            // Get the typing users
            const users = Object.keys(data)
            const typingUsers = users.filter(user => data[user]).filter(user => user !== this.props.username)
            let userTypingMsg
            if (typingUsers.length === 1) {
                userTypingMsg = `${typingUsers[0]} yazıyor...`
            }
            else if (typingUsers.length > 1) {
                userTypingMsg = `${typingUsers.join(', ')} yazıyor...`
            }
            this.setState({
                userTypingMsg: userTypingMsg
            })
        })
    }

    handleNewMessageChange(e) {
        e.preventDefault();
        this.setState({current_message: e.target.value});

        const dbpath = `rooms/${this.props.roomId}/typingIndicator/${this.props.username}`

        let userTyping = true
        if (e.target.value === '') {
            userTyping = false
        }
        
        const updates = {
            [dbpath] : userTyping
        }
        
        db.ref().update(updates)
    }

    handleSendMessage(e) {
        e.preventDefault();
        // Emit chat message to server (only non-empty messages)
        if (this.state.current_message === '') {
            return
        }

        const messageData = {
            text: this.state.current_message,
            sender: this.props.username,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }

        db.ref(`messages/${this.props.roomId}`).push().set(messageData)

        // "User stopped typing" event
        const dbpath = `rooms/${this.props.roomId}/typingIndicator/${this.props.username}`

        const updates = {
            [dbpath] : false
        }
        
        db.ref().update(updates)

        // Clear the text field
        this.setState({current_message: ""})
    }

    handleExit(e) {
        this.state.socket.emit(USER_LEFT_EVENT, {
            userId: this.state.socket.id,
            username: this.props.username
        });
    }

    onKeyDown(e) {
        // If user hits enter, submit message
        // Otherwise do nothing
        if (e.keyCode === 13) {
            e.preventDefault();
            this.handleSendMessage(e);
        }
        else {
            return
        }
    }

    renderMessages() {
        /* Helper function to render the message list from the state of the component. */
        return this.state.messagelist.map((message, i) => {
            // This one is only for "user joined" or "user left" messages
            if (message?.type === 'user-notification') {
                return (
                    <div className="user-joined-left-msg">
                        <p><i>{message.body}</i></p>
                    </div>
                )
            }
            // This one is for all other normal messages
            else {
                return (
                    <div className={`single-message-container ${
                        message.sender === this.props.username ? "my-message" : "received-message" 
                    }`}>
                        <li
                            key={i}
                            className={`message-item ${
                                message.sender === this.props.username ? "my-message" : "received-message" 
                            }`}
                        >
                            {message.text}
                        </li>
                        <span className="username-stamp">{message.sender}, {new Date(message.timestamp).toString().split(' ').slice(4,5).join(' ')}</span>
                    </div>
                    )}
                }
            )
    }

    render() {
        return (
            <div className="chat-room-container">
                {/* Chat section in the middle */}
                <div className="chat-section-container" style={this.state.roomId.startsWith("c-room") ? {flex: "0 0 75%"} : {flex: "0 0 100%"}}>
                    <div className="messages-container">
                        <ol className="messages-list">
                            {this.renderMessages()}
                        </ol>
                        <div ref={el => this.messagesEnd = el}>
                        </div>
                        <div className="user-typing-msg">
                            <p><i>{this.state.userTypingMsg}</i></p>
                        </div>
                        <div className="user-joined-left-msg">
                            <p><i>{this.state.userJoinedOrLeftMsg}</i></p>
                        </div>
                    </div>
                    <textarea
                        value={this.state.current_message}
                        onChange={this.handleNewMessageChange}
                        placeholder="Write message..."
                        className="new-message-input-field"
                        onKeyDown={this.onKeyDown}
                        />
                </div>
                {/* Sidebar on the right hand side of the page */}
                <div className="sidebar-right-container">
                    {(this.state.contacts && this.state.roomId.startsWith("c-room")) ? 
                                <RightSidebar contacts={this.state.contacts} username={this.props.username} /> 
                                : <div></div>}
                </div>
            </div>
        )
    }
}
    
export default ChatRoom;