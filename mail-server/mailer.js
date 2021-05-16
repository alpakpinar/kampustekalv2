const nodemailer = require('nodemailer');

function sendEmail(message) {
  return new Promise((res, rej) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: "info.kampustekal@gmail.com",
        pass: "Kampus1234",
      }
    })
    transporter.sendMail(message, function(err, info) {
      if (err) {
        rej(err)
      } else {
        res(info)
      }
    })
  })
}

exports.sendConfirmationEmail = function(username, email) {
  const message = {
    from: "info.kampustekal@gmail.com",
    // to: toUser.email // in production uncomment this
    to: email,
    subject: 'Your App - Activate Account',
    html: `
      <h3> Hello ${username} </h3>
      <p>Thank you for registering into our Application. Much Appreciated! Just one last step is laying ahead of you...</p>
      <p>To activate your account please follow this link: <a target="_" href="">Test</a></p>
      <p>Cheers</p>
      <p>Your Application Team</p>
    `
  }

  return sendEmail(message);
}