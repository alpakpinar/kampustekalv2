import React from 'react'
import {Redirect} from 'react-router-dom';
import './HomePage.css'

import ChatRoom from './components/ChatRoom'
import NewChatGroupDialog from './components/NewChatGroupDialog'
import FriendSearchDialog from './components/FriendSearchDialog'
import GroupSearchPage from './components/GroupSearchPage'
import HomePageHeader from './components/HomePageHeader'
import FriendAdditionSnackbar from './components/FriendAdditionSnackbar'
import UserContextMenu from './components/UserContextMenu'
import LoadingPage from './components/LoadingPage'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import Collapse from '@material-ui/core/Collapse'

import ExpandLess from '@material-ui/icons/ExpandLess'
import ExpandMore from '@material-ui/icons/ExpandMore'
import ChatIcon from '@material-ui/icons/Chat'
import AnnouncementIcon from '@material-ui/icons/Announcement'
import ExploreIcon from '@material-ui/icons/Explore'
import ContactsIcon from '@material-ui/icons/Contacts'
import SearchIcon from '@material-ui/icons/Search'
import AddIcon from '@material-ui/icons/Add'
import CreateIcon from '@material-ui/icons/Create'
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer'
import PersonIcon from '@material-ui/icons/Person'
import AddAlertIcon from '@material-ui/icons/AddAlert'

import { ChatItem } from 'react-chat-elements'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { createNotification } from '../../helpers/createNotification'

import { db, auth } from '../../services/firebase'

class NestedList extends React.Component {
    /* Reusable nested/collapsable list for left-hand side navigation bar. */
    constructor(props) {
        super(props)
        this.state = {
            selectedUser: null,
            anchorForUserMenu: null
        }
        this.handleClick = this.handleClick.bind(this)
        this.handleContextMenu = this.handleContextMenu.bind(this)
        this.handleCloseContextMenu = this.handleCloseContextMenu.bind(this)
        this.onClickToMenuItem = this.onClickToMenuItem.bind(this)
    }

    handleClick(e) {
        // Get the parent div element, and extract the ID from it
        const parent = e.target.closest('.list-item-div')
        this.props.setActiveTab(parent.id)
    }

    handleContextMenu(e) {
        /* Right-click on the list items. */
        e.preventDefault()
        const parent = e.target.closest('.list-item-div')
        if (!parent.id.startsWith('dm')) {
            return
        }
        // Get the selected username
        let temp = parent.id.replace('dm-','').split('-')
        const selectedUser = temp.filter(username => username !== this.props.currentUser)[0]
        this.setState({
            selectedUser: selectedUser, 
            anchorForUserMenu: e.target
        })
    }
    
    onClickToMenuItem() {
        this.handleCloseContextMenu()
        this.props.handleRemoveContact(this.state.selectedUser)
    }

    handleCloseContextMenu() {
        this.setState({anchorForUserMenu: null})
    }

    render() {
        return (
            <Collapse in={this.props.show}>
                <List component="div">
                    {this.props.items.map((item, i) => {
                        const id = this.props.type === 'contact' ? this.props.dmChannels[i] : item
                        let displayMessage = this.props.latestMessagelist[id]
                        let subtitleToDisplay = ''
                        if (displayMessage) {
                            subtitleToDisplay = this.props.type === 'contact' ? displayMessage.text : `${displayMessage.sender}: ${displayMessage.text}`
                        }
                        return (
                            <div className="list-item-div" id={id}>
                                <ChatItem 
                                    avatarFlexible={true}
                                    title={item}
                                    subtitle={displayMessage ? subtitleToDisplay : "İlk mesajı sen yaz!"}
                                    date={displayMessage ? displayMessage.timestamp : null}
                                    // dateString={displayMessage ? format(Date.now() - displayMessage.timestamp, 'tr_locale') : ""}
                                    unread={0}
                                    onClick={this.handleClick}
                                    onContextMenu={this.handleContextMenu}
                                    // statusColor="red"
                                    // statusColorType="encircle"
                                    />
                                
                                {/* Menu on right click on chat item */}
                                <UserContextMenu 
                                    anchorEl={this.state.anchorForUserMenu} 
                                    handleClose={this.handleCloseContextMenu} 
                                    onClickToMenuItem={this.onClickToMenuItem} 
                                    />
                            </div>
                        )
                    })}
                </List>
            </Collapse>
        )
    }
}

