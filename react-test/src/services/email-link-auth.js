import firebase from 'firebase'

var actionCodeSettings = {
    url: 'https://kampustekal-32a9c.web.app/?email=' + firebase.auth().currentUser.email,
    handleCodeInApp: true,
    // When multiple custom dynamic link domains are defined, specify which
    // one to use.
};

