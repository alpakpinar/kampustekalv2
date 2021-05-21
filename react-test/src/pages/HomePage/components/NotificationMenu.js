import React from 'react'
import Moment from 'react-moment'
import 'moment/locale/tr' // TR style date formatting

import { makeStyles } from '@material-ui/core/styles'

import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import Divider from '@material-ui/core/Divider'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import Link from '@material-ui/core/Link'

import Card from '@material-ui/core/Card'
import CardActions from '@material-ui/core/CardActions'
import CardHeader from '@material-ui/core/CardHeader'
import CardContent from '@material-ui/core/CardContent'

import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'

import NotificationsIcon from '@material-ui/icons/Notifications'
import Badge from '@material-ui/core/Badge'

import CheckIcon from '@material-ui/icons/Check'

import firebase from 'firebase'
import { db } from '../../../services/firebase'

// Calendar settings for react-moment
const CALENDAR_SETTINGS = {
  lastDay : '[Dün] LT',
  sameDay : '[Bugün] LT',
  lastWeek : 'dddd',
  sameElse : 'l'
}

class InviteAccept extends React.Component {
      constructor(props) {
        super(props)
        this.state = {
          text: `${this.props.contact} arkadaşlık teklifini kabul etti!`
        }
        this.handleOpenChat = this.handleOpenChat.bind(this)
      }
      
      async handleOpenChat() {
        /* Open chat with new user upon click. */
        // Get the dmChannel with the selected user
        let dmChannel
        await db.ref(`users/${this.props.currentUser}/contacts/${this.props.contact}`).once('value', snapshot => {
          if (snapshot.exists()) {
            dmChannel = snapshot.val().dmChannel
          }
        })

        // const dmChannel = `dm-${this.props.currentUser}-${this.props.contact}`
        this.props.setActiveTab(dmChannel)
        // Close the notification menu
        this.props.handleClose()
        // Update the contacts list on the left hand side
        this.props.fetchContactsAndChats()
      }

      render() {
        return (
          <ListItem>
            <ListItemIcon>
                <Avatar>{this.props.contact[0].toUpperCase()}</Avatar>
            </ListItemIcon>
            <ListItemText>
              <Box>
                {`${this.props.contact} ile arkadaş oldun! `}
              </Box>
              <Box>
                <Link 
                    component="button" 
                    variant="body1" 
                    onClick={this.handleOpenChat}
                    >
                    Mesajlaşmaya başlayın!
                </Link>
              </Box>
            </ListItemText>
            <ListItemSecondaryAction>
              <Typography variant='subtitle2'><Moment calendar={CALENDAR_SETTINGS}>{this.props.timestamp}</Moment></Typography>
            </ListItemSecondaryAction>
          </ListItem>
        )
    }
}
  
class Invite extends React.Component {
      /* One friendship invite. */
      constructor(props) {
        super(props)
        this.state = {
          // text: `${this.props.contact} sana arkadaşlık isteği yolladı!`,
          text: {
            new: `${this.props.contact} sana arkadaşlık isteği yolladı!`,
            resolved: `${this.props.contact} ile arkadaş oldun! Mesajlaşmaya başlayın!`
          },
          buttonStyle: {
            textTransform: "none",
          },
        }
  
        this.handleAccept = this.handleAccept.bind(this)
        this.handleReject = this.handleReject.bind(this)
        this.handleOpenChat = this.handleOpenChat.bind(this)
      }
  
      async handleAccept() {
        /* If the invite is accepted, make the two users contacts. */
        const sender = this.props.contact
        const reciever = this.props.currentUser
        // Setup a DM channel between the two contacts, we'll store this in the database
        const dmChannelName = `dm-${this.props.contact}-${this.props.currentUser}`
        const dataForSender = {
          [reciever] : {
            dmChannel : dmChannelName
          }
        }
        const dataForReciever = {
          [sender] : {
            dmChannel: dmChannelName
          }
        }
        await db.ref(`users/${sender}/contacts`).update(dataForSender)
        await db.ref(`users/${reciever}/contacts`).update(dataForReciever)
  
        // Send accepted notification back to the sender
        const notificationHash = Math.random().toString(36).substring(7)
        const notificationTag = `${reciever}-${notificationHash}`
        await db.ref(`users/${sender}/notifications/${notificationTag}`).set({
          readByRecipient: false,
          type: 'user-invitation-accept',
          tag: notificationTag,
          from: reciever,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
          resolved: true
        })

        // Update the status of the current notification as "resolved" in the database
        const updates = {
          [`users/${reciever}/notifications/${this.props.tag}/resolved`] : true,
          [`users/${reciever}/notifications/${this.props.tag}/outcome`] : 'Accepted'
        }
        await db.ref().update(updates)

      }
  
      async handleReject() {
        // Remove the invite from the recipient's records
        // To be continued here...
        const reciever = this.props.currentUser
        // Update the status of the current notification as "resolved" in the database
        const updates = {
          [`users/${reciever}/notifications/${this.props.tag}/resolved`] : true,
          [`users/${reciever}/notifications/${this.props.tag}/outcome`] : 'Rejected'
        }
        await db.ref().update(updates)

      }
  
      async handleOpenChat() {
        /* Open chat with new user upon click. */
        // Get the dmChannel with the selected user
        let dmChannel
        await db.ref(`users/${this.props.currentUser}/contacts/${this.props.contact}`).once('value', snapshot => {
          if (snapshot.exists()) {
            dmChannel = snapshot.val().dmChannel
          }
        })

        this.props.setActiveTab(dmChannel)
        // Close the notification menu
        this.props.handleClose()
        // Update the contacts list on the left hand side
        this.props.fetchContactsAndChats()
      }

