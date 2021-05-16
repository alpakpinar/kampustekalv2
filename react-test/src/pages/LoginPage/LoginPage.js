import React, { useState } from 'react'
import {Redirect, useHistory} from 'react-router-dom'
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
import Container from '@material-ui/core/Container'
import CircularProgress from '@material-ui/core/CircularProgress'

import { makeStyles } from '@material-ui/core/styles'

import { db, auth } from '../../services/firebase'
import firebase from 'firebase'

const useStyles = makeStyles((theme) => ({
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
)

export default function LoginPage(props) {
    const classes = useStyles()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loginStatus, setLoginStatus] = useState('')
    const [loginAttempt, setLoginAttempt] = useState(false)

    let history = useHistory()

    const currentUser = auth.currentUser
    // if (currentUser) {
        // return <Redirect to="/home" /> 
    // }

    async function handleSubmit(event) {
        event.preventDefault()
        setLoginAttempt(true)
        await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION)
            .then(() => {
                return auth.signInWithEmailAndPassword(email, password)
            })
            .catch((error) => {
                setLoginStatus('failed')
                setLoginAttempt(false)
            })
        setLoginStatus('success')
        // Redirect to the home page of the user upon successful login
        history.push('/home')

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
                <form className={classes.form} onSubmit={handleSubmit} noValidate>
                    {/* Display error message in case of failed login */}
                    {loginStatus !== 'failed' ? (
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="email"
                        label="E-posta"
                        name="email"
                        autoFocus
                        onChange={e => setEmail(e.target.value)}
                    /> ) : (
                        <TextField
                        error
                        variant="outlined"
                        helperText="E-posta veya şifre yanlış. Lütfen tekrar deneyin."
                        margin="normal"
                        fullWidth
                        id="email"
                        label="E-posta"
                        name="email"
                        autoFocus
                        onChange={e => setEmail(e.target.value)}
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
                        onChange={e => setPassword(e.target.value)}
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
                        {loginAttempt ? <CircularProgress color="inherit" size={30} /> : "Giriş Yap" }
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