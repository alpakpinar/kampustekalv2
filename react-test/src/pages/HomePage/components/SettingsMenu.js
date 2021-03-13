import React from 'react'
import './SettingsMenu.css'

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import MoreVertIcon from '@material-ui/icons/MoreVert'

class SettingsMenu extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            menu: null
        }
        this.showSettingsMenu = this.showSettingsMenu.bind(this)
        this.handleSettingsMenuClose = this.handleSettingsMenuClose.bind(this)
    }

    showSettingsMenu(e) {
        this.setState({
            ...this.state,
            menu: e.currentTarget
        })
    }

    handleSettingsMenuClose() {
        this.setState({
            ...this.state,
            menu: null
        })
    }

    render() {
        return (
            <div className="settings-div">
                <Button aria-controls="simple-menu" aria-haspopup="true" onClick={this.showSettingsMenu}><MoreVertIcon></MoreVertIcon></Button>
                <Menu
                    id="simple-menu"
                    anchorEl={this.state.menu}
                    keepMounted
                    open={Boolean(this.state.menu)}
                    onClose={this.handleSettingsMenuClose}
                >
                    <MenuItem onClick={this.handleSettingsMenuClose}>Sohbet Geçmişini Temizle</MenuItem>
                    <MenuItem onClick={this.handleSettingsMenuClose}>Gruptan Ayrıl</MenuItem>
                    <MenuItem onClick={this.props.handleLogout}>Çıkış Yap</MenuItem>
                </Menu>
            </div>

        )
    }
}

export default SettingsMenu