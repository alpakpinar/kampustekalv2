import React from 'react';

import Box from '@material-ui/core/Box'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

class Image extends React.Component {
    render() {
        return (
            <img alt="" style={{borderRadius: "40%", margin: "auto"}} src={this.props.imagesrc}></img>
        )
    }
}

class Entry extends React.Component {
    constructor(props) {
        super(props)
    }
    render() {
        if (this.props.imageOn === 'left') {
            return (
                <Box display="flex" flexDirection="row" m={5}>
                    <Box>
                        <Image imagesrc={this.props.imagesrc} />
                    </Box>
                    <Box style={{margin: "5%", justifyContent: "center"}}>
                        <Typography style={{fontSize: "40px", fontWeight: "bold"}} variant="h4" align="center">{this.props.header}</Typography>
                        <Typography style={{fontSize: "25px", marginTop: "3%"}} align="center" variant="h6">{this.props.text}</Typography>
                    </Box>
                </Box>
            )
        }
        else {
            return (
                <Box display="flex" flexDirection="row" m={5}>
                    <Box style={{margin: "5%", justifyContent: "center"}}>
                        <Typography style={{fontSize: "40px", fontWeight: "bold"}} variant="h4" align="center">{this.props.header}</Typography>
                        <Typography style={{fontSize: "25px", marginTop: "3%"}} align="center" variant="h6">{this.props.text}</Typography>
                    </Box>   
                    <Box>
                        <Image imagesrc={this.props.imagesrc} />
                    </Box>
                </Box>
            )
        }
    }
}

class Description extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            headers: [
                'Üniversitelilere Özel: Kampustekal :)',
                'Tüm Üniversitelerden Yeni İnsanlarla Tanışabilirsin!',
                'Ders Odaları ve Öğrenci Kulüpleri Burada!'    
            ],
            texts: [
                "Kampüstekal'a, sadece edu.tr ile biten öğrenci mail adresinle kaydolabilirsin.",
                "Rastgele butonuna basarak anonim kimliğinle yeni arkadaşlar edinebilirsin. İstediğin temada sohbet edebilmen için odalar hazırladık!",
                "Kampüstekal ile kulubündeki ve aynı dersi aldığın arkadaşlarınla iletişimde kalabilirsin. Kampüstekallı dersler konusunda yardımseverdir :)"
            ],
            images: [
                "BogaziciUni2.jpg",
                "Description2.jpg",
                "Description3.jpg",
            ]
        }
    }

    render() {
        return (
            <Box display="flex" flexDirection="column">
                <Entry imagesrc={this.state.images[0]} header={this.state.headers[0]} imageOn="left"
                    text={this.state.texts[0]}
                />
                <Entry imagesrc={this.state.images[1]} header={this.state.headers[1]} imageOn="right"
                    text={this.state.texts[1]}
                />
                <Entry imagesrc={this.state.images[2]} header={this.state.headers[2]} imageOn="left"
                    text={this.state.texts[2]}
                />
            </Box>
        );  
    }

}

export default Description;