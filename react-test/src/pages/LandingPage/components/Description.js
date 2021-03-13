import React from 'react';
import './Description.css';

class Description extends React.Component {

    render() {
        return (
            <div id="description">
                <div id="sectionOne">
                    <h2 className="sectionOne-title">Herkes için yeni bir üniversite platformu</h2>
                    <p className="desc">Kampüste Kal ile universiteden istediğin kişilerle iletişim kurabilir, 
                    istediğin kişilerle bilgi paylaşabilirsin.</p>
                </div>
                <div id="imageOne">
                    <img alt="" id="img1" src="KocUniversity.jpg"></img>
                </div>
                <div id="sectionTwo">
                    <h2 className="sectionTwo-title">Konuşma Gruplarına Katıl</h2>
                    <p className="desc">İlgini çeken konuşma gruplarına istek yolla ve kolayca katıl.
                    Güvenli bir şekilde konuşma odalarında üniversitenden insanlarla iletişim kur.</p>
                </div>
            </div>
        );  
    }

}

export default Description;