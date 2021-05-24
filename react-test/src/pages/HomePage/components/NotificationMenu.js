import React, { useEffect } from 'react'
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

const InviteAccept = (props) => {
    // Invite acceptance function component.
    async function handleOpenChat() {
        let dmChannel
        await db.ref(`users/${props.currentUser}/contacts/${props.contact}`).once('value', snapshot => {
          if (snapshot.exists()) {
            dmChannel = snapshot.val().dmChannel
          }
        })
  
        // const dmChannel = `dm-${this.props.currentUser}-${this.props.contact}`
        props.setActiveTab(dmChannel)
        // Close the notification menu
        props.handleClose()
        // Update the contacts list on the left hand side
        props.fetchContactsAndChats()
    }
  
    return (
        <ListItem>
            <ListItemIcon>
                <Avatar>{props.contact[0].toUpperCase()}</Avatar>
            </ListItemIcon>
            <ListItemText>
              <Box>
                {`${props.contact} arkadaşlık isteğini kabul etti!`}
              </Box>
              <Box>
                <Link 
                    component="button" 
                    variant="body1" 
                    onClick={handleOpenChat}
                    >
                    Mesajlaşmaya başlayın!
                </Link>
              </Box>
            </ListItemText>
            <ListItemSecondaryAction>
              <Typography variant='subtitle2'><Moment calendar={CALENDAR_SETTINGS}>{props.timestamp}</Moment></Typography>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

const Invite = (props) => {
    // Invite function component.
    const [outcome, setOutcome] = React.useState(props.outcome)

    const setupDmChannel = (sender, reciever) => {
        return `dm-${sender}-${reciever}`
    }

    async function updateContactsOnFB(user, data) {
        await db.ref(`users/${user}/contacts`).update(data)
    }

    useEffect(() => {
      db.ref(`users/${props.currentUser}/notifications`).on('child_changed', snapshot => {
          const data = snapshot.val()
          // Make necessary updates
          if (data.outcome !== outcome) {
              setOutcome(data.outcome)
          }
      })
    })
  
    async function sendAcceptanceNotificationBackToUser(reciever, sender) {
        const notificationHash = Math.random().toString(36).substring(7)
        const notificationTag = `${reciever}-${notificationHash}`

        await db.ref(`users/${sender}/notifications/${notificationTag}`).set({
          readByRecipient: false,
          type: 'user-invitation-accept',
          tag: notificationTag,
          from: reciever,
          timestamp: firebase.database.ServerValue.TIMESTAMP,
        })
    }

    async function updateCurrentRequestAsResolved(user, outcome) {
        const updates = {
          [`users/${user}/notifications/${props.tag}/outcome`] : outcome,
          
        }
        await db.ref().update(updates)
    }

    async function handleAccept() {
        // Handle invite accept.
        setOutcome('Accepted')
        const sender = props.contact
        const reciever = props.currentUser

        const dmChannelName = setupDmChannel(sender, reciever)
        
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
        await updateContactsOnFB(sender, dataForSender)
        await updateContactsOnFB(reciever, dataForReciever)

        await sendAcceptanceNotificationBackToUser(reciever, sender)

        await updateCurrentRequestAsResolved(props.currentUser, 'Accepted')
    }

    async function handleReject() {
        // Handle invite reject.
        setOutcome('Rejected')
        await updateCurrentRequestAsResolved(props.currentUser, 'Rejected')
    }

    async function handleOpenChat() {
      // Handle opening the right chat window upon clicking the link.
      let dmChannel
      await db.ref(`users/${props.currentUser}/contacts/${props.contact}`).once('value', snapshot => {
        if (snapshot.exists()) {
          dmChannel = snapshot.val().dmChannel
        }
      })

      props.setActiveTab(dmChannel)
      // Close the notification menu
      props.handleClose()
      // Update the contacts list on the left hand side
      props.fetchContactsAndChats()
    }

    let textComponentToDisplay
    if (!outcome) {
        textComponentToDisplay = <ListItemText>{`${props.contact} sana arkadaşlık isteği yolladı!`}</ListItemText>
    }
    else {
        if (outcome === 'Accepted') {
          textComponentToDisplay = 
            <ListItemText>
                <Box>
                    {`${props.contact} ile arkadaş oldun! `}
                </Box>
                <Box>
                    <Link 
                        component="button" 
                        variant="body1" 
                        onClick={handleOpenChat}
                        >
                        Mesajlaşmaya başlayın!
                    </Link>
                </Box>
            </ListItemText>
        }
        else {
          textComponentToDisplay = <ListItemText>{'Üzgünüz! Belki başka bir zaman.'}</ListItemText>    
        }
    }

    const buttonStyle = {
        textTransform: "none"
    }

    return (
        <ListItem>
            <Box display="flex">
                <ListItemIcon>
                    <Avatar>{props.contact[0].toUpperCase()}</Avatar>
                </ListItemIcon>
                <ListItemText>
                {textComponentToDisplay}
                  {outcome ? (
                    <></>
                  ) : (
                    <Box display="flex" mt={1}>
                      <Box>
                        <Button size="small" variant="contained" onClick={handleAccept} style={buttonStyle} color="primary">
                            <Typography variant="body2">
                                Kabul et
                            </Typography>
                        </Button>
                    </Box>
                    <Box mx={1}>
                        <Button size="small" variant="contained" onClick={handleReject} style={buttonStyle} color="secondary">
                            <Typography variant="body2">
                                Reddet
                            </Typography>
                        </Button>
                    </Box>
                  </Box>
                  )}
                </ListItemText>
            </Box>
            <ListItemSecondaryAction>
              <Typography variant='subtitle2'><Moment calendar={CALENDAR_SETTINGS}>{props.timestamp}</Moment></Typography>
            </ListItemSecondaryAction>
        </ListItem>
    )
}

const NotificationMenu = (props) => {
  const [notifications, setNotifications] = React.useState([]) 
  const [numNotifications, setNumNotifications] = React.useState(0)
  const [anchorEl, setAnchorEl] = React.useState(null)

  const username = props.username
  // Limit to last 10 notifications while fetching
  const limitToLast = 10

  const handleMenu = (event) => {
    setAnchorEl(event.target)
    // Mark all the notifications as "read"
    for (let idx=0; idx < notifications.length; idx++) {
      db.ref(`users/${props.username}/notifications/${notifications[idx].tag}/readByRecipient`).set(true)
    }
  }

  const handleClose = () => {
    setAnchorEl(null)
    setNumNotifications(0)
  }

  const findNotificationIndexByTag = (tag) => {
    const checkFunc = (tag, notification) => notification.tag === tag
    return notifications.findIndex(checkFunc)
  }

  const getNumberOfUnreadNotifications = (list) => {
      // From the list of notifications, get the number of unread notifications
      return list.filter(notification => !notification.readByRecipient).length
  }

  let notificationList = []

  useEffect(() => {
    db.ref(`users/${username}/notifications`).limitToLast(limitToLast).on('child_added', data => {
      notificationList.unshift(data.val())
    })

  // If notifications are updated, update the component
  if (notificationList.length !== notifications.length) {
      setNotifications(notificationList)
      setNumNotifications(
        getNumberOfUnreadNotifications(notificationList)
      )
    }  

    db.ref(`users/${username}/notifications`).limitToLast(limitToLast).on('child_changed', data => {
      // If a notification property is changed, update the component state
      const notificationTag = data.val().tag
      const notificationIdx = findNotificationIndexByTag(notificationTag)

      notifications[notificationIdx] = data.val()
      setNotifications(notificationList)
    })

  })

  return (
    <div>
        <IconButton
          aria-label="account of current user"
          aria-controls="menu-appbar"
          aria-haspopup="true"
          onClick={handleMenu}
          color="inherit"
        >
          <Badge badgeContent={numNotifications} color="secondary">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <Menu
              id="notification-menu"
              style={{
                marginTop: "40px",
              }}
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                style: {
                  // Fixed menu width (can be adjusted later).
                  width: '500px'
                }
              }}
        >
          <MenuItem>
              <Box mb={1}>
                <Typography variant="body1" color="textPrimary" style={{fontWeight: "bold"}}>
                    Bildirimlerin
                </Typography>
                </Box>
            </MenuItem>
          <Divider />
          {notifications.length !== 0 ? 
              notifications.map(notification => {
                if (notification.type === 'user-invitation') {
                  return (
                    <Box>
                        <Invite 
                            outcome={notification.outcome} 
                            resolved={notification.resolved} 
                            tag={notification.tag} 
                            contact={notification.from} 
                            timestamp={notification.timestamp}
                            currentUser={username} 
                            setActiveTab={props.setActiveTab}
                            handleClose={handleClose}
                            fetchContactsAndChats={props.fetchContactsAndChats}
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
                            timestamp={notification.timestamp} 
                            currentUser={username} 
                            setActiveTab={props.setActiveTab}
                            handleClose={handleClose}
                            fetchContactsAndChats={props.fetchContactsAndChats}
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

export default NotificationMenu