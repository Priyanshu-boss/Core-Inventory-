const nodemailer = require('nodemailer');

// Use Ethereal for testing OTP emails natively
async function createTestTransporter() {
  // Generate test SMTP service account from ethereal.email
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });
}

let transporterPromise = createTestTransporter();

async function sendOTPEmail(toEmail, otpCode) {
  try {
    const transporter = await transporterPromise;
    let info = await transporter.sendMail({
      from: '"IMS System" <noreply@ims.local>', // sender address
      to: toEmail, // list of receivers
      subject: "Your OTP Verification Code", // Subject line
      text: `Your OTP is ${otpCode}. It expires in 10 minutes.`, // plain text body
      html: `<b>Your OTP is ${otpCode}.</b><br/>It expires in 10 minutes.`, // html body
    });

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return true;
  } catch (err) {
    console.error("Error sending email:", err);
    return false;
  }
}

module.exports = { sendOTPEmail };
