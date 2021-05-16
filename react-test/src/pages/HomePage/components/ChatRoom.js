import React from 'react'
import Moment from 'react-moment'
import 'moment/locale/tr' // TR style date formatting
import RightSidebar from './RightSidebar'

import './ChatRoom.css'
// import './RightSidebar.css'

import 'react-chat-elements/dist/main.css'
import { MessageBox } from 'react-chat-elements'
import { SystemMessage } from 'react-chat-elements'

import Avatar from '@material-ui/core/Avatar'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
import Popover from '@material-ui/core/Popover'

import Divider from '@material-ui/core/Divider'
import Link from '@material-ui/core/Link'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'

import { TextField, Typography } from '@material-ui/core'

import { db } from '../../../services/firebase'
import firebase from 'firebase'

const TITLE_COLORS = ['green', 'orange', 'blue', 'black', 'red']
const NUM_COLORS = TITLE_COLORS.length

class ChatRoomHeader extends React.Component {
    render() {
        return (
            <Box margin="auto" py={2} style={{background: "#eeeeee"}}>
                <Typography align="center" color="textPrimary" variant="h6">{this.props.roomId}</Typography>
            </Box>
        )
    }
}

class GroupChatElement extends React.Component {
    /* Chat element to be used in group chats. */
    constructor(props) {
        super(props)
        this.state = {
            anchorElForPopover: null,
            userDataForPopover: null
        }
        this.displayUserInfo = this.displayUserInfo.bind(this)
        this.handleOpenPopover = this.handleOpenPopover.bind(this)
        this.handleClosePopover = this.handleClosePopover.bind(this)
    }

    handleOpenPopover(anchorEl, userData) {
        this.setState({
            anchorElForPopover: anchorEl,
            userDataForPopover: userData
        })
    }

    handleClosePopover() {
        this.setState({
            anchorElForPopover: null,
            userDataForPopover: null
        })
    }

    async displayUserInfo(e) {
        /* Display user information upon clicking on username. */
        e.preventDefault()
        const usernameClicked = e.target.innerHTML
        await db.ref(`users/${usernameClicked}`).get().then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val()
                this.handleOpenPopover(e.target, userData)
            }
        })
    }

    render() {
        const message = this.props.message
        return (
            <ListItem button>
                <Popover
                    open={Boolean(this.state.anchorElForPopover)}
                    anchorEl={this.state.anchorElForPopover}
                    onClose={this.handleClosePopover}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center'
                    }}
                >
                    {this.state.anchorElForPopover ? (
                        <Box>
                            <ListItem>
                                <ListItemIcon>
                                    <Avatar>{this.state.userDataForPopover.username[0].toUpperCase()}</Avatar>
                                </ListItemIcon>
                                <ListItemText>
                                    <Typography variant='h6'>{this.state.userDataForPopover.username}</Typography>
                                    <Typography>{this.state.userDataForPopover.name}</Typography>
                                    <Typography color='textSecondary'>{this.state.userDataForPopover.university}</Typography>
                                </ListItemText>
                            </ListItem>
                            <Divider />
                            <Box m={2}>
                                <Typography>Kullanıcıya mesaj at!</Typography>
                            </Box>
                        </Box>
                    ) : (<div></div>)}
                </Popover>
                <ListItemAvatar>
                    <Avatar>{message.sender[0].toUpperCase()}</Avatar>
                </ListItemAvatar>
                <ListItemText>
                    <Box width={0.1}>
                        <Link color="inherit" component="button" onClick={this.displayUserInfo}>
                            <Typography>{message.sender}</Typography>
                        </Link>
                    </Box>
                    <Typography color="textSecondary">{message.text}</Typography>
                </ListItemText>
                <ListItemSecondaryAction>
                    <ListItemText secondary={this.props.time} />
                </ListItemSecondaryAction>
            </ListItem>
        )
    }
}

