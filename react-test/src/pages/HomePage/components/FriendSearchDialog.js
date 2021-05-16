import React from 'react'

import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import Divider from '@material-ui/core/Divider'

import IconButton from '@material-ui/core/IconButton'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CloseIcon from '@material-ui/icons/Close'
import AddIcon from '@material-ui/icons/Add'
import CircularProgress from '@material-ui/core/CircularProgress'

import { db, auth } from '../../../services/firebase'
import firebase from 'firebase'

class Contact extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            added: false
        }
        this.uniTextStyle = {
            color: "gray",
            fontSize: "15px",
            fontStyle: "italic"
        }

        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        // If user is already a contact (or self), do nothing
        if (this.props.isContact || this.props.isSelf) {
            return
        }
        this.setState({added: true})
        const usernameBeingAdded = this.props.contact.username
        const usernameAdding = this.props.currentUser

        const notificationHash = Math.random().toString(36).substring(7)
        const notificationTag = `${usernameAdding}-${notificationHash}`

        db.ref(`users/${usernameBeingAdded}/notifications/${notificationTag}`).set({
            readByRecipient: false,
            type: 'user-invitation',
            tag: notificationTag,
            from: usernameAdding,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        })

        // Success message
        this.props.execOnSuccess(usernameBeingAdded)
    }

    render() {
        return (
            <div>
                <ListItem button={true} onClick={this.handleClick}>
                    <ListItemIcon>
                        <Avatar>{this.props.contact.username[0].toUpperCase()}</Avatar>
                    </ListItemIcon>
                    <ListItemText>
                        <Typography variant="h6">{this.props.contact.username}{this.props.isContact ? " (Arkadaşın)" : this.props.isSelf ? " (Sen)" : ""}</Typography>
                        <Typography variant="h6" style={this.uniTextStyle}>{this.props.contact.university}</Typography>
                    </ListItemText>
                    <IconButton>
                        {this.props.isContact ? <CheckCircleIcon color="primary"/> : this.props.isSelf ? <></> : this.state.added ? <CheckCircleIcon /> : <AddIcon />}
                    </IconButton>
                </ListItem>
            </div>
        )
    }
}

class FriendSearchDialog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentUser: auth.currentUser,
            fetching: false,
            querying: false,
            allUsers: [], // All users as fetched from the database (initially, these will be shown)
            users: [], // Users matching the search results
        }

        this.closeIconStyle = {
            position: "absolute",
            right: "1px",
            top: "1px"
        }

        this.handleClose = this.handleClose.bind(this)
        this.handleSearch = this.handleSearch.bind(this)
        this.searchUsers = this.searchUsers.bind(this)
    }

    handleClose() {
        this.props.handleCloseDialog('friendSearch')
        // Update the latest friends list
        this.props.reloadFunc()
    }

    handleSearch(e) {
        // Upon pressing enter key, send the query
        if (e.keyCode === 13) {
            const username = e.target.value
            if (username.trim() !== '') {
                this.searchUsers(username)
            }
        }
    }

    async searchUsers(username) {
        /* Search from the list of usernames. */
        this.setState({querying: true})
        let users = []
        await db.ref('users').orderByChild('username').equalTo(username).once('value', snapshot => {
            if (snapshot.exists()) {
                const data = Object.values(snapshot.val())
                users = data.map(user => {
                    return {
                        username: user.username,
                        university: user.university,
                    }
                })
            }
        })
        this.setState({querying: false, users: users})
    }

    render() {
        return (
            <div>
                <Dialog open={this.props.show} onClose={this.handleClose} fullWidth={true}>
                    <DialogTitle>Yeni Arkadaş Ekle</DialogTitle>
                    <DialogContent>
                        <TextField 
                            label="Kullanıcı ara" 
                            variant="outlined"
                            onKeyDown={this.handleSearch}
                            fullWidth={true}
                            />
                        {/* <Autocomplete 
                            options={this.state.allUsers}
                            autoComplete={true}
                            clearOnEscape={true} // Clear the pop-up after some value is entered
                            freeSolo={true} // User not bound to the suggested values
                            popupIcon={null} // Get rid of that arrow icon on the right
                            loading={this.state.querying}
                            loadingText="Arıyoruz..."
                            noOptionsText="Kullanıcı yok"
                            getOptionLabel={user => user.username}
                            renderInput={(params) => <TextField {...params} label="Kullanıcı ara" variant="outlined" />}
                            onKeyDown={this.handleSearch}
                        /> */}
                        {this.state.fetching ? <CircularProgress /> : 
                            <List style={{maxHeight: "50%", overflow: "auto"}}>
                            {this.state.users.map(contact => {
                                let isContact = this.props.currentContacts.includes(contact.username)
                                let isSelf = this.state.currentUser.displayName === contact.username
                                return (
                                    <Contact 
                                        contact={contact} 
                                        currentUser={this.props.currentUser} 
                                        isContact={isContact} 
                                        isSelf={isSelf} 
                                        execOnSuccess={this.props.executeOnFriendAddition}
                                        />
                                )
                            })}
                        </List>
                        }
                    </DialogContent>
                    <IconButton onClick={this.handleClose} style={this.closeIconStyle}>
                        <CloseIcon></CloseIcon>
                    </IconButton>
                </Dialog>
            </div>
        )
    }
}

export default FriendSearchDialog