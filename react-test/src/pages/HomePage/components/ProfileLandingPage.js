import React from 'react'
import './ProfileLandingPage.css'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import Typography from '@material-ui/core/Typography'

import { db } from '../../../services/firebase'

class SearchBar extends React.Component {
    constructor(props) {
        super(props)
    }

    render() {
        return (
            <div className="search-area-container">
                <Autocomplete
                     id="group-search-box" 
                     options={this.props.chatrooms}
                     getOptionLabel={(chatroom) => chatroom.name}
                     style={{ width: 600 }}
                     renderInput={(params) => <TextField {...params} label="Topluluk ara" variant="outlined"/>}
                /> 
            </div>
        )
    }
}

class ProfileLandingPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            'chatrooms' : [],
            'dropdown' : {
                'chatroomlist' : [],
                'activeTabId'  : -1
            }
        }

        // References
        this.searchbar = React.createRef()

        this.removeChatRoomDropdown = this.removeChatRoomDropdown.bind(this)
        this.setChatRoom = this.setChatRoom.bind(this)
        this.changeActiveChatRoomOnKeystreak = this.changeActiveChatRoomOnKeystreak.bind(this)

    }
    componentDidMount() {
        // Search and load the group list
        fetch('/api/chatrooms', {
            method: 'GET',
            headers: {
                'Content-Type' : 'application/json',
                'Accept' : 'application/json',
            }
        })
        .then(response => response.json())
        .then(jsonResponse => {
            this.setState({
                ...this.state,
                'chatrooms' : jsonResponse
            })
        })
    }

    removeChatRoomDropdown() {
        this.setState({
            ...this.state,
            'dropdown' : {
                'chatroomlist' : [],
                'activeTabId' : -1
            }
        })
    }

    setChatRoom(e) {
        e.preventDefault()
        this.searchbar.current.value = e.target.text
        // Close the dropdown
        this.removeChatRoomDropdown()
        this.searchbar.current.focus()
    }

    changeActiveChatRoomOnKeystreak(e) {
        const chatroomInputField = this.searchbar.current.value
        if (chatroomInputField === '') {
            return
        }
        const currentActiveTab = this.state.dropdown.activeTabId
        const currentChatroomList = this.state.dropdown.chatroomlist

        if (e.key === 'Enter') {
            if (currentChatroomList.length ===  0) {
                return
            }
            // Do not submit the form because of the enter keypress lol
            e.preventDefault()
            const selectedChatroom = currentChatroomList[currentActiveTab]
            this.searchbar.current.value = selectedChatroom.name
            this.removeChatRoomDropdown()
            return
        }

        // Escape key
        if (e.keyCode === 27) {
            this.removeChatRoomDropdown()
            return
        }
        // Update the active tab ID, based on whether up or down key is pressed
        // Up key
        let newActiveTab
        if (e.keyCode === 38) {
            if (currentActiveTab < 0) {
                return
            }
            newActiveTab = currentActiveTab - 1
        }
        // Down key
        else if (e.keyCode === 40) {
            newActiveTab = currentActiveTab + 1
        }

        // Update the state
        this.setState({
            ...this.state,
            dropdown: {
                chatroomlist: currentChatroomList,
                activeTabId: newActiveTab
            }
        })
    }

    render() {
        return (
            <div>
                <div className="search-bar-container">
                    <Typography variant="h4" style={{margin: "60px 0 30px 0"}}>Topluluk keşfet</Typography>
                    <SearchBar chatrooms={this.state.chatrooms}/>
                    <br></br>
                    <Button variant="contained" color="primary" style={{width: "150px", fontSize: "20px", textTransform: "none"}}>Ara</Button>
                </div>
            </div>
        )
    }
}

export default ProfileLandingPage