import firebase from 'firebase'

const firebaseConfig = {
    apiKey: "AIzaSyB_wV3rvJbx--kdqCVNX2m9yHi297uaz7o",
    authDomain: "kampustekal-32a9c.firebaseapp.com",
    databaseURL: "https://kampustekal-32a9c-default-rtdb.firebaseio.com",
    projectId: "kampustekal-32a9c",
    storageBucket: "kampustekal-32a9c.appspot.com",
    messagingSenderId: "851078311705",
    appId: "1:851078311705:web:993d22eab0834f1e0c5f88",
    measurementId: "G-ZXSWR6VY5S"
}

firebase.initializeApp(firebaseConfig)
export const auth = firebase.auth()
export const db = firebase.database()