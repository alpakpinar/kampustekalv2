import React from 'react'

import CircularProgress from '@material-ui/core/CircularProgress'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'

import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'

class LoadingPage extends React.Component {
    render() {
        return (
            <Box style={{width: "100%", border:"3px solid black"}}>
                <Box margin="auto" justifyContent="center" width={0.4} style={{border: "3px solid red"}}>
                    <CircularProgress size={80} />
                </Box>
            </Box>
        )
    }
}

export default LoadingPage