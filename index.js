const express = require("express");
const cors = require("cors");
const mailerLite = require("mailerlite");

const app = express();
app.use(cors());
app.use(express.json());
const axios = require("axios");

// const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripe = require("stripe")(
  "sk_test_51OqGxyLC5VPM7UrEx68Ha3rk52QtrOQOBrgQ7UODOALBXx6vNbZadWWUJmR6VIXLZtMBklykKqvQgH22PgpXhJO100TSUzTXu1"
);

const API_KEY =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiOGJlMjIwNmI2MzJhZmJiODE1ZDdiYTA3MWUzMzE0ODFjYjQwYTIwZjFjOTFlZDk0OWQyY2QyYzMzMWEwNDY4MGMwN2JhNzVhMDkzYmIzM2EiLCJpYXQiOjE3MDk1OTA1NjUuNjQxOTQ4LCJuYmYiOjE3MDk1OTA1NjUuNjQxOTUsImV4cCI6NDg2NTI2NDE2NS42MzgzNjksInN1YiI6Ijg2Mzg0MSIsInNjb3BlcyI6W119.SvM_L9diysxy1S_EdhMnJWW6j2EzeDP3Cr1Gf_CNbE2a1yNmXZFexFciDaTGQqDgnqhAOdCNl1Ncya2G636gwIlrKpqReQ_54FpyosMdoSQ7nMqO83Js-JHpzTKYJhIpl4xTfW2JVeQtjpdSRtRrBQOGD7ZjNY8Iiu3KYen_aYMyh5CQRroJAAIEDJzOIQco5NDOsmJkJ2d6PVzcGefJW5UfKOgXxpHmo4MxFWWwOSP5JiSRt6rLpYof6-YIvkaISzuAGw9P56ZmhbnNt6xdW5782wCOfjCwOX38PDgUjdmSA1waiPT6UOJaxjrM-o2dT7hIdUK1UH1KqlMc5RC2PIwx5OWZOAAc3fvk5JnK4usT27pJJXm526pI-qG7QlEetSgZO0q0-qjdiCRS3sB4_T9-gOe2H_f4iFike1bLmElPT20157gK9Q08uNvqy2u5XFAxQZMh_pPpIUcpXOKIxfZM3x8mfwWMLh9bg-JwYlasZMKRNFvj3jThiW49UCfB6jc3ZvaQY9r2YEdGYz8YmpgQR9nd2K72nzX57SEi_LLqs94y-WiLc4l3t8fkfJAZkg8K2y1SBeKHtv5ZXGpBGQxmUgxkDie2pmoSsNsRHpegtlLe1ugwJv1uNpkrT2T53_i_f88IBv0r0YoKeAzHiRA0FhXmY0ShYdwvFSQdF1M";

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

// -----------------------

app.post("/sendEmail", async (req, res) => {
  const { name, email } = req.body;
  console.log(name, email);
  await sendEmail(name, email);

  res.status(200).json({ message: "Email sent successfully!" });
});

// -----------------------
async function sendEmail(name, email) {
  try {
    const response = await axios.post(
      `https://api.mailerlite.com/api/v2/campaigns`,
      {
        apiKey: API_KEY,
        type: "regular",
        subject: "Test Subject",
        body: "<h1>Hello from MailerLite!</h1>",
        groups: [114946758570674161], // Replace with your actual group ID
        emails: [
          {
            from_name: "Rishabh",
            from: "gpt@adrunners.co.uk",
          },
        ],
        recipients: [{ name, email }],
        // Add missing fields
        name: "Campaign Name", // Example name for the campaign
        emails: [
          {
            from_name: "Rishabh",
            from: "gpt@adrunners.co.uk",
          },
        ],
        groups: [114946758570674161], // Replace with your actual group ID
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Handle response as needed
  } catch (error) {
    console.error("Error sending email:", error.response.data);
    throw error;
  }
}

// -----------------------
app.listen(4000, () => {
  console.log("Server is running on port 4000");
});