class LeftNavigation extends React.Component {
    /* Navigation on the left hand side of the user page. */
    constructor(props) {
        super(props)
        this.state = {
            activeTabId: this.props.activeTabId,
            nests: {
                chatroomsOpen: true,
                announcementsOpen: true,
                contactsOpen: true,
            }
        }
    
        this.handleClickChatrooms = this.handleClickChatrooms.bind(this)
        this.handleClickAnnouncements = this.handleClickAnnouncements.bind(this)
        this.handleClickContacts = this.handleClickContacts.bind(this)
        this.handleClickNewGroup = this.handleClickNewGroup.bind(this)
        this.handleClickGroupSearch = this.handleClickGroupSearch.bind(this)
        this.handleClickFriendSearch = this.handleClickFriendSearch.bind(this)

    }

    handleClickChatrooms() {
        this.setState({
            ...this.state,
            nests: {
                chatroomsOpen: !this.state.nests.chatroomsOpen,
                announcementsOpen: this.state.nests.announcementsOpen,
                contactsOpen: this.state.nests.contactsOpen
            }
        })
    }

    handleClickAnnouncements() {
        this.setState({
            ...this.state,
            nests: {
                chatroomsOpen: this.state.nests.chatroomsOpen,
                announcementsOpen: !this.state.nests.announcementsOpen,
                contactsOpen: this.state.nests.contactsOpen
            }
        })
    }

    handleClickContacts() {
        this.setState({
            ...this.state,
            nests: {
                chatroomsOpen: this.state.nests.chatroomsOpen,
                announcementsOpen: this.state.nests.announcementsOpen,
                contactsOpen: !this.state.nests.contactsOpen
            }
        })
    }

    handleClickNewGroup() {
        this.props.handleOpenDialog('newChatGroup')
    }

    handleClickGroupSearch() {
        const id = "group-search"
        this.props.setActiveTab(id)
    }

    handleClickFriendSearch() {
        this.props.handleOpenDialog('friendSearch')
    }

