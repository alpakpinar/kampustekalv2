require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const { sendConfirmationEmail } = require('./mailer');

const cors = require('cors');

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}

app.use(bodyParser.json());
app.use(cors(corsOptions));

// app.get('/api/activate/user/:hash', async (req, res) => {
//   const { hash } = req.params;
//   try {
//     const user = await PendingUser.findOne({_id: hash});
//     const newUser = new User({...user});
//     await newUser.save();
//     await user.remove();
//     res.json({message: `User ${hash} has been activated`})
//   } catch {
//     res.status(422).send('User cannot be activated!');
//   }
// })

app.post('/api/send-email', async (req, res) => {
  try {
    await sendConfirmationEmail(req.body.username, req.body.email)
    res.json({message: 'E-mail gonderildi.'});
  } catch(e) {
    res.status(422).send(e.message);
  }
})

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`> Connected to ${PORT}`));