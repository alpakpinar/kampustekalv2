import React from 'react'

import './NewChatGroupDialog.css'

import Stepper from '@material-ui/core/Stepper'
import Step from '@material-ui/core/Step'
import StepLabel from '@material-ui/core/StepLabel'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'
import FormHelperText from '@material-ui/core/FormHelperText'

import Autocomplete from '@material-ui/lab/Autocomplete'

import Radio from '@material-ui/core/Radio'
import RadioGroup from '@material-ui/core/RadioGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'

import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Avatar from '@material-ui/core/Avatar'
import Divider from '@material-ui/core/Divider'
import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'

import LaptopChromebookIcon from '@material-ui/icons/LaptopChromebook'
import GroupIcon from '@material-ui/icons/Group'
import SportsSoccerIcon from '@material-ui/icons/SportsSoccer'
import EventIcon from '@material-ui/icons/Event'
import IconButton from '@material-ui/core/IconButton'
import CloseIcon from '@material-ui/icons/Close'
import AddIcon from '@material-ui/icons/Add'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CircularProgress from '@material-ui/core/CircularProgress'
import ChatIcon from '@material-ui/icons/Chat'

import { createNotification } from '../../../helpers/createNotification'

import { db } from '../../../services/firebase'
import firebase from 'firebase'

class RoomTheme extends React.Component {
    /* Re-usable room theme for different room types. */
    render() {
        return (
            <div>
                <ListItem>
                    <ListItemIcon>
                        {this.props.icon}
                    </ListItemIcon>
                    <ListItemText><strong>{this.props.label}:</strong> {this.props.desc}</ListItemText>
                </ListItem>
            </div>
        )
    }
}

class ContactTheme extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            added: false
        }
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick() {
        // Add (or remove) the contact in the parent component's state
        if (!this.state.added) {
            this.props.addContact(this.props.contact)
        }
        else {
            this.props.removeContact(this.props.contact)
        }
        // Set this component's state
        this.setState({
            added: !(this.state.added)
        })
    }

    render() {
        return (
            <div>
                <ListItem>
                    <ListItemIcon>
                        <Avatar>{this.props.contact[0].toUpperCase()}</Avatar>
                    </ListItemIcon>
                    <ListItemText>
                        {this.props.contact}
                    </ListItemText>
                    <IconButton onClick={this.handleClick}>
                        {this.state.added ? <CheckCircleIcon /> : <AddIcon />}
                    </IconButton>
                    <Divider />
                </ListItem>
            </div>
        )
    }
}

class RoomThemeStep extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeRadioButtonName: "Tematik",
            selectedTheme: null
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleClick = this.handleClick.bind(this)
    }

    handleClick(e) {
        if (this.props.groupType === e.currentTarget.value) {
            this.props.setGroupType(null)
        }
        else {
            this.props.setGroupType(e.currentTarget.value)
        }
        if (this.state.selectedTheme === e.currentTarget.value) {
            this.setState({selectedTheme: null})
        }
        else {
            this.setState({selectedTheme: e.currentTarget.value})
        }
    }

    handleChange(e) {
        this.setState({
            activeRadioButtonName: e.target.value
        })
        // Set the state of the parent component
        this.props.setGroupType(e.target.value)

        // If this is an enter keypress, move on to the next step
        // after setting the value
        if (e.charCode === 13) {
            this.props.handleNext()
        }
    }

    getRoomLabelElement(roomtheme) {
        const mapping = {
            "Kulüp" : {
                icon: <GroupIcon></GroupIcon>,
                label: "Kulüp",
                desc: "Kulüp organizasyonları için bir oda."
            },
            "Ders" : {
                icon: <LaptopChromebookIcon></LaptopChromebookIcon>,
                label: "Ders",
                desc: "Dersle ilgili paylaşımlar için bir oda."
            },
            "Spor" : {
                icon: <SportsSoccerIcon></SportsSoccerIcon>,
                label: "Spor",
                desc: "Spor ile ilgili muhabbetler için bir oda."
            },
            "Tematik" : {
                icon: <ChatIcon></ChatIcon>,
                label: "Tematik",
                desc: "Sosyal odalar."
            },
        }
        const theme = mapping[roomtheme]
        return <RoomTheme label={theme.label} icon={theme.icon} desc={theme.desc} />
    }

    render() {
        const buttonStyle = {textTransform: "none"}
        return (
            <div>
                <h2>Grubuna bir tema bulalım</h2>
                <p>Grubun için aşağıdaki hazır temalardan birini seçebilirsin:</p>
                <RadioGroup id="group-type-selection" aria-label="Grup tipi" value={this.state.activeRadioButtonName} onKeyPress={this.handleChange} onChange={this.handleChange}>
                    <FormControlLabel value="Tematik" control={<Radio />} label={this.getRoomLabelElement("Tematik")} />
                    <Box display="flex" width={1} mx="auto" mb={1} justifyContent="center">
                        <Box mx={2}>
                            <Button color="primary" variant={this.state.selectedTheme === 'Giybet' ? "contained" : "outlined"} value="Giybet" style={buttonStyle} onClick={this.handleClick}>
                                #Gıybet
                            </Button>
                        </Box>
                        <Box mx={2}>
                            <Button color="secondary" variant={this.state.selectedTheme === 'Ask' ? "contained" : "outlined"} value="Ask" style={buttonStyle} onClick={this.handleClick}>
                                #Aşk
                            </Button>
                        </Box>
                        <Box mx={2}>
                            <Button variant={this.state.selectedTheme === 'Spor' ? "contained" : "outlined"} value="Spor" style={buttonStyle} onClick={this.handleClick}>
                                #Spor
                            </Button>
                        </Box>
                    </Box>
                    <FormControlLabel value="Kulüp" control={<Radio />} label={this.getRoomLabelElement("Kulüp")} />
                    <FormControlLabel value="Ders" control={<Radio />} label={this.getRoomLabelElement("Ders")} />
                </RadioGroup>
                <br></br>
            </div>
        )
    }
}

class RoomNameStep extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            groupName: "",
            error: false
        }
        this.handleChange = this.handleChange.bind(this)
        this.handleSemester = this.handleSemester.bind(this)
    }

    handleChange(e) {
        this.setState({
            ...this.state,
            groupName: e.target.value
        })
        // Update the state of parent component
        this.props.setGroupName(e.target.value)
        // If this is an enter keypress, move on to the next step
        // after setting the value
        if (e.charCode === 13) {
            this.props.handleNext()
        }
    }

    handleSemester(e) {
        this.props.setClassSemester(e.target.value)
    }

    render() {
        return (
            <div style={{marginBottom: "20px"}}>
                <h2>Şimdi grubuna bir isim bulalım</h2>
                <p>Grubunun ismini aşağıya yazabilirsin:</p>
                <Grid container spacing={6}>
                    <Grid item>
                    {this.props.err ? <TextField 
                                            error
                                            helperText="Lütfen bir grup ismi girin."
                                            label="Grup ismi" 
                                            autoComplete="off" 
                                            id="group-name-text-field" 
                                            value={this.props.currentGroupname} 
                                            onChange={this.handleChange}
                                            onKeyPress={this.handleChange} /> : <TextField label="Grup ismi" 
                                                                                        autoComplete="off" 
                                                                                        id="group-name-text-field" 
                                                                                        value={this.props.currentGroupname} 
                                                                                        onChange={this.handleChange}
                                                                                        onKeyPress={this.handleChange} /> }
                        
                    </Grid>
                    {this.props.groupType === "Ders" ? (
                        <Grid item>
                            <Select value={this.props.classSemester} style={{marginTop: "18px", width: "150px"}} defaultValue="Fall-21" onChange={this.handleSemester}>
                                <MenuItem value={"Fall-21"}>Fall '21</MenuItem>
                                <MenuItem value={"Spring-22"}>Spring '22</MenuItem>
                            </Select>
                            <FormHelperText>Bu alan dersin hangi dönem için olduğunu belirtir.</FormHelperText>
                        </Grid>
                    ) : (
                        <div></div>
                    )}
                <br></br>
                </Grid>
                <br></br>
                {/* University field for student-club/class related rooms */}
                {["Ders", "Kulüp"].includes(this.props.groupType) ? (
                    <TextField label="Üniversite" helperText="Bu odaya sadece bu üniversiteden bağlantılar katılabilir." autoComplete="off" id="group-name-text-field" disabled value={this.props.universityOfUser} />
                ): (
                    <div></div>
                )}
                
            </div>
        )
    }
}

class ContactsStep extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            allContactsForSearch: [],
            usernamesToDisplay: this.props.contacts,
            addedContacts: []
        }
        this.addContact = this.addContact.bind(this)
        this.removeContact = this.removeContact.bind(this)
        this.handleSearch = this.handleSearch.bind(this)
    }

    componentDidMount() {
        // Fetch all users from the database
        db.ref('users').once('value', snapshot => {
            if (snapshot.exists()) {
                const data = snapshot.val()
                const usernames = Object.keys(data).filter(username => username !== this.props.currentUser)
                this.setState({allContactsForSearch: usernames})
            }
        })
    }

    handleSearch(e) {
        if (e.keyCode === 13) {
            const username = e.target.value
            let usernamesToDisplay = this.props.contacts
            // From the current list of "all contacts", find the ones matching to what we're looking for
            if (username.trim() !== '') {
                usernamesToDisplay = this.state.allContactsForSearch.filter(uname => uname === username)
                this.setState({usernamesToDisplay: usernamesToDisplay})
            }
        }
    }

    addContact(newContact) {
        let contacts = this.state.addedContacts
        contacts.push(newContact)
        this.setState({
            addedContacts: contacts
        })
        // Set contact list of the parent
        this.props.setContactList(contacts)
    }

    removeContact(contact) {
        let contacts = this.state.addedContacts
        // Find the index of the contact to be removed
        const indexToRemove = contacts.indexOf(contact)
        contacts.splice(indexToRemove)
        this.setState({
            addedContacts: contacts
        })
        // Set contact list of the parent
        this.props.setContactList(contacts)
    }

    render() {
        return (
            <div>
                <h2>Grubuna arkadaşlarını ekle</h2>
                <p>Grubuna aşağıdaki bağlantılarını seçerek ekleyebilirsin:</p>
                <Autocomplete 
                    id="contact-search"
                    popupIcon={null}
                    noOptionsText="Kullanıcı bulunamadı"
                    options={this.state.allContactsForSearch}
                    getOptionLabel={user => user}
                    autoComplete={true}
                    clearOnEscape={true}
                    renderInput={(params) => <TextField {...params} label="Kullanıcı ara" variant="outlined" />}
                    onKeyDown={this.handleSearch}
                />
                {/* TODO: Probably want some sort of scroll / max height here */}
                <List onKeyPress={this.props.handleNext}>
                    {this.state.usernamesToDisplay.map(contact => {
                        return (
                            <ContactTheme contact={contact} addContact={this.addContact} removeContact={this.removeContact} />
                        )
                    })}
                </List>
            </div>
        )
    }
}

class LoadingStep extends React.Component {
    render() {
        return (
            <Box>
                <Typography variant="h6">Grubun oluşturuluyor...</Typography>
                <CircularProgress style={{margin: "20px 0"}} />
            </Box>
        )
    }
}

class NewChatGroupFormStepper extends React.Component {
    getStepContent(step) {
        switch(step) {
            case 0:
                return <RoomThemeStep 
                        groupType={this.props.groupType}
                        setGroupType={this.props.setGroupType} 
                        handleNext={this.props.handleNext} 
                        />
            case 1:
                return <RoomNameStep setGroupName={this.props.setGroupName}
                                     setClassSemester={this.props.setClassSemester} 
                                     classSemester={this.props.classSemester}
                                     universityOfUser={this.props.universityOfUser}
                                     currentGroupname={this.props.groupName}
                                     err={this.props.err === 1} 
                                     handleNext={this.props.handleNext}
                                     groupType={this.props.groupType}
                                     />
            case 2:
                return <ContactsStep currentUser={this.props.currentUser}
                                     contacts={this.props.contacts} 
                                     setContactList={this.props.setContactList} 
                                     handleNext={this.props.handleNext} />
            case 3:
                return <LoadingStep />
        }
    }

    render() {
        return (
            <div>
                <Stepper activeStep={this.props.activeStep}>
                    {this.props.steps.map((label, index) => {
                        return (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        )
                    })}
                </Stepper>
                <div>
                    <Typography>{this.getStepContent(this.props.activeStep)}</Typography>
                </div>
            </div>
        ) 
    }
}

class NewChatGroupDialog extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            activeStep: 0,
            err: -1,
            groupType: "Kulüp",
            groupName: "",
            contacts: [],
            universityOfUser: this.props.universityOfUser, // Relevant for class/student club related rooms
            classSemester: '', // Relevant for class related rooms
            submitted: false
        }
        
        // Form steps
        this.steps = [
            'Grup temasını seç',
            'Gruba bir isim ver',
            'Bağlantılarını gruba ekle'
        ]

        this.handleClose = this.handleClose.bind(this)
        this.handleNext = this.handleNext.bind(this)
        this.handleBack = this.handleBack.bind(this)
        this.handleSubmit = this.handleSubmit.bind(this)

        this.setGroupType = this.setGroupType.bind(this)
        this.setGroupName = this.setGroupName.bind(this)
        this.setContactList = this.setContactList.bind(this)
        this.setClassSemester = this.setClassSemester.bind(this)
    }

    handleClose() {
        this.props.handleCloseDialog('newChatGroup')
    }

    handleBack() {
        this.setState({
            activeStep: this.state.activeStep - 1
        })
    }

    async handleNext() {
        // Check if we're at the last step
        if (this.state.activeStep === 2) {
            // We're submitting the form
            this.setState({
                submitted: true
            })
            await this.handleSubmit()
            return
        }
        // If not, proceed depending on the step we're currently in
        // For group name step, check that it is non-empty
        if (this.state.activeStep === 1) {
            const validData = this.state.groupName.trim() !== ''
            if (!validData) {
                // Set error on index 1
                this.setState({
                    ...this.state,
                    err: 1
                })
                return
            }
        }
        // In this step, check that a group type is actually selected
        if (this.state.activeStep === 0) {
            if (!this.state.groupType) {
                this.setState({err: 0})
                return
            }
        }
        this.setState({
            ...this.state,
            activeStep: this.state.activeStep + 1
        })
    }

    async handleSubmit() {
        /* Handle form submission. */
        const roomData = {
            name: this.state.groupName,
            type: this.state.groupType,
            creationTime: firebase.database.ServerValue.TIMESTAMP,
            latestMsgTime: firebase.database.ServerValue.TIMESTAMP,
        }

        if (this.state.groupType === 'Ders') {
            roomData['university'] = this.state.universityOfUser
            roomData['semester'] = this.state.classSemester
        }

        roomData['typingIndicator'] = {}

        // Add the current user to the members of this group
        let contacts = this.state.contacts
        contacts.push(this.props.username)

        for (let idx=0; idx < contacts.length; idx++) {
            roomData['typingIndicator'][ contacts[idx] ] = false
        }

        await db.ref(`rooms/${this.state.groupName}`).set(roomData)

        let memberUpdate = {}

        for (let idx=0; idx < contacts.length; idx++) {
            await db.ref(`users/${contacts[idx]}/chats/${this.state.groupName}`).set(true)

            memberUpdate[ contacts[idx] ] = true
        }
        
        await db.ref(`members/${this.state.groupName}`).set(memberUpdate)

        // Close the dialog once the group is formed
        this.setState({submitted: false})
        this.handleClose()

        // Update chats list
        this.props.reloadFunc()

        const notificationMsg = `${this.state.groupName} grubu oluşturuldu!`
        createNotification(notificationMsg)
    }

    setGroupType(dataFromChild) {
        this.setState({
            ...this.state,
            groupType: dataFromChild
        })
    }

    setGroupName(dataFromChild) {
        if (this.state.err !== 1) {
            this.setState({
                ...this.state,
                groupName: dataFromChild
            })
        }
        // A bit tricky... If we have an existing warning in the input 
        // text field and user fills it, remove the warning.
        else {
            if ((this.state.err === 1) && (dataFromChild !== "")) {
                this.setState({
                    ...this.state,
                    err: -1,
                    groupName: dataFromChild
                })
            }
        }
    }

    setContactList(dataFromChild) {
        this.setState({
            ...this.state,
            contacts: dataFromChild
        })
    }

    setClassSemester(dataFromChild) {
        this.setState({classSemester: dataFromChild})
    }

    render() {
        return (
            <div>
                <Dialog open={this.props.show} onClose={this.handleClose}>
                    <DialogTitle id="form-dialog-title">Yeni Grup Oluştur</DialogTitle>
                    <DialogContent>
                        <NewChatGroupFormStepper
                                currentUser={this.props.username} 
                                universityOfUser={this.props.universityOfUser} 
                                contacts={this.props.contacts} 
                                groupName={this.state.groupName}
                                setContactList={this.setContactList}
                                setGroupName={this.setGroupName}
                                setGroupType={this.setGroupType}
                                setClassSemester={this.setClassSemester}
                                classSemester={this.state.classSemester}
                                groupType={this.state.groupType}
                                activeStep={this.state.activeStep}
                                steps={this.steps}
                                err={this.state.err}
                                handleNext={this.handleNext}
                                />
                    </DialogContent>
                    <DialogActions>
                        {this.state.activeStep !== 3 ? (
                            <Box>
                                <Button id="stepper-button" disabled={this.state.activeStep === 0} onClick={this.handleBack}>Geri</Button>
                                <Button id="stepper-button" variant="contained" color="primary" onClick={this.handleNext}>
                                    {this.state.activeStep === this.steps.length - 1 ? "Grup Oluştur" : "İleri"}
                                </Button>
                            </Box>
                        ) : (
                            <Box></Box>
                        )}
                    </DialogActions>
                    <IconButton onClick={this.handleClose} id="new-group-form-dialog-close-button">
                        <CloseIcon></CloseIcon>
                    </IconButton>
                </Dialog>
            </div>
        )
    }
}

export default NewChatGroupDialog