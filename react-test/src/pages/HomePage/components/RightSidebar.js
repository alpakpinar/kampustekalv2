import React from 'react'
import { makeStyles, withStyles } from '@material-ui/core/styles'

import Box from '@material-ui/core/Box'
import Badge from '@material-ui/core/Badge'
import Tooltip from '@material-ui/core/Tooltip'
import Avatar from '@material-ui/core/Avatar'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListSubheader from '@material-ui/core/ListSubheader'

const USER_ONLINE_COLOR = '#44b700'
const USER_OFFLINE_COLOR = '#ffc400'

const StyledBadge = withStyles((theme) => ({
    badge: {
      backgroundColor: USER_ONLINE_COLOR,
      color: USER_ONLINE_COLOR,
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        // content: '',
        // animation: '$ripple 1.2s infinite ease-in-out',
        // border: '1px solid currentColor',
        },
    },
    // '@keyframes ripple': {
    //   '0%': {
    //     transform: 'scale(.8)',
    //     opacity: 1,
    //   },
    //   '100%': {
    //     transform: 'scale(2.4)',
    //     opacity: 0,
    //   },
    // },
  }))(Badge)

class UserMenu extends React.Component {
    render() {
        function isUppercase(s) {
            return s === s.toUpperCase()
        }

        let username
        
        if (this.props.anchorForMenu) {
            username = this.props.anchorForMenu.textContent
            // Some pre-processing here...
            if ((username.length > 1) && (isUppercase(username[0]))) {
                username = username.slice(1)
            }
            else if (username.length === 1) {
                username = ''
            }
        }
        return (
            <div>
                <Menu
                    anchorEl={this.props.anchorForMenu}
                    keepMounted
                    open={Boolean(this.props.anchorForMenu)}
                    onClose={this.props.handleClose}
                >
                    <ListSubheader component="div">{this.props.anchorForMenu ? '@' + username : ''}</ListSubheader>
                    <MenuItem onClick={this.props.handleClose}>Direkt mesaj yolla</MenuItem>
                    <MenuItem onClick={this.props.handleClose}>Kullanıcıyı ekle</MenuItem>
                </Menu>
            </div>
        )
    }
}

class RightSidebar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            anchorForMenu: null
        }
        this.renderContacts = this.renderContacts.bind(this)
        this.renderUserMenu = this.renderUserMenu.bind(this)
        this.handleClose = this.handleClose.bind(this)
    }

    renderUserMenu(e) {
        this.setState({
            anchorForMenu: e.target
        })
    }
    
    handleClose() {
        this.setState({
            anchorForMenu: null
        })
    }

    renderContacts() {
        return this.props.contacts.map(contact => {
            return (
                <ListItem button onClick={contact !== this.props.username ? this.renderUserMenu : null}>
                    <ListItemIcon>
                        <Tooltip title="Cevrimiçi">
                            <StyledBadge
                                overlap='circle'
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right'
                                }}
                                variant='dot'
                            >
                                <Avatar>{contact[0].toUpperCase()}</Avatar>
                            </StyledBadge>
                        </Tooltip>
                    </ListItemIcon>
                    <ListItemText primary={contact} />
                </ListItem>
            )
        })
    }

    render() {
        return (
            <div>
                <Box my={3}>
                    <Typography color="textPrimary" variant="h5">{this.props.chatRoomName}</Typography>
                </Box>
                <Box my={2}>
                    <Typography color="textPrimary" variant="h6" style={{fontWeight: "bold"}}>Kullanıcılar</Typography>
                </Box>
                <Box mt={2}>
                    <List disablePadding={true}>
                        {this.renderContacts()}
                    </List>
                    <UserMenu anchorForMenu={this.state.anchorForMenu} handleClose={this.handleClose} />
                </Box>
            </div>
        )
    }
}

export default RightSidebar