import React from 'react'

import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

class UserContextMenu extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        return (
            <div>
                <Menu
                    anchorEl={this.props.anchorEl}
                    keepMounted
                    open={Boolean(this.props.anchorEl)}
                    onClose={this.props.handleClose}
                >
                    <MenuItem onClick={this.props.onClickToMenuItem}>Arkadaşlıktan Çıkar</MenuItem>
                </Menu>
            </div>
        )
    }
}

export default UserContextMenu