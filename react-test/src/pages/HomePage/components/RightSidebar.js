import React from 'react'
import './RightSidebar.css'

import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import ListSubheader from '@material-ui/core/ListSubheader'

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
            const username = contact.username
            return (
                <List>
                    <ListItem button onClick={username !== this.props.username ? this.renderUserMenu : null}>
                        <ListItemIcon>
                            <Avatar>{username[0].toUpperCase()}</Avatar>
                        </ListItemIcon>
                        <ListItemText primary={username}/>
                    </ListItem>
                    <UserMenu anchorForMenu={this.state.anchorForMenu} handleClose={this.handleClose} />
                </List>
            )
        })
    }

    render() {
        return (
            <div className="right-sidebar-container">
                <div className="right-sidebar-header-container">
                    <h2 className="right-sidebar-header">Kullanıcılar</h2>
                </div>
                <div className="right-sidebar-contact-list">{this.renderContacts()}</div>
            </div>
        )
    }
}

export default RightSidebar