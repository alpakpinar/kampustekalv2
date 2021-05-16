import React from 'react'

import { withStyles } from '@material-ui/core/styles'
import Avatar from '@material-ui/core/Avatar'
import Button from '@material-ui/core/Button'
import CssBaseline from '@material-ui/core/CssBaseline'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import Link from '@material-ui/core/Link'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Snackbar from '@material-ui/core/Snackbar'
import CircularProgress from '@material-ui/core/CircularProgress'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import InputLabel from '@material-ui/core/InputLabel'

import Autocomplete from '@material-ui/lab/Autocomplete'
import MuiAlert from '@material-ui/lab/Alert'

import LockOutlinedIcon from '@material-ui/icons/LockOutlined'

import HomePageHeader from '../HomePage/components/HomePageHeader'

import { db, auth } from '../../services/firebase'
import { FormControl } from '@material-ui/core'

// Object to convert the e-mail extension to university name
// Using this mapping, we'll automatically fill the "university name" field
const EXTENSION_TO_UNIVERSITY = {
    '@boun.edu.tr' : 'Boğaziçi Üniversitesi',
    '@ku.edu.tr' : 'Koç Üniversitesi',
    '@bilgi.edu.tr' : 'Bilgi Üniversitesi',
}

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

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

function CustomSelect(props) {
    return (
        <Grid item xs={12}>
            <FormControl fullWidth={true} variant="outlined">
                <InputLabel>Cinsiyet</InputLabel>
                <Select
                    value={props.gender}
                    onChange={props.onChange}
                    // autoWidth={true}
                >
                    <MenuItem value={"Erkek"}>Erkek</MenuItem>
                    <MenuItem value={"Kadin"}>Kadın</MenuItem>
                    <MenuItem value={"Bos"}>Söylemek istemiyorum</MenuItem>
                </Select>
            </FormControl>
        </Grid>
    )
}

function CustomTextField(props) {
    /* (Slightly) customized text field component for reusability. */
    // Warning messages we'll use for errors
    const helperTexts = {
        "firstName": "Bu alan zorunludur.",
        "lastName": "Bu alan zorunludur.",
        "username": "Bu alan zorunludur.",
        "email": "Lütfen geçerli bir e-mail adresi girin.",
        "password": "Şifre en az 6 karakterden oluşmalıdır.",
    }

    // Regular view
    if (!props.error) {
        return (
            <Grid item xs={12} sm={props.small ? 6 : undefined}>
                <TextField
                    variant="outlined"
                    fullWidth
                    id={props.id}
                    label={props.label}
                    name={props.name}
                    type={props.password ? "password" : undefined}
                    autoComplete={props.autoComplete}
                    onChange={e => props.onChange(e.target.value)}
                />
            </Grid>
            )
    }
    // Error view
    else {
        return (
            <Grid item xs={12} sm={props.small ? 6 : undefined}>
                <TextField
                    error
                    helperText={helperTexts[props.name]}
                    variant="outlined"
                    fullWidth
                    id={props.id}
                    label={props.label}
                    name={props.name}
                    type={props.password ? "password" : undefined}
                    autoComplete={props.autoComplete}
                    onChange={e => props.onChange(e.target.value)}
                />
            </Grid>
        )
    }
}

function CustomAutocomplete(props) {
    /* University input field. */
    if (!props.error) {
        return (
            <Grid item xs={12}>
                <Autocomplete 
                    options={props.universities}
                    renderInput={(params) => <TextField {...params} variant="outlined" label="Üniversite" />}
                    onChange={(event,university) => props.setUniversity(university)}
                    value={props.value}
                />
            </Grid>
        )
    }
    else {
        return (
            <Grid item xs={12}>
                <Autocomplete
                    options={props.universities}
                    renderInput={(params) => <TextField error helperText="Lütfen bir üniversite seçin." {...params} variant="outlined" label="Üniversite" />}
                    onChange={(event,university) => props.setUniversity(university)}
                    value={props.value}
                />
            </Grid>
        )
    }
}

const useStyles = (theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
    textTransform: "none",
    fontSize: "18px"
  },
})

class RegisterPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            name: '', 
            surname: '', 
            username: '', 
            email: '', 
            university: '',
            gender: '',
            formControl: false, // Checkbox at the end 
            errors: {
                'name' : false,
                'surname' : false,
                'email' : false,
                'password' : false,
                'username' : false,
                'university' : false,
                'formControl' : false,
            },
            statusMessage: '',
            statusSeverity: null,
            snackbarOpen: false,
            submissionInProgress: false
        }

        this.universities = ['Boğaziçi Üniversitesi', 'Koç Üniversitesi', 'Bilgi Üniversitesi']

        // Bind functions to component
        this.checkRemoveError = this.checkRemoveError.bind(this)

        this.closeSnackbar = this.closeSnackbar.bind(this)

        this.onSubmit = this.onSubmit.bind(this)
        this.setName = this.setName.bind(this)
        this.setSurname = this.setSurname.bind(this)
        this.setEmail = this.setEmail.bind(this)
        this.setUsername = this.setUsername.bind(this)
        this.setPassword = this.setPassword.bind(this)
        this.setUniversity = this.setUniversity.bind(this)
        this.setGender = this.setGender.bind(this)

        this.fillUniversityFieldBasedOnEmail = this.fillUniversityFieldBasedOnEmail.bind(this)

        this.validateName = this.validateName.bind(this)
        this.validateSurname = this.validateSurname.bind(this)
        this.validateUsername = this.validateUsername.bind(this)
        this.validatePassword = this.validatePassword.bind(this)
        this.validateEmail = this.validateEmail.bind(this)
        this.validateUniversity = this.validateUniversity.bind(this)
        this.validateFormControl = this.validateFormControl.bind(this)
        this.validateInputs = this.validateInputs.bind(this)
    }

    closeSnackbar() {
        this.setState({snackbarOpen: false})
    }

    checkRemoveError(field, nowValid) {
        if (this.state.errors[field] && nowValid) {
            const currentErrors = this.state.errors
            currentErrors[field] = false
            this.setState({errors: currentErrors})
        }
    }

    // ======================
    // Setter functions
    // ======================
    setName(val) {
        this.setState({name: val})
        this.checkRemoveError("name", val !== '')
    }
    setSurname(val) {
        this.setState({surname: val})
        this.checkRemoveError("surname", val !== '')
    }
    setEmail(val) {
        this.setState({email: val})
        const nowValid = val.endsWith('edu.tr') && val.includes('@')
        this.checkRemoveError("email", nowValid)

        // Automatically fill the university field, using info from the e-mail
        if (val.endsWith('.edu.tr') || val.trim() === '') {
            this.fillUniversityFieldBasedOnEmail(val)
        }

    }
    setUsername(val) {
        this.setState({username: val})
        this.checkRemoveError("username", val !== '')
    }
    setPassword(val) {
        this.setState({password: val})
        const nowValid = val.length >= 6
        this.checkRemoveError("password", nowValid)
    }
    setUniversity(val) {
        this.setState({university: val})
        const nowValid = this.universities.includes(val)
        this.checkRemoveError("university", nowValid)
    }
    setGender(event) {
        this.setState({gender: event.target.value})
    }

    fillUniversityFieldBasedOnEmail(userEmail) {
        // When the e-mail input is set, automatically fill the university field.
        if (userEmail.trim() === '') {
            return this.setState({university: ''})
        }
        const mailRegex = /@\w+.edu.tr/g

        try {
            const emailExtension = userEmail.match(mailRegex)[0]
            this.setState({university: EXTENSION_TO_UNIVERSITY[emailExtension]})
        } catch (error) {
            // Need to configure this, for now do nothing
            return
        }
    }

    // ======================
    // Input validator functions
    // ======================
    validateName() {
        const valid = this.state.name.trim() !== ''
        if (!valid) {
            this.setState({errors: {...this.state.errors, 'name' : true}})
        }
        return valid
    }
    validateSurname() {
        const valid = this.state.surname.trim() !== ''
        if (!valid) {
            this.setState({errors: {...this.state.errors, 'surname' : true}})
        }
        return valid
    }
    validateUsername() {
        const valid = this.state.username.trim() !== ''
        if (!valid) {
            this.setState({errors: {...this.state.errors, 'username' : true}})
        }
        return valid
    }
    validateEmail() {
        // Valid e-mail format: Ends with .edu.tr
        // const valid = this.state.email ? this.state.email.endsWith('edu.tr') && this.state.email.includes('@') : false
        const valid = this.state.email ? this.state.email.includes('@') : false
        if (!valid) {
            this.setState({errors: {...this.state.errors, 'email' : true}})
        }
        return valid
    }
    validatePassword() {
        const valid = this.state.password ? this.state.password.length >= 6 : false
        if (!valid) {
            this.setState({errors: {...this.state.errors, 'password': true}})
        }
        return valid
    }
    validateUniversity() {
        const valid = this.universities.includes(this.state.university)
        if (!valid) {
            this.setState({errors: {...this.state.errors, 'university': true}})
        }
        return valid
    }

    validateFormControl() {
        const valid = this.state.formControl
        if (!valid) {
            this.setState({errors: {...this.state.errors, 'formControl' : true}})
        }
        return valid
    }

    validateInputs(funcs) {
        /* Validate all inputs before proceeding to submission. */
        for (let idx=0; idx < funcs.length; idx++) {
            let fieldIsValid = funcs[idx]()
            if (!fieldIsValid) {
                // If one of the fields is invalid, do not continue to the rest
                return false
            }
        }
        return true
    }

    async onSubmit(e) {
        e.preventDefault()
        
        // Validate input data
        const validationFuncs = [
            this.validateName,
            this.validateSurname,
            this.validateEmail,
            this.validateUsername,
            this.validatePassword,
            this.validateUniversity,
            this.validateFormControl,
        ]

        const allFieldsValid = this.validateInputs(validationFuncs)
        // If all fields are not valid, do not proceed to submission
        if (!allFieldsValid) {
            return
        }

        // Submission
        this.setState({submissionInProgress: true})

        // State update once the submission is done
        const stateUpdate = {snackbarOpen: true, submissionInProgress: false}

        // First, check if a username already exists (can be optimized later)
        let validusername = true
        await db.ref('users').get().then(snapshot => {
            snapshot.forEach(data => {
                if (data.val()['username'] === this.state.username) {
                    let statusMessage = `Maalesef ${this.state.username} alınmış, başka bir kullanıcı ismi dene!`    
                    this.setState({statusMessage: statusMessage, statusSeverity: "warning", ...stateUpdate})
                    validusername = false
                }
            })
        })

        if (!validusername) {
            return
        }

        let userId = null

        await auth.createUserWithEmailAndPassword(this.state.email, this.state.password).then(userCredential => {
            const user = userCredential.user
            userId = user.uid
            // Update the user data with username
            user.updateProfile({
                displayName: this.state.username,
            })
        })
        .catch(error => {
            return this.setState({statusMessage: error.message, statusSeverity: "error"})
        })
        
        // Separately, record the user data in firebase database
        await db.ref(`users/${this.state.username}`).set({
            name: `${this.state.name} ${this.state.surname}`,
            username: this.state.username,
            university: this.state.university,
            gender: this.state.gender,
            uid: userId,
        }, (error) => {
            if (error) {
                this.setState({statusMessage: error.message, statusSeverity: "error", ...stateUpdate})
            }
            else {
                let statusMessage = `Hesabın oluşturuldu ${this.state.username}! Giriş yapmak için buraya tıkla.`
                this.setState({statusMessage: statusMessage, statusSeverity: "success", ...stateUpdate})
            }
        })
    }

    render() {
        const { classes } = this.props
        return (
            <div>
                <HomePageHeader />
                <Container component="main" maxWidth="xs">
                    <CssBaseline />
                    <div className={classes.paper}>
                        <Avatar className={classes.avatar}>
                            <LockOutlinedIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Kaydol
                        </Typography>
                        <form className={classes.form} noValidate onSubmit={this.onSubmit}>
                        <Grid container spacing={2}>
                            <CustomTextField error={this.state.errors.name} small id="firstName" label="İsim" name="firstName" onChange={this.setName} />
                            <CustomTextField error={this.state.errors.surname} small id="lastName" label="Soyisim" name="lastName" onChange={this.setSurname} />
                            <CustomTextField error={this.state.errors.email} id="email" label="xxx@xxx.edu.tr" name="email" autoComplete="email" onChange={this.setEmail} />
                            {/* <CustomAutocomplete 
                                    value={this.state.university}
                                    error={this.state.errors.university} 
                                    universities={this.universities} 
                                    setUniversity={this.setUniversity} /> */}
                            
                            <Grid item xs={12}>
                                <TextField 
                                    label="Üniversite"
                                    value={this.state.university}
                                    disabled={true}
                                    placeholder="Üniversite"
                                    variant="outlined"
                                    fullWidth
                                />
                            </Grid>

                            <CustomTextField error={this.state.errors.username} id="username" label="Kullanıcı adı" name="username" autoComplete="username" onChange={this.setUsername} />
                            <CustomTextField error={this.state.errors.password} password id="password" label="Şifre" name="password" autoComplete="current-password" onChange={this.setPassword} />
                            
                            <CustomSelect gender={this.state.gender} onChange={this.setGender} />
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={<Checkbox required color="primary" />}
                                    label="Kullanıcı sözleşmesini okudum ve kabul ediyorum."
                                    onChange={e => this.setState({...this.state, formControl: !(this.state.formControl)})}
                                />
                                {this.state.errors.formControl ? <Typography style={{color: "red"}}>{"Lütfen bu alanı işaretleyin."}</Typography> : <div></div>}
                            </Grid>
                        </Grid>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                        >
                            {this.state.submissionInProgress ? <CircularProgress color="inherit" size={30} /> : "Kaydol"}
                        </Button>
                        <Grid container justify="flex-end">
                            <Grid item>
                            <Link href="/login" variant="body2">
                                Zaten bir hesabın var mı? Giriş yap
                            </Link>
                            </Grid>
                        </Grid>
                        </form>
                    </div>
                    <Box mt={5}>
                        <Copyright />
                    </Box>
                    <CustomSnackbar show={this.state.snackbarOpen} 
                                    message={this.state.statusMessage} 
                                    severity={this.state.statusSeverity} 
                                    closeSnackbar={this.closeSnackbar} 
                                    />
                </Container>
            </div>
            
          );
    }
}

export default withStyles(useStyles, { withTheme: true })(RegisterPage)