import React from 'react'
import './UsernameContainer.css'
import Avatar from '@material-ui/core/Avatar'

class UsernameContent extends React.Component {
    /* Username & name content located on the top left of the home page. */
    constructor(props) {
        super(props)
    }

    render() {
        const name = this.props.name ? this.props.name : ''
        return (
            <div className="username-flex-container">
                <div className="user-avatar-container">
                    <Avatar color="primary">{this.props.username[0].toUpperCase()}</Avatar>
                </div>
                <div className="username-container">
                    <h3 className="username-content blue">@{this.props.username}</h3>
                    <h3 className="username-content">{name}</h3>
                </div>
            </div>
        )
    }
}

export default UsernameContent