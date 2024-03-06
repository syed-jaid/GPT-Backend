const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const app = express();
app.use(cors());
app.use(express.json());
const axios = require("axios");
const { EMAIL, PASSWORD } = require("./env");

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// -----------------------
// checkout
// -----------------------
app.get("/", async (req, res) => {
  res.send("Welcome");
});

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
