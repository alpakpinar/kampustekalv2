import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import LoginPage from './pages/LoginPage/LoginPage';
import AdminPage from './pages/AdminPage/AdminPage';
import HomePage from './pages/HomePage/HomePage';
import LandingPage from './pages/LandingPage/LandingPage';

import { auth } from './services/firebase'

class Main extends React.Component {
  constructor(props) {
    super(props);
    this.setToken = this.setToken.bind(this);
    this.getToken = this.getToken.bind(this);
  }

  setToken(token) {
    sessionStorage.setItem('token', JSON.stringify(token));
  }

  getToken() {
    const tokenString = sessionStorage.getItem('token');
    const userToken = JSON.parse(tokenString);
    return userToken?.token;
  }
  
  render() {
    return (
      <Router>
        <div>
          <Switch>
            <Route path="/" exact component={LandingPage} />
            <Route path="/register" component={RegisterPage} />
            <Route path="/home">
              <HomePage getToken={this.getToken} setToken={this.setToken} />
            </Route>
            <Route path="/login">
              <LoginPage getToken={this.getToken} setToken={this.setToken} />
            </Route>
            {/* <Route path="/admin">
              <AdminPage getToken={this.getToken} />
            </Route> */}
          </Switch>
        </div>
      </Router>
    )
  }
}

ReactDOM.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
