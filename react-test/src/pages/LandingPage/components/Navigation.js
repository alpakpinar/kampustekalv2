import React from 'react'
import './Navigation.css'
import {NavLink} from 'react-router-dom'

class Navigation extends React.Component {
  constructor(props) {
    super(props)
    this.displayLogout = this.displayLogout.bind(this)
  }
  
  displayLogout() {
    /* Depending on the "displayLogoutButton" prop being given by the parent, display or hide the logout button. */
    if (this.props.displayLogoutButton) {
      return (
        <div className="logout-button-container">
        <button type="submit" className="logout-button" onClick={this.props.handleLogout}>Çıkış Yap</button>
        </div>
      )
    }
    else {
      return <></>
    }
  }
  render() {
    return (
      <div id="navigation">
        <nav>
          <ul className="nav-items">
            <li className="nav-link"><NavLink className="nav-item" to="/">#KampüsteKal</NavLink></li>
            <li className="nav-link"><NavLink className="nav-item" to="/">Blog</NavLink></li>
            <li className="nav-link"><NavLink className="nav-item" to="/">İletişim</NavLink></li>
          </ul>
        </nav>
        {this.displayLogout()}
      </div>
    )
  }
}

export default Navigation;