    render() {
        return (
            <div>
                <List component="nav">
                    <ListItem button onClick={this.handleClickChatrooms}>
                        <ListItemIcon>
                            <ChatIcon></ChatIcon>
                        </ListItemIcon>
                        <ListItemText primary="Chat Odaları" />
                        {this.state.nests.chatroomsOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <NestedList 
                        currentUser={this.props.currentUser}
                        show={this.state.nests.chatroomsOpen} 
                        items={this.props.chatrooms} 
                        latestMessagelist={this.props.latestMessagelist}
                        type="chatroom" 
                        setActiveTab={this.props.setActiveTab} 
                        activeTabId={this.props.activeTabId} 
                        /> 
                    {/* <ListItem button onClick={this.handleClickAnnouncements}> */}
                        {/* <ListItemIcon> */}
                            {/* <AnnouncementIcon></AnnouncementIcon> */}
                        {/* </ListItemIcon> */}
                        {/* <ListItemText primary="Duyurular" /> */}
                        {/* {this.state.nests.announcementsOpen ? <ExpandLess /> : <ExpandMore />} */}
                    {/* </ListItem> */}
                    {/* <NestedList show={this.state.nests.announcementsOpen} items={this.props.announcement_rooms} type="announcement" setActiveTab={this.props.setActiveTab} activeTabId={this.props.activeTabId} />  */}
                    <ListItem button onClick={this.handleClickContacts}>
                        <ListItemIcon>
                            <ContactsIcon></ContactsIcon>
                        </ListItemIcon>
                        <ListItemText primary="Arkadaşlar" />
                        {this.state.nests.contactsOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItem>
                    <NestedList currentUser={this.props.currentUser}
                                show={this.state.nests.contactsOpen} 
                                items={this.props.contacts} 
                                dmChannels={this.props.dmChannels} 
                                latestMessagelist={this.props.latestMessagelist}
                                type="contact" 
                                setActiveTab={this.props.setActiveTab} 
                                activeTabId={this.props.activeTabId} 
                                handleRemoveContact={this.props.handleRemoveContact} /> 
                    <Divider />
                    <ListItem button onClick={this.handleClickGroupSearch} selected={this.props.activeTabId === "group-search"}>
                        <ListItemIcon>
                            <SearchIcon></SearchIcon>
                        </ListItemIcon>
                        <ListItemText primary="Keşfet" />
                    </ListItem>
                    <ListItem button onClick={this.handleClickNewGroup}>
                        <ListItemIcon>
                            <CreateIcon></CreateIcon>
                        </ListItemIcon>
                        <ListItemText primary="Yeni Grup Oluştur" />
                    </ListItem>
                    <ListItem button onClick={this.handleClickFriendSearch}>
                        <ListItemIcon>
                            <AddIcon></AddIcon>
                        </ListItemIcon>
                        <ListItemText primary="Yeni Arkadaş Ekle" />
                    </ListItem>
                    <ListItem button onClick={null} selected={this.props.activeTabId === "random-chat"}>
                        <ListItemIcon>
                            <ExploreIcon></ExploreIcon>
                        </ListItemIcon>
                        <ListItemText primary="Rastgele Gruba Gir" />
                    </ListItem>
                </List>
            </div>
        )
    }
}

class HomePage extends React.Component {
    constructor(props) {
        super(props);
        let username = null;
        if (sessionStorage.getItem('token') !== null) {
            username = JSON.parse(sessionStorage.getItem('token')).username;
        }

        else if (localStorage.getItem('token') !== null) {
            username = JSON.parse(localStorage.getItem('token')).username;    
        }
        
        this.state = {
            currentUser: auth.currentUser,
            username: username,
            name: '',
            university: '',
            chatRoomList: [], // Initially empty, to be fetched from the database and updated as page loads
            contacts: [], // Initially empty, to be fetched from the database and updated as page loads
            dmChannels: [], // Initially empty, to be fetched from the database and updated as page loads
            fetching: true,
            // announcement_rooms: [
            //     "Staj", 
            //     "Ev/Yurt",
            // ],
            activeTabId: 'group-search',
            friendAdditionSnackbar: {
                show: false,
                message: ''
            },
            dialogs: {
                friendSearch: false,
                newChatGroup: false,
            },
            latestMessagelist: {}
        };

        // Store a copy of the user data
        localStorage.setItem('kkal-user-auth', JSON.stringify(auth.currentUser))

        this.isActiveTab = this.isActiveTab.bind(this)
        this.setActiveTab = this.setActiveTab.bind(this)
        this.renderMainSide = this.renderMainSide.bind(this)
        this.userLoggedIn = this.userLoggedIn.bind(this)
        this.handleLogout = this.handleLogout.bind(this)
        this.executeOnFriendAddition = this.executeOnFriendAddition.bind(this)
        this.fetchContactsAndChats = this.fetchContactsAndChats.bind(this)
        this.fetchLatestMessages = this.fetchLatestMessages.bind(this)
        
        this.setupListenersForMessages = this.setupListenersForMessages.bind(this)
        this.sortBasedOnLatestMsgTimestamp = this.sortBasedOnLatestMsgTimestamp.bind(this)

        this.handleRemoveContact = this.handleRemoveContact.bind(this)
        this.handleOpenDialog = this.handleOpenDialog.bind(this)
        this.handleCloseDialog = this.handleCloseDialog.bind(this)
    }
    
    async handleRemoveContact(userBeingRemoved) {
        /* Remove contacts in the database and reload list of contacts. */
        await db.ref(`users/${this.state.currentUser.displayName}/contacts/${userBeingRemoved}`).set(null)
        await db.ref(`users/${userBeingRemoved}/contacts/${this.state.currentUser.displayName}`).set(null)

        this.fetchContactsAndChats()

        const notificationMsg = `${userBeingRemoved} arkadaşlık listenden çıkarıldı!`
        createNotification(notificationMsg)

        // Delete the DM messages between these two contacts
        // Continue here...
    }

    async handleLogout(e) {
        /* 
        Upon logout, remove the user tokens from the session and local storages.
        Token in local storage may or may not exist, but we still need to check there.
        */
        e.preventDefault();
        sessionStorage.removeItem('token');
        localStorage.removeItem('token');
        await db.ref(`users/${this.state.currentUser.displayName}/loggedIn`).set(false)

        auth.signOut().then(() => {
            window.location.reload()
        })
    }

    userLoggedIn() {
        // Check the session and local storages for user token
        const tokenStringFromSS = sessionStorage.getItem('token');
        const userTokenFromSS = JSON.parse(tokenStringFromSS);
        if (userTokenFromSS?.token) {
            return true
        }

        const tokenStringFromLS = localStorage.getItem('token')
        const userTokenFromLS = JSON.parse(tokenStringFromLS)
        if (userTokenFromLS?.token) {
            return true
        }
        return false
    }

    isActiveTab(tabId) {
        return this.state.activeTabId === tabId;
    }

    setActiveTab(tabid) {
        this.setState({activeTabId: tabid});
    }

    executeOnFriendAddition(usernameAdded) {
        /* Child component will exec this function once a contact has been added. */
        const message = `${usernameAdded} kullanıcısına istek yolladık!`
        createNotification(message)
        // this.setState({friendAdditionSnackbar: {
        //     show: true,
        //     message: message
        // }})    
    }

    async setupListenersForMessages(chatgroups) {
        for (let idx=0; idx < chatgroups.length; idx++) {
            await db.ref(`messages/${chatgroups[idx]}`).orderByChild('timestamp').startAt(Date.now()).on('child_added', snapshot => {
                if (snapshot.exists()) {
                    const newMsg = snapshot.val()
                    // Update the message list of the relevant chat group
                    const latestMessagelist = {
                        ...this.state.latestMessagelist,
                        [chatgroups[idx]]: newMsg
                    }

                    this.setState({latestMessagelist: latestMessagelist})

                }
            })
        }
    }

    async componentDidMount() {
        /* Collect the necessary data about the user: Full name, university, list of chat rooms etc. */
        // This doesn't work...
        auth.onAuthStateChanged((user) => {
            if (!user) {
                const userFromCache = JSON.parse(localStorage.getItem('kkal-user-auth'))
                this.setState({currentUser: userFromCache})
            }
            else {
                this.setState({currentUser: user})
            }
        })

        if (this.state.currentUser) {
            // Fetch information from database upon entry:
            // Chat groups, contacts, list of notifications
            // Let's download these once when the home page mounts and not deal with them multiple times.  
            await this.fetchContactsAndChats()

            // Update user's login status in the database 
            db.ref(`users/${this.state.currentUser.displayName}/loggedIn`).set(true)
        }
    }

    async sortBasedOnLatestMsgTimestamp(chatgroups_for_fetch) {
        /* Sorts the chat rooms (the ones we display on screen only) according to the timestamp of the latest message. */
        let chatroomsWithTimeStamps = []
        for (let idx=0; idx < chatgroups_for_fetch.length; idx++) {
            await db.ref(`rooms/${chatgroups_for_fetch[idx]}/latestMsgTime`).once('value', snapshot => {
                if (snapshot.exists()) {
                    const timestamp = snapshot.val()
                    chatroomsWithTimeStamps.push({
                        roomName: chatgroups_for_fetch[idx],
                        timestamp: timestamp
                    })
                }
            })
        }
        // Sort the chat groups based on the timestamp of the latest message
        chatroomsWithTimeStamps = chatroomsWithTimeStamps.sort((a,b) => b.timestamp - a.timestamp)

        // Return the sorted list of chat group names
        return chatroomsWithTimeStamps.map(obj => obj.roomName)

    }

    async fetchLatestMessages(chatgroups_for_fetch) {
        /* Fetch latest messages for the groups we display to the user (to be used in the left navigation part). */
        let latestMessages = {}
        for (let idx=0; idx < chatgroups_for_fetch.length; idx++) {
            await db.ref(`messages/${chatgroups_for_fetch[idx]}`).orderByChild('timestamp').limitToLast(1).once('value', snapshot => {
                if (snapshot.exists()) {
                    const data = snapshot.val()
                    latestMessages[chatgroups_for_fetch[idx]] = Object.values(data)[0] 
                }
            })
        }
        return latestMessages
    }

    async fetchContactsAndChats(maxChatGroups=5, maxMsgNum=50) {
        /* Helper function to update chat and contact lists upon change. */
        if (this.state.currentUser) {
            let chatRoomList = []
            let contacts = []
            let dmChannels = []

            let data = null

            // Then load chats and contacts
            await db.ref(`users/${this.state.currentUser.displayName}`).once('value').then(snapshot => {
                data = snapshot.val()
                // Retrieve the chat groups and DM list
                if (data.chats) {
                    chatRoomList = Object.keys(data.chats)
                }
                
                if (data.contacts) {
                    contacts = Object.keys(data.contacts)
                    dmChannels = Object.values(data.contacts).map(contact => contact.dmChannel)
                }

            })

            // Fetch the most recent messages for up to 5 groups (can be adjusted later)
            let chatgroups_for_fetch = chatRoomList.slice(0, maxChatGroups)
            chatgroups_for_fetch = await this.sortBasedOnLatestMsgTimestamp(chatgroups_for_fetch)

            const allChatChannels = chatgroups_for_fetch.concat(dmChannels)

            const latestMessagelist = await this.fetchLatestMessages(allChatChannels)

            // Update the state of the home page component with all the info we have
            this.setState({
                // chat_rooms: chats,
                chatRoomList: chatgroups_for_fetch,
                contacts: contacts,
                dmChannels: dmChannels,
                latestMessagelist: latestMessagelist,
                fetching: false,
                name: data.name,
                university: data.university,
            })

            // For these channels, we'll setup listeners for new messages
            await this.setupListenersForMessages(allChatChannels)

        }
    }

    handleOpenDialog(dialogType) {
        this.setState({
            dialogs: {
                [dialogType] : true
            }
        })
    }

    handleCloseDialog(dialogType) {
        this.setState({
            dialogs: {
                [dialogType] : false
            }
        })
    }

    renderMainSide() {
        /* Render main (central) side of the home page depending on the tab being selected. */
        const activeTabId = this.state.activeTabId;
        // Empty page if no tab is selected (initial default)
        if (activeTabId === 'group-search') {
            return <GroupSearchPage />
        }
        else if (activeTabId !== '') {
            return (
                <ChatRoom 
                    username={this.state.currentUser.displayName}
                    roomId={activeTabId}
                    channelType={activeTabId.startsWith('dm-') ? "dm-channel" : "group-channel"}
                />
            );
        }
        else {
            return
        }
    }

    render() {
        // Login needed for access to this page
        if (!this.state.currentUser) {
            return <Redirect to="/login" />
        }
        // if (!this.userLoggedIn()) {
        //     return <Redirect to="/login" />
        // }
        return (
            <div className="home-container">
                {/* <LoadingPage /> */}
                <HomePageHeader 
                        username={this.state.currentUser ? this.state.currentUser.displayName : undefined} 
                        name={this.state.name} 
                        setActiveTab={this.setActiveTab}
                        handleLogout={this.handleLogout}
                        fetchContactsAndChats={this.fetchContactsAndChats}
                        /> 
                <div className="flex-container">
                    <div className="home-sidebar">
                        <LeftNavigation 
                            currentUser={this.state.currentUser ? this.state.currentUser.displayName : undefined}
                            chatrooms={this.state.chatRoomList} 
                            announcement_rooms={this.state.announcement_rooms} 
                            contacts={this.state.contacts}
                            dmChannels={this.state.dmChannels}
                            latestMessagelist={this.state.latestMessagelist} 
                            setActiveTab={this.setActiveTab} 
                            activeTabId={this.state.activeTabId}
                            handleRemoveContact={this.handleRemoveContact}
                            handleOpenDialog={this.handleOpenDialog}
                            />
                    </div>
                    <div className="home-main">  
                        {this.renderMainSide()}
                        {this.state.friendAdditionSnackbar.show ? <FriendAdditionSnackbar statusMessage={this.state.friendAdditionSnackbar.message} /> : <div></div>}
                        {/* Dialogs */}
                        <FriendSearchDialog 
                            show={this.state.dialogs.friendSearch}
                            currentUser={this.state.currentUser ? this.state.currentUser.displayName : undefined} 
                            currentContacts={this.state.contacts}
                            handleCloseDialog={this.handleCloseDialog} 
                            executeOnFriendAddition={this.executeOnFriendAddition} 
                            reloadFunc={this.fetchContactsAndChats}
                        />
                        <NewChatGroupDialog 
                            show={this.state.dialogs.newChatGroup}
                            username={this.state.currentUser ? this.state.currentUser.displayName : undefined} 
                            handleCloseDialog={this.handleCloseDialog} 
                            universityOfUser={this.state.university} 
                            contacts={this.state.contacts} 
                            reloadFunc={this.fetchContactsAndChats}
                        />
                    </div>
                    <ToastContainer />
                </div>
            </div>
        );
    }
}

export default HomePage;