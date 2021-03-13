import React from 'react'
import {Redirect} from 'react-router-dom'
import HomePageHeader from '../HomePage/components/HomePageHeader'

import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import { TextField } from '@material-ui/core'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import LockOutlinedIcon from '@material-ui/icons/LockOutlined'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import CircularProgress from '@material-ui/core/CircularProgress'

import { db } from '../../services/firebase'

const useStyles = (theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main
    },
    form: {
        width: "100%",
        marginTop: theme.spacing(1)
    },
    submit: {
        margin: theme.spacing(3,0,2),
        textTransform: "none",
        fontSize: "18px"
    },
})

class LoginPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            username: '',
            password: '',
            loginStatus: null,
            loginAttempt: false
        }

        this.handleSubmit = this.handleSubmit.bind(this)
    }

    setUsername(username) {
        this.setState({username: username})
    }

    setPassword(password) {
        this.setState({password: password})
    }

    saveTokenToLocalStorage(token) {
        /* To be used when user checks the "remember me" box */
        localStorage.setItem('token', JSON.stringify(token))
    }

    async loginUser(credentials) {
        return fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
            headers: {
                'Content-Type' : 'application/json'
            }
        })
        .then(response => response.json())
    }

    async handleSubmit(e) {
        e.preventDefault();
        this.setState({loginAttempt: true})

        ////////////////
        //// TEST //////
        ////////////////
        let validLogin = false
        await db.ref(`users/${this.state.username}`).once('value').then(snapshot => {
            if (snapshot.exists()) {
                const snapshotVal = snapshot.val()
                const username = snapshotVal.username
                const password = snapshotVal.password
                if ((username === this.state.username) && (password === this.state.password)) {
                    validLogin = true
                }
        }
    })

    if (!validLogin) {
        this.setState({loginStatus: 'failed'})
    }
    else {
        const userToken = {
            token: Math.random().toString(32).substring(7),
            username: this.state.username
        }
        this.props.setToken(userToken)
        // Reload the page with the token saved, so that we get redirected to the home page of the user
        window.location.reload()
    }
    this.setState({loginAttempt: false})


        ////////////////

    //     const response = await this.loginUser({
    //         username: this.state.username,
    //         password: this.state.password
    //     });
    //     if (response.message === 'logged-in') {
    //         const userToken = {
    //             token: response.token,
    //             username: response.username
    //         } 
    //         this.props.setToken(userToken)
    //         // If "remember me" box is checked, save the token into the local storage as well so that it will be kept there
    //         if (this.state.saveToLocalStorage) {
    //             this.saveTokenToLocalStorage(userToken)
    //         }

    //         // Reload page so that we get redirected
    //         window.location.reload()
    //     }
    //     else {
    //         this.setState({loginStatus: 'failed'});
    //     }
    //     this.setState({loginAttempt: false})
    }

    render() {
        const { classes } = this.props
        if (this.props.getToken()) {
            return <Redirect to="/home" />
        }
        return (
            <div>
                <HomePageHeader />
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <div className={classes.paper}>
                        <Avatar className={classes.avatar}>
                            <LockOutlinedIcon></LockOutlinedIcon>
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Giriş Yap
                        </Typography>
                    </div>
                    <form className={classes.form} onSubmit={this.handleSubmit} noValidate>
                        {/* Display error message in case of failed login */}
                        {this.state.loginStatus !== 'failed' ? (
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="username"
                            label="Kullanıcı Adı"
                            name="username"
                            autoFocus
                            onChange={e => this.setUsername(e.target.value)}
                        /> ) : (
                            <TextField
                            error
                            variant="outlined"
                            helperText="Kullanıcı adı veya şifre yanlış. Lütfen tekrar deneyin."
                            margin="normal"
                            fullWidth
                            id="username"
                            label="Kullanıcı Adı"
                            name="username"
                            autoFocus
                            onChange={e => this.setUsername(e.target.value)}
                        /> 

                        )}
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            name="password"
                            label="Şifre"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            onChange={e => this.setPassword(e.target.value)}
                        />
                        <FormControlLabel
                            control={<Checkbox value="remember" color="primary" />}
                            label="Beni hatırla"
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            {this.state.loginAttempt ? <CircularProgress color="inherit" size={30} /> : "Giriş Yap" }
                        </Button>
                        <Grid container>
                            <Grid item xs>
                            <Link href="#" variant="body2">
                                Şifreni mi unuttun?
                            </Link>
                            </Grid>
                            <Grid item>
                            <Link href="/register" variant="body2">
                                {"Hesabın yok mu? Kaydol"}
                            </Link>
                            </Grid>
                        </Grid>
                    </form>
                </Container>
            </div>
        )
    }
    
}

export default withStyles(useStyles)(LoginPage)