class ChatRoom extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            roomId: this.props.roomId,
            members: [],
            messagelist: [],
            fetching: true,
            userTypingMsg: '',
            userJoinedOrLeftMsg: '',
            userColors: {} // Colors for chat titles: Different for different users
        }

        this.typingMsgStyle = {
            position: "absolute",
            bottom: "8%",
            left: "40%",
            width: "20%",
        }
        
        this.getTime = this.getTime.bind(this)
        this.fetchMessagesAndMembers = this.fetchMessagesAndMembers.bind(this)
        this.handleNewMessageChange = this.handleNewMessageChange.bind(this);
        this.handleSendMessage = this.handleSendMessage.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.scrollToBottom = this.scrollToBottom.bind(this);
        this.saveToLocalStorage = this.saveToLocalStorage.bind(this)
        this.loadFromLocalStorage = this.loadFromLocalStorage.bind(this)
        this.renderHeader = this.renderHeader.bind(this)
        this.displayUserInfo = this.displayUserInfo.bind(this)
    }

    scrollToBottom() {
        // Automatically scroll to the bottom of the message list
        this.messagesEnd.scrollIntoView()
    }

    saveToLocalStorage(state) {
        /* Save the state of the chat room component to local storage. */
        localStorage.setItem(`chatroom-${this.state.roomId}-state`, JSON.stringify(state))
    }

    loadFromLocalStorage() {
        /* Load data from the local storage. */
    }

    getTime(timestamp) {
        /* Compute and print the time in HH:MM format. */
        let temp = timestamp.toLocaleTimeString().split(':')
        const isPMtime = temp[2].includes('PM')
        if (isPMtime) {
            const hour = Number(temp[0])
            if (hour < 12) {
                temp[0] = String(hour + 12)
            }
        } 
        const time = temp.slice(0,2).join(':')
        return time
    }

    async componentDidUpdate(prevProps, prevState) {
        this.scrollToBottom()
        // Let's update all the relevant data once we change the chat rooms
        if (prevProps.roomId !== this.props.roomId)  {
            this.setState({fetching: true})
            let messagelist = await this.fetchMessagesAndMembers(true)

            // Book keeping: Save the state of the previous chat room component to local storage
            this.saveToLocalStorage(prevState)

            // Listener for new messages
            db.ref(`messages/${this.props.roomId}`).orderByChild('timestamp').on('child_added', snapshot => {
                const msgItem = snapshot.val()
                // If this is an existing message, do nothing
                const isNewMessage = !messagelist.some(msg => {
                    return JSON.stringify(msg) === JSON.stringify(msgItem)
                })
                // If this is an existing message, do nothing
                if (isNewMessage) {
                    let newMsgList = this.state.messagelist
                    newMsgList.push(msgItem)
                    this.setState({messagelist: newMsgList})
                }
            })
            
            // Listen for "user typing" events
            db.ref(`rooms/${this.props.roomId}/typingIndicator`).on('value', (snapshot) => {
                if (snapshot.exists()) {
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
                }
            })

            // Detach the old listeners
            db.ref(`messages/${prevProps.roomId}`).off()
            db.ref(`rooms/${prevProps.roomId}`).off()
        }
    }

    async componentDidMount() {
        this.scrollToBottom()

        let messagelist = await this.fetchMessagesAndMembers()
        // When new messages come in, we'll push them to the existing list by the event listener defined below
        
        // Listener for new messages
        db.ref(`messages/${this.props.roomId}`).orderByChild('timestamp').on('child_added', snapshot => {
            const msgItem = snapshot.val()
            // If this is an existing message, do nothing
            const isNewMessage = !messagelist.some(msg => {
                return JSON.stringify(msg) === JSON.stringify(msgItem)
            })
            if (isNewMessage) {
                let newMsgList = this.state.messagelist
                newMsgList.push(msgItem)
                this.setState({messagelist: newMsgList})
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

    async fetchMessagesAndMembers(propsUpdated=false, maxMsgCount=50) {
        let messagelist = []

        // await db.ref(`messages/${this.props.roomId}`).orderByChild('timestamp').limitToLast(maxMsgCount).once('value', (snapshot) => {
        await db.ref(`messages/${this.props.roomId}`).orderByChild('timestamp').once('value', (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val()
                messagelist = Object.values(data)
            }
        })

        // Load the members
        let members = []
        let userColors = {}
        await db.ref(`members/${this.props.roomId}`).once('value', snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val()
                members = Object.keys(data)
                for (let idx=0; idx < members.length; idx++) {
                    userColors[members[idx]] = TITLE_COLORS[ idx % NUM_COLORS ]
                }
            }
        })

        let stateUpdate = {
            messagelist: messagelist, 
            members: members, 
            userColors: userColors,
            fetching: false,
        }
        if (propsUpdated) {
            stateUpdate = {...stateUpdate, roomId: this.props.roomId}
        }
        this.setState(stateUpdate)
 
        return messagelist
    }

    handleNewMessageChange(e) {
        e.preventDefault();

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
        const currentMessage = e.target.value
        if (currentMessage === '') {
            return
        }

        const messageData = {
            text: currentMessage,
            sender: this.props.username,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        }

        db.ref(`messages/${this.props.roomId}`).push().set(messageData)

        // "User stopped typing" event
        const dbpathTypingIndicator = `rooms/${this.props.roomId}/typingIndicator/${this.props.username}`
        const dbpathLatestMsgTime = `rooms/${this.props.roomId}/latestMsgTime`

        const updates = {
            [dbpathTypingIndicator] : false,
            [dbpathLatestMsgTime] : firebase.database.ServerValue.TIMESTAMP
        }
        
        db.ref().update(updates)

        // Clear the text field
        e.target.value = ''

    }

    async displayUserInfo(e) {
        /* Display user information upon clicking on username. */
        e.preventDefault()
        const usernameClicked = e.target.innerHTML
        await db.ref(`users/${usernameClicked}`).get().then(snapshot => {
            if (snapshot.exists()) {
                const userData = snapshot.val()
            }
        })
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

    renderHeader() {
        if (this.state.fetching) {
            return <Box></Box>
        }
        return (
            <Grid>
                {this.props.channelType !== 'dm-channel' ? (
                    <Box item mt={2}>
                        <Typography variant="subtitle1">{this.props.roomId} grubuna hoşgeldin!</Typography>
                    </Box>
                ) : (
                    <Box></Box>
                )}
                <Box item mt={1}>
                    <SystemMessage text="Konuşmanın başlangıcı"/>
                </Box>
            </Grid>
        )
    }

    renderMessages() {
        /* Helper function to render the message list from the state of the component. */
        if (this.state.fetching) {
            return (
                <Box mt={10}>
                    <CircularProgress size={60} />
                </Box>
            )
        }
        return this.state.messagelist.map((message, i) => {
            // Compare the date of the current message with the previous one.
            // If it's not the same, let's print the date here
            let newDateEl = null
            // Notch for the message box
            let useNotch = true
            if (i !== 0) {
                const dateLastMsg = new Date(this.state.messagelist[i-1].timestamp)
                const dateThisMsg = new Date(message.timestamp)
                if (dateLastMsg.toDateString() !== dateThisMsg.toDateString()) {
                    const calendarSettings = {
                        sameDay: '[Bugün]',
                        lastDay: '[Dün]',
                        lastWeek: 'dddd',
                        sameElse: 'DD.MM.YYYY',
                    }
                    newDateEl = <Moment calendar={calendarSettings}>{dateThisMsg}</Moment>
                }
                const senderLastMsg = this.state.messagelist[i-1].sender
                const senderThisMsg = message.sender
                // If the sender is the same as the previous one, no notch needed (unless the message is sent on a different date)
                if (senderLastMsg === senderThisMsg && !newDateEl) {
                    useNotch = false
                }
            }
            const msgTime = new Date(message.timestamp)
            const hh = msgTime.getHours()
            const mm = msgTime.getMinutes() < 10 ? `0${msgTime.getMinutes()}` : msgTime.getMinutes()

            return (
                <div>
                    {newDateEl ? <SystemMessage text={newDateEl} /> : <div></div>}
                    {this.props.channelType === 'dm-channel' ? (
                        <MessageBox
                            // id={i} 
                            position={message.sender === this.props.username ? "right" : "left"}
                            type="text"
                            text={message.text}
                            // title={message.sender}
                            dateString={this.getTime(new Date(message.timestamp))}
                            titleColor={message.sender === this.props.username ? "green" : "black"}
                            notch={useNotch}
                            // status='sent'
                            // replyButton={true}
                        />
                    ) : (
                        <GroupChatElement 
                            message={message}
                            time={`${hh}:${mm}`}
                            displayUserInfo={this.displayUserInfo}
                        />
                    )}
                    
                </div>
                
                )
            }
        )
    }

    render() {
        return (
            <div className="chat-room-container">
                {/* Chat section in the middle */}
                <Box flex={1}>
                    <Box position="relative" overflow="auto" height={0.9}>
                        {this.renderHeader()}
                        <List>
                            {this.renderMessages()}
                        </List>
                        <div className="user-joined-left-msg">
                            <p><i>{this.state.userJoinedOrLeftMsg}</i></p>
                        </div>
                        {/* "User typing" message slot */}
                        <Box position="absolute" bottom={5} width={1} mx="auto">
                            <Typography>{this.state.userTypingMsg}</Typography>
                        </Box>
                        <Box ref={el => this.messagesEnd = el}></Box>
                    </Box>
                    <Box mx="auto" width={0.96}>
                        <TextField 
                            variant="outlined"
                            margin="dense"
                            fullWidth={true}
                            placeholder="Mesaj yaz..."
                            onKeyDown={this.onKeyDown}
                            onChange={this.handleNewMessageChange}
                        />
                    </Box>
                </Box>
                    {/* {this.props.channelType === 'group-channel' ? <ChatRoomHeader roomId={this.props.roomId} /> : <Box></Box>} */}
                    
                {/* Sidebar on the right hand side of the page */}
                    {this.props.channelType !== 'dm-channel' ? (
                        <Box flex={0.3} style={{background: "#f1f1f1"}}>
                            <RightSidebar 
                                contacts={this.state.members} 
                                username={this.props.username} 
                                chatRoomName={this.props.roomId}
                            /> 
                        </Box>
                    )
                    : <Box></Box>}
            </div>
        )
    }
}
    
export default ChatRoom;