      render() {
        // const entryWidth = this.props.resolved ? 0.85 : 0.6
        const entryWidth = 0.6
        const timeStampWidth = 0.1

        let textComponentToDisplay = null
        if (!this.props.resolved) {
          textComponentToDisplay = <ListItemText>{`${this.props.contact} sana arkadaşlık isteği yolladı!`}</ListItemText>
        }
        else {
          if (this.props.outcome === 'Accepted') {
            textComponentToDisplay = 
            <ListItemText>
              {`${this.props.contact} ile arkadaş oldun! `}
                <Link 
                    component="button" 
                    variant="body1" 
                    onClick={this.handleOpenChat}
                    >
                    Mesajlaşmaya başlayın!
                </Link>
            </ListItemText>
          }
          else {
            textComponentToDisplay = <ListItemText>{'Üzgünüz! Belki başka bir zaman.'}</ListItemText>
          }
        }

        return (
          <ListItem>
            <Box display="flex" width={entryWidth}>
                <ListItemIcon>
                    <Avatar>{this.props.contact[0].toUpperCase()}</Avatar>
                </ListItemIcon>
                {textComponentToDisplay}
                {this.props.resolved ? (
                  <></>
                ) : (
                  <Box display="flex" mt={1}>
                    <Box mx={1}>
                      <Button size="small" variant="contained" onClick={this.handleAccept} style={this.state.buttonStyle} color="primary">
                          <Typography variant="body2">
                              Kabul et
                          </Typography>
                      </Button>
                  </Box>
                  <Box mx={1}>
                      <Button size="small" variant="contained" onClick={this.handleReject} style={this.state.buttonStyle} color="secondary">
                          <Typography variant="body2">
                              Reddet
                          </Typography>
                      </Button>
                  </Box>
                </Box>
                )}
                    
            </Box>
            <ListItemSecondaryAction>
              <Typography variant='subtitle2'><Moment calendar={CALENDAR_SETTINGS}>{this.props.timestamp}</Moment></Typography>
            </ListItemSecondaryAction>
          </ListItem>
        )
    }
}
  
    class NotificationMenu extends React.Component {
      constructor(props) {
        super(props)
        this.state = {
          invites: [],
          inviteAcceptances: [],
          anchorEl: null,
          numNotifications: props.notifications.filter(notification => !notification.readByRecipient).length,
        }
        this.handleMenu = this.handleMenu.bind(this)
        this.handleClose = this.handleClose.bind(this)
      }
  
      handleMenu(e) {
        this.setState({anchorEl: e.target})
        // Now that the user reads all the notifications, update the status accordingly in the database
        for (let idx=0; idx < this.props.notifications.length; idx++) {
          db.ref(`users/${this.props.username}/notifications/${this.props.notifications[idx].tag}/readByRecipient`).set(true)
        }
      }
  
      handleClose() {
        this.setState({
          anchorEl: null,
          numNotifications: 0
        })
      }
  
      componentDidUpdate(prevProps) {
        /* Update notification list if a new notification is passed in */
        if (prevProps.notifications !== this.props.notifications) {
          const newNumNotifications = this.props.notifications.filter(notification => !notification.readByRecipient).length
          this.setState({numNotifications: newNumNotifications})
        }
      }

      render() {
        return (
          <div>
            <IconButton
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={this.handleMenu}
              color="inherit"
            >
              <Badge badgeContent={this.state.numNotifications !== 0 ? this.state.numNotifications : null} color="secondary">
                <NotificationsIcon />
              </Badge>
            </IconButton>
            <Menu
              id="notification-menu"
              style={{
                marginTop: "40px",
              }}
              anchorEl={this.state.anchorEl}
              open={Boolean(this.state.anchorEl)}
              onClose={this.handleClose}
            >
              <MenuItem>
                  <Box mb={1}>
                    <Typography variant="body1" color="textPrimary" style={{fontWeight: "bold"}}>
                        Bildirimlerin
                    </Typography>
                    </Box>
                </MenuItem>
              <Divider />
              {this.props.notifications.length !== 0 ? 
              this.props.notifications.map(notification => {
                if (notification.type === 'user-invitation') {
                  return (
                    <Box>
                        <Invite 
                            outcome={notification.outcome} 
                            resolved={notification.resolved} 
                            tag={notification.tag} 
                            contact={notification.from} 
                            timestamp={notification.timestamp}
                            currentUser={this.props.username} 
                            setActiveTab={this.props.setActiveTab}
                            handleClose={this.handleClose}
                            fetchContactsAndChats={this.props.fetchContactsAndChats}
                            />
                        <Divider light={true} />
                    </Box>
                    )
                }
                else if (notification.type === 'user-invitation-accept') {
                  return (
                    <Box>
                        <InviteAccept 
                            contact={notification.from} 
                            currentUser={this.props.username} 
                            timestamp={notification.timestamp} 
                            setActiveTab={this.props.setActiveTab}
                            handleClose={this.handleClose}
                            fetchContactsAndChats={this.props.fetchContactsAndChats}
                            />
                        <Divider light={true} />
                    </Box>
                    )
                }
              }) : <MenuItem>Şu an yeni bir bildirim yok!</MenuItem>
              }
            </Menu>
          </div>
        )
      }
    }
  
export default NotificationMenu
