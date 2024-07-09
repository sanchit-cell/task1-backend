const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const keys = require("./config/keys");
require("dotenv").config();
const cors = require("cors");
require("./models/User");
require("./services/passport");

const username = process.env.MONGO_USERNAME;
const password = process.env.MONGO_PASSWORD;
const cluster = process.env.MONGO_CLUSTER;

const uri = `mongodb+srv://${username}:${password}@${cluster}/facebook_users`;

mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });

const app = express();

app.use(
  cors({
    origin: "https://task1-w74l.onrender.com/", // your frontend domain
    credentials: true, // allows session cookies to be sent and received
  })
);

app.use(bodyParser.json());

app.use(
  session({
    secret: keys.cookieKey,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(require("./routes/auth"));

if (process.env.NODE_ENV === "production") {
  app.use(express.static("frontend/build"));

  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server started at Port : ${PORT}`));
