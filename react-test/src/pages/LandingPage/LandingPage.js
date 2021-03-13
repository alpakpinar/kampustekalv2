import React from 'react';
import Navigation from './components/Navigation';
import Header from './components/Header';
import Footer from './components/Footer';
import Description from './components/Description';
import HomePageHeader from '../HomePage/components/HomePageHeader'
import './LandingPage.css';

class Home extends React.Component {
  
  render() {
    return (
      <div>
        <HomePageHeader />
        <Header />
        <Description />
        <Footer />
      </div>
    )
  }
}

export default Home;
