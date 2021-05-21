import React from 'react'
// import './HomePageHeader.css'

import { makeStyles } from '@material-ui/core/styles'

import Notifications from "react-notifications-menu"

import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import MenuIcon from '@material-ui/icons/Menu'
import AccountCircle from '@material-ui/icons/AccountCircle'
import MenuItem from '@material-ui/core/MenuItem'
import Menu from '@material-ui/core/Menu'
import ListSubheader from '@material-ui/core/ListSubheader'
import Divider from '@material-ui/core/Divider'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import Box from '@material-ui/core/Box'
import Link from '@material-ui/core/Link'

import NotificationMenu from './NotificationMenu'

import firebase from 'firebase'
import { db } from '../../../services/firebase'

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
    },
    appbar: {
        background: "#6495ED"
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  }));

  export default function HomePageHeader(props) {
    const classes = useStyles();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
  
    // If a username is passed in as props, we're logged in 
    const username = props.username ? props.username : null
    const loggedIn = username !== null

    const handleMenu = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleClose = () => {
      setAnchorEl(null);
    };
  
    const menuButtonStyle = {
      margin: "0 15px", 
      textTransform: "none", 
      fontSize: "16px"
    }

    let menuBoxStyle = {
      textAlign: "center"
    }
    
    let menuDivStyle = {
      width: "100%",
    }

    let rightMenuStyle = {
      width: "10%",
    }

    if (!loggedIn) {
      menuBoxStyle = {
        textAlign: "center"
      }

    }

    const notificationData = [
      {
        'image' : '',
        'message' : 'Test notification.',
        'detailPage' : '/',
        'receivedTime' : '12h ago',
      },
      {
        'image' : '',
        'message' : 'Another test notification.',
        'detailPage' : '/',
        'receivedTime' : '12h ago',
      },
    ]
      
    

    return (
      <div className={classes.root}>
        <AppBar position="static" className={classes.appbar}>
          <Toolbar>
            <Box ml={1}>
              <Typography variant="h6" className={classes.title}>
                <Link id="link-main" href="/" color="inherit" style={{textDecoration: "none"}} >
                  KampüsteKal
                </Link>
              </Typography>
            </Box>
            <Box style={menuDivStyle}>
              <Box style={menuBoxStyle}>
                <Button color="inherit" style={menuButtonStyle}>KampüsteKal</Button>
                <Button color="inherit" style={menuButtonStyle}>Blog</Button>
                <Button color="inherit" style={menuButtonStyle}>İletişim</Button>
              </Box>
            </Box>
            {loggedIn ?
              <Box style={rightMenuStyle} display="flex" p={1} flexDirection="row">
                <Box p={1.25}>
                  <Typography>{props.username}</Typography>
                </Box>
                <Box display="flex" flexDirection="row">
                <IconButton
                    aria-label="account of current user"
                    aria-controls="menu-appbar"
                    aria-haspopup="true"
                    onClick={handleMenu}
                    color="inherit"
                  >
                    <AccountCircle />
                  </IconButton>
                  <NotificationMenu 
                      username={props.username} 
                      notifications={props.notifications} 
                      setActiveTab={props.setActiveTab} 
                      fetchContactsAndChats={props.fetchContactsAndChats}
                      />
                  <Menu
                    id="menu-appbar"
                    style={{
                      marginTop: "40px"
                    }}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={open}
                    onClose={handleClose}
                  >
                  <Avatar style={{margin: "auto"}}>{props.username[0].toUpperCase()}</Avatar>
                  <ListSubheader component="div" style={{lineHeight: "30px", margin: "15px 10px"}}>
                      @{props.username}<br></br>
                      {props.name}
                  </ListSubheader>
                  <Divider style={{marginBottom: "8px"}} />
                    <MenuItem onClick={handleClose}>Ayarlar</MenuItem>
                    <MenuItem onClick={props.handleLogout}>Çıkış Yap</MenuItem>
                  </Menu>  
                </Box>
              </Box>
            :
            <Box style={rightMenuStyle}></Box>
            }
              
          </Toolbar>
        </AppBar>
      </div>
    );
  }