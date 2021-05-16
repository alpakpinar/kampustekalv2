import React from 'react'

import Snackbar from '@material-ui/core/Snackbar'
import MuiAlert from '@material-ui/lab/Alert'

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />
}

function CustomSnackbar(props) {
    /* Snackbar component to use for sign in feedback to the user. */
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return
        }
        props.closeSnackbar()
    }

    return (
        <Snackbar open={props.show} autoHideDuration={10000} onClose={handleClose}>
            <Alert severity={props.severity} onClose={handleClose}>
                {props.message}
            </Alert>
        </Snackbar>
    )
}

class FriendAdditionSnackbar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            snackbarOpen: true,
        }
        this.closeSnackbar = this.closeSnackbar.bind(this)
    }

    closeSnackbar() {
        this.setState({snackbarOpen: false})        
    }

    render() {
        return (
            <div>
                <CustomSnackbar 
                    show={this.state.snackbarOpen} 
                    message={this.props.statusMessage} 
                    severity="success" 
                    closeSnackbar={this.closeSnackbar} 
                />
            </div>
        )
    }
}

export default FriendAdditionSnackbar