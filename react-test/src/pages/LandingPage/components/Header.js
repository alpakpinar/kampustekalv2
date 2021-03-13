import React from 'react'
import './Header.css'
import {NavLink} from 'react-router-dom'

import Button from '@material-ui/core/Button'

const button_styles = {
    "textTransform": "none",
    "border" : "none",
    "fontSize" : "20px",
    "margin" : "5px 25px",
}

class Header extends React.Component {
    render() {
        return (
            <div id="header">
                <h1 className="greeting">Merhaba!</h1>
                <p className="greeting">Kampüste Kal ile üniversitene her zaman ve her yerde bağlı kal!</p>
                <div className="register-login-button-container">
                    <NavLink className="home-nav-item" to="/register">
                        <Button variant="contained" color="inherit" style={{...button_styles, "color": "black"}}>
                            Kaydol
                        </Button>
                    </NavLink>
                    <NavLink className="home-nav-item" to="/login">
                        <Button variant="contained" color="primary" style={{...button_styles, "color": "white"}}>
                            Giriş Yap
                        </Button>
                    </NavLink>
                </div>
                <h3 id="hidden">Hidden</h3>
            </div>
        );
    }
}

export default Header;