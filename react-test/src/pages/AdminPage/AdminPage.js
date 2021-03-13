import React from 'react';
import './AdminPage.css';
import { NavLink, Redirect } from 'react-router-dom';

class AdminPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {loading: true};
    }

    componentDidMount() {
        fetch('/api/users', {
            method: 'GET',
        })
        .then(response => response.json())
        .then(json => {
            this.setState({
                loading: false,
                data: json
            })
        });
    }

    handleDelete(e) {
        e.preventDefault();
        const username = e.target.id;
        fetch(`/api/users/${username}`, {
            method: 'DELETE',
        })
        .then(response => {
            window.location.reload()
        });
    }

    handleLogout(e) {
        e.preventDefault();
        sessionStorage.removeItem('token');
        window.location.reload();
    }

    renderList(userlist) {
        return (
            <ul>
                {userlist.map(item => (
                    <div className="user-block">
                        <li className="user-item" key={item._id}>
                            Kullanici: {item.username}
                        </li>
                        <button onClick={this.handleDelete} id={item.username} className="delete-user-button" type="submit">Kullaniciyi Sil</button>
                    </div>
                ))}
            </ul>
        )
    }
    
    render() {
        // Login needed first
        if (!this.props.getToken()) {
            return <Redirect to="/login" />
        }
    
        return (
            <div className="admin-container">
                <h1 className="admin-header">Kullanici Listesi:</h1>
                {this.state.loading ? "Wait" : this.renderList(this.state.data)}
                <div className="back-to-home-admin">
                    <p>Ana sayfaya donmek icin <NavLink to="/" className="back-to-home-button">buraya</NavLink> tikla!</p>
                </div>
                <div className="logout-admin">
                    <button className="logout-button-admin" onClick={this.handleLogout}>Cikis Yap</button>
                </div>
            </div>
        )
    }
}

export default AdminPage;