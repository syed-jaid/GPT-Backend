const express = require("express");
const cors = require("cors");
// const mailerLite = require("mailerlite");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const app = express();
app.use(cors());
app.use(express.json());
const axios = require("axios");
const { EMAIL, PASSWORD } = require("./env");

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripe = require("stripe")(
  "sk_test_51OqGxyLC5VPM7UrEx68Ha3rk52QtrOQOBrgQ7UODOALBXx6vNbZadWWUJmR6VIXLZtMBklykKqvQgH22PgpXhJO100TSUzTXu1"
);

const API_KEY =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiOGJlMjIwNmI2MzJhZmJiODE1ZDdiYTA3MWUzMzE0ODFjYjQwYTIwZjFjOTFlZDk0OWQyY2QyYzMzMWEwNDY4MGMwN2JhNzVhMDkzYmIzM2EiLCJpYXQiOjE3MDk1OTA1NjUuNjQxOTQ4LCJuYmYiOjE3MDk1OTA1NjUuNjQxOTUsImV4cCI6NDg2NTI2NDE2NS42MzgzNjksInN1YiI6Ijg2Mzg0MSIsInNjb3BlcyI6W119.SvM_L9diysxy1S_EdhMnJWW6j2EzeDP3Cr1Gf_CNbE2a1yNmXZFexFciDaTGQqDgnqhAOdCNl1Ncya2G636gwIlrKpqReQ_54FpyosMdoSQ7nMqO83Js-JHpzTKYJhIpl4xTfW2JVeQtjpdSRtRrBQOGD7ZjNY8Iiu3KYen_aYMyh5CQRroJAAIEDJzOIQco5NDOsmJkJ2d6PVzcGefJW5UfKOgXxpHmo4MxFWWwOSP5JiSRt6rLpYof6-YIvkaISzuAGw9P56ZmhbnNt6xdW5782wCOfjCwOX38PDgUjdmSA1waiPT6UOJaxjrM-o2dT7hIdUK1UH1KqlMc5RC2PIwx5OWZOAAc3fvk5JnK4usT27pJJXm526pI-qG7QlEetSgZO0q0-qjdiCRS3sB4_T9-gOe2H_f4iFike1bLmElPT20157gK9Q08uNvqy2u5XFAxQZMh_pPpIUcpXOKIxfZM3x8mfwWMLh9bg-JwYlasZMKRNFvj3jThiW49UCfB6jc3ZvaQY9r2YEdGYz8YmpgQR9nd2K72nzX57SEi_LLqs94y-WiLc4l3t8fkfJAZkg8K2y1SBeKHtv5ZXGpBGQxmUgxkDie2pmoSsNsRHpegtlLe1ugwJv1uNpkrT2T53_i_f88IBv0r0YoKeAzHiRA0FhXmY0ShYdwvFSQdF1M";

// -----------------------
// checkout
// -----------------------

app.post("/checkout", async (req, res) => {
  const booking = req.body;
  const price = booking?.amount;
  const amount = price * 100;
  console.log(booking);
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "usd",
      amount: amount,
      payment_method_types: ["card"],
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (err) {
    res.status(500).send({ error: "Error creating payment intent" });
  }
});

// -------------------------------
// POST endpoint for sending email
// -------------------------------

app.post("/sendEmail", async (req, res) => {
  const reciveEmail = req.body.email;
  const customerName = req.body.name;
  const customerCountry = req.body.county;
  const customerNumber = req.body.number;
  const productPrice = req.body.amount;

  console.log(reciveEmail, customerCountry, customerName, customerNumber);

  let config = {
    service: "gmail",
    auth: {
      user: EMAIL,
      pass: PASSWORD,
    },
  };

  let transporter = nodemailer.createTransport(config);

  let MailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Mailgen",
      link: "https://mailgen.js/",
    },
  });

  let response = {
    body: {
      name: customerName,
      intro: `Your bill has arrived! from ${customerCountry}`,
      table: {
        data: [
          {
            item: "Marketing Toolkits",
            description: "16000+ Ultimate AI merketing toolkits",
            price: productPrice,
          },
        ],
      },
      outro: `Thank you so much, ${customerName}.`,
    },
  };

  let mail = MailGenerator.generate(response);

  let message = {
    from: EMAIL,
    to: reciveEmail,
    subject: "Place Order",
    html: mail,
  };

  transporter
    .sendMail(message)
    .then(() => {
      return res.status(201).json({
        msg: "you should receive an email",
      });
    })
    .catch((error) => {
      return res.status(500).json({ error });
    });
});

// -------------------------------
/** send mail from testing account */
// -------------------------------

// app.post("/sendEmail", async (req, res) => {
//   const reciver = req.body.formData.email;
//   /** testing account */
//   let testAccount = await nodemailer.createTestAccount();

//   // create reusable transporter object using the default SMTP transport
//   let transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: testAccount.user, // generated ethereal user
//       pass: testAccount.pass, // generated ethereal password
//     },
//   });

//   let message = {
//     from: '"Fred Foo 👻" <foo@example.com>', // sender address
//     to: reciver, // list of receivers
//     subject: "Hello ✔", // Subject line
//     text: "Successfully Register with us.", // plain text body
//     html: "<b>Successfully Register with us.</b>", // html body
//   };

//   transporter
//     .sendMail(message)
//     .then((info) => {
//       return res.status(201).json({
//         msg: "you should receive an email",
//         info: info.messageId,
//         preview: nodemailer.getTestMessageUrl(info),
//       });
//     })
//     .catch((error) => {
//       return res.status(500).json({ error });
//     });

//   // res.status(201).json("Signup Successfully...!");
// });

// ------------------------------
// ------------------------------

// async function sendEmail(name, email) {
//   try {
//   } catch (error) {
//     console.error("Error sending email:", error);
//     throw new Error("Failed to send email");
//   }
// }
// -----------------------
// async function sendEmail(name, email) {
//   try {
//     const response = await axios.post(
//       `https://api.mailerlite.com/api/v2/campaigns`,
//       {
//         apiKey: API_KEY,
//         type: "regular",
//         subject: "Test Subject",
//         body: "<h1>Hello from MailerLite!</h1>",
//         groups: [114946758570674161], // Replace with your actual group ID
//         emails: [
//           {
//             from_name: "Rishabh",
//             from: "gpt@adrunners.co.uk",
//           },
//         ],
//         recipients: [{ name, email }],
//         // Add missing fields
//         name: "Campaign Name", // Example name for the campaign
//         emails: [
//           {
//             from_name: "Rishabh",
//             from: "gpt@adrunners.co.uk",
//           },
//         ],
//         groups: [114946758570674161], // Replace with your actual group ID
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // Handle response as needed
//   } catch (error) {
//     console.error("Error sending email:", error.response.data);
//     throw error;
//   }
// }

// -----------------------

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
