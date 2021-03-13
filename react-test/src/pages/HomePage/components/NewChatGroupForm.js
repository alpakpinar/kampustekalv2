import React from 'react';
import './NewChatGroupForm.css';
import $ from 'jquery';

class NewChatGroupForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            groupName: null,
            groupType: null,
            contacts: [this.props.username]
        };
        this.setGroupName = this.setGroupName.bind(this);
        this.setGroupType = this.setGroupType.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addOrRemoveContact = this.addOrRemoveContact.bind(this);
    }

    setGroupName(groupName) {
        this.setState({groupName: groupName});
    }

    setGroupType(e, groupType) {
        /*
        On the event where one of the group-type checkboxes are selected or removed,
        update the group type state. If one box is checked, uncheck the other ones.
        */
        if (e.target.checked) {
            this.setState({groupType: groupType});
            // Uncheck the other boxes if they are also checked
            const allboxes = $('input.group-type-checkbox')
            for (let idx=0; idx < allboxes.length; idx++) {
                if (allboxes[idx] !== e.target) {
                    allboxes[idx].checked = false
                }
            }
        }
        else {
            this.setState({groupType: null});
        }
    }

    addOrRemoveContact(e) {
        /* 
        On the event where one of the contact checkboxes are selected or removed,
        update the contact list accordgingly.
        */
        const username = e.target.id
        // Contacts as of now
        const contacts = this.state.contacts
        if (e.target.checked) {
            contacts.push(username)
        }
        else {
            const index = contacts.indexOf(username)
            contacts.splice(index, 1)
        }

        // Finally, update the state
        this.setState({ contacts: contacts })
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const request_body = {
            chatRoomName: this.state.groupName,
            chatRoomType: this.state.groupType,
            chatRoomId: this.props.newRoomId,
            contacts: this.state.contacts
        }

        fetch('/api/chatrooms', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify(request_body)
        })
        .then(response => response.json())
        .then(jsonResponse => {
            window.location.reload();
        });
    }

    render() {
        return (
            <div>
                <div className="form-header">
                    <h1>Merhaba!</h1>
                    <h2 style={{fontWeight: "normal"}}>Asagidaki formu doldurarak yeni bir konusma grubu olusturabilirsin.</h2>
                </div>
                <div className="new-group-form-div">
                    <form className="new-group-form" onSubmit={this.handleSubmit}>
                        <h2 style={{fontWeight: "normal"}}>Grup Ismi:</h2>
                        <input type="text"
                        placeholder="Grup Ismi"
                        name="groupname"
                        onChange={e => this.setGroupName(e.target.value)}
                        required
                        ></input>

                        <div className="group-type-checkbox">
                            <h2 style={{fontWeight: "normal"}}>Grup Tipi:</h2>
                            <div className="group-type-checkbox-item">
                                <input type="checkbox" className="group-type-checkbox form-checkbox" id="kulup" onChange={e => this.setGroupType(e, e.target.id)}></input>
                                <label># Kulup</label>
                            </div>
                            <div className="group-type-checkbox-item">
                                <input type="checkbox" className="group-type-checkbox form-checkbox" id="lecture" onChange={e => this.setGroupType(e, e.target.id)}></input>
                                <label># Ders</label>
                            </div>
                            <div className="group-type-checkbox-item">
                                <input type="checkbox" className="group-type-checkbox form-checkbox" id="abroad" onChange={e => this.setGroupType(e, e.target.id)}></input>
                                <label># Yurtdisi</label>
                            </div>
                            <div className="group-type-checkbox-item">
                                <input type="checkbox" className="group-type-checkbox form-checkbox" id="social" onChange={e => this.setGroupType(e, e.target.id)}></input>
                                <label># Sosyaliz</label>
                            </div>
                        </div>

                        <div className="contacts-checkbox">
                            <h2 style={{fontWeight: "normal"}}>Baglantilar:</h2>
                            {this.props.contacts.map(contact => (
                                <div className="contact-checkbox-item">
                                    <input type="checkbox" className="form-checkbox" id={contact.username} onChange={e => this.addOrRemoveContact(e)}></input>
                                    <label>{contact.username}</label>
                                </div>

                            ))}
                        </div>

                        <button className="new-group-form-submit-button" type="submit">Grup Olustur!</button>
                    </form>
                </div>
            </div>
        );
    }
}

export default NewChatGroupForm;