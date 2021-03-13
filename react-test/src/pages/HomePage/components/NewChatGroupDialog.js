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

import { db } from '../../../services/firebase'

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
        const newContact = this.props.contact
        const contactData = {
            username: newContact.username,
            _id: newContact._id
        }
        // Add (or remove) the contact in the parent component's state
        if (!this.state.added) {
            this.props.addContact(contactData)
        }
        else {
            this.props.removeContact(contactData)
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
                        <Avatar>{this.props.contact.username[0].toUpperCase()}</Avatar>
                    </ListItemIcon>
                    <ListItemText>
                        {this.props.contact.username}
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
            activeRadioButtonName: "Kulüp"
        }
        this.handleChange = this.handleChange.bind(this)
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
            "Gündem" : {
                icon: <EventIcon></EventIcon>,
                label: "Gündem",
                desc: "En yeni gelişmelerin tartışıldığı oda."
            },
        }
        const theme = mapping[roomtheme]
        return <RoomTheme label={theme.label} icon={theme.icon} desc={theme.desc} />
    }

    render() {
        return (
            <div>
                <h2>Grubuna bir tema bulalım</h2>
                <p>Grubun için aşağıdaki hazır temalardan birini seçebilirsin:</p>
                <RadioGroup id="group-type-selection" aria-label="Grup tipi" value={this.state.activeRadioButtonName} onKeyPress={this.handleChange} onChange={this.handleChange}>
                    <FormControlLabel value="Kulüp" control={<Radio />} label={this.getRoomLabelElement("Kulüp")} />
                    <FormControlLabel value="Ders" control={<Radio />} label={this.getRoomLabelElement("Ders")} />
                    <h3>Sosyal gruplar</h3>
                    <FormControlLabel value="Spor" control={<Radio />} label={this.getRoomLabelElement("Spor")}/> 
                    <FormControlLabel value="Gündem" control={<Radio />} label={this.getRoomLabelElement("Gündem")}/> 
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
            addedContacts: []
        }
        this.addContact = this.addContact.bind(this)
        this.removeContact = this.removeContact.bind(this)
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
                <List onKeyPress={this.props.handleNext}>
                    {this.props.contacts.map(contact => {
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
                return <RoomThemeStep setGroupType={this.props.setGroupType} handleNext={this.props.handleNext} />
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
                return <ContactsStep contacts={this.props.contacts} 
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
            show: this.props.show,
            groupType: "Kulüp",
            groupName: "",
            contacts: [this.props.username],
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
        this.setState({
            show: false
        })
        this.props.setActiveTab('')
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
        this.setState({
            ...this.state,
            activeStep: this.state.activeStep + 1
        })
    }

    async handleSubmit() {
        /* Handle form submission. */
        const roomData = {
            type: this.state.groupType,
        }

        if (this.state.groupType === 'Ders') {
            roomData['university'] = this.state.universityOfUser
            roomData['semester'] = this.state.classSemester
        }

        roomData['typingIndicator'] = {}

        for (let idx=0; idx < this.state.contacts.length; idx++) {
            roomData['typingIndicator'][ this.state.contacts[idx] ] = false
        }

        await db.ref(`rooms/${this.state.groupName}`).set(roomData)

        for (let idx=0; idx < this.state.contacts.length; idx++) {
            await db.ref(`users/${this.state.contacts[idx]}/chats`).push().set({
                name: this.state.groupName
            })
        }

        // Close the dialog once the group is formed
        this.setState({submitted: false})
        this.handleClose()

        // Not a great solution, but simply reload the page for now so that the new chat room appears
        window.location.reload()
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
                <Dialog open={this.state.show} onClose={this.handleClose}>
                    <DialogTitle id="form-dialog-title">Yeni Grup Oluştur</DialogTitle>
                    <DialogContent>
                        <NewChatGroupFormStepper 
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