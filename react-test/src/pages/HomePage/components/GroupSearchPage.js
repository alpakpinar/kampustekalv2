import React from 'react'

import './GroupSearchPage.css'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import Autocomplete from '@material-ui/lab/Autocomplete'
import Typography from '@material-ui/core/Typography'

import Avatar from '@material-ui/core/Avatar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'

import Box from '@material-ui/core/Box'
import Divider from '@material-ui/core/Divider'

import { db } from '../../../services/firebase'
import { CircularProgress } from '@material-ui/core'

import {
    InstantSearch,
    Hits,
    Highlight,
    RefinementList,
    ClearRefinements,
    SearchBox,
    Pagination,
    Configure,
  } from 'react-instantsearch-dom'

// instantsearch.css themes
import 'instantsearch.css/themes/reset.css'
import 'instantsearch.css/themes/satellite.css'

import algoliasearch from 'algoliasearch/lite'

const searchClient = algoliasearch(
    'WHK33GYXC3',
    '1988afa5153d5059c8bc0ebca52d37fb'
)

function Hit(props) {
    return (
      <Box width={1} display="flex">
        <Box width={0.2} justifyContent="center" alignItems="center">
            <Avatar></Avatar>
        </Box>
        <Box width={0.8}>
            <div className="hit-name">
                <Highlight attribute="name" hit={props.hit} />
            </div>
            <div className="hit-roomtype">
                <Highlight attribute="type" hit={props.hit} />
            </div>
            <div className="hit-description">
                <Highlight attribute="description" hit={props.hit} />
            </div>
        </Box>
      </Box>
    );
  }

class SearchEntry extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <ListItem button>
                <ListItemIcon>
                    <Avatar>{this.props.chatroom.name[0].toUpperCase()}</Avatar>
                </ListItemIcon>
                <ListItemText>
                    <Typography>{this.props.chatroom.name}</Typography>
                    <Typography color='textSecondary'>{this.props.chatroom.type}</Typography>
                </ListItemText>
            </ListItem>
        )
    }
}

class SearchBar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            groupChoices: this.props.chatrooms,
            searching: false
        }
        this.handleSearch = this.handleSearch.bind(this)

        this.searchFieldRef = React.createRef()
    }

    async handleSearch(e) {
        const eventType = e.type
        if (!(e.keyCode === 13 || eventType === 'click')) {
            return
        }
        
        this.setState({searching: true})

        let searchQuery = null
        if (eventType === 'keydown' && e.keyCode === 13) {
            // searchQuery = e.target.value.toLowerCase()
            searchQuery = e.target.value
        
        }
        else if (eventType === 'click') {
            searchQuery = this.searchFieldRef.current.value
        }

        if (searchQuery.trim() === '') {
            return
        }

        // Filter the current list of chat rooms to show
        // Primitve search for now, can be improved in the future

        let chatroomsToShow = []

        await db.ref('rooms').orderByChild('name').equalTo(searchQuery).once('value', snapshot => {
            if (snapshot.exists()) {
                chatroomsToShow = Object.values(snapshot.val())
            }
        })

        this.props.execOnSearch(chatroomsToShow)
        this.setState({searching: false})
    }
    
    render() {
        return (
            <Box className="ais-InstantSearch" justifyContent="center">
                {/* <TextField fullWidth variant="outlined" label="Topluluk ara" inputRef={this.searchFieldRef} onKeyDown={this.handleSearch}/> */}
                <InstantSearch indexName="chatrooms" searchClient={searchClient}>
                    <Configure hitsPerPage={5} />
                    <SearchBox 
                        autoFocus
                        searchAsYouType={false}
                        showLoadingIndicator={true}
                        translations={{
                            placeholder: "Topluluk ara"
                        }}
                    />
                    <Hits hitComponent={Hit} />
                    <Pagination />
                </InstantSearch>
            </Box>
            // <Box width={0.5} m="auto">

            //     {/* <Autocomplete
            //          id="group-search-box" 
            //          autoComplete={true}
            //          clearOnEscape={true}
            //          popupIcon={null}
            //         //  freeSolo={true}
            //          noOptionsText="Grup yok"
            //          options={this.state.groupChoices}
            //          getOptionLabel={(chatroom) => `${chatroom.name} (${chatroom.type})`}
            //          style={{ width: 600 }}
            //          renderInput={(params) => <TextField {...params} label="Topluluk ara" variant="outlined"/>}
            //          onKeyDown={this.handleSearch}
            //     />  */}
                
            //     <Box mt={3}>
            //         <Button variant="contained" color="primary" 
            //                 style={{width: "150px", fontSize: "20px", textTransform: "none"}} 
            //                 onClick={this.handleSearch}
            //                 disabled={this.state.searching}
            //                 >
            //                     {!this.state.searching ? "Ara" : <CircularProgress size={30} />}
            //                 </Button>
            //     </Box>
            // </Box>
        )
    }
}

class GroupSearchPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            groupNames : [],
            chatrooms : [],
            chatroomsToShow: []
        }
        this.getSearchResultsFromChild = this.getSearchResultsFromChild.bind(this)

    }

    getSearchResultsFromChild(chatroomsToShow) {
        this.setState({chatroomsToShow: chatroomsToShow})
    }

    render() {
        return (
            <div>
                <Box justifyContent='center'>
                    <Box mt={8} mb={2}>
                        <Typography variant="h4" color='textPrimary' style={{fontWeight: "bold"}}>Topluluk keşfet</Typography>
                    </Box>
                    <Box mb={3}>
                        <Typography variant="h6" color='textSecondary'>Her çeşitten istediğin toplulukları burada keşfet.</Typography>
                    </Box>
                    <Box>
                        <SearchBar execOnSearch={this.getSearchResultsFromChild} />
                    </Box>
                </Box>
                <Box mt={5} mb={5} overflow="auto">
                    {this.state.chatroomsToShow.length !== 0 ? <Divider /> : <div></div>}
                </Box>
                <Box display="flex" flexDirection="column" ml={2} mr={2}>
                    <List>
                        {this.state.chatroomsToShow.map(chatroom => {
                            return (
                                <SearchEntry chatroom={chatroom} />
                            )
                        })}  
                    </List>
                </Box>  
            </div>
        )
    }
}

export default GroupSearchPage