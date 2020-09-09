require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = 4000;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.use(express.json());
app.use(cors());

const users = [
  {
    username: "Todd",
    password: "$2b$10$N/VJvYy0QtM5gxfJV7EtFuwEnaWcDaJfpXShlISDic0vuzCmmlp2G"
  },
  {
    username: "Fredrico",
    password: "$2b$10$YH6XItSk3DvyH6kbHSe.9OUWe1TeX27w5Xn1HMNZ7oblgnH2QCROK"
  },
  {
    username: "Todd3",
    password: "$2b$10$1BI.ajWOdIcu4KgBsWf7ZeXs1LvfzimA5ha.Ky7XTursY6crQM0Oq"
  }
];

const blogs = [
  { user: "Todd", text: "This is a blog" },
  { user: "Todd3", text: "This is not a blog" },
  { user: "Todd3", text: "This may not be a blog" },
  { user: "Fredrico", text: "Cats" }
];

app.get("/users", (request, response) => {
  console.log(request.user);
  response.status(200).send(users);
});

app.post("/blogs", authorizeUser, (request, response) => {
  const username = request.user.username;
  const thisUsersBlogs = blogs.filter(blog => blog.user === username);
  response.status(200).send(thisUsersBlogs);
});

//create user and put username and HASHED (w/salt) pw in database
app.post("/user", async (request, response) => {
  try {
    // console.log(request.body);
    let username = request.body.username;
    let password = request.body.password;
    let salt = await bcrypt.genSalt();
    // console.log("generated salt:", salt);
    const hashedPassword = await bcrypt.hash(password, salt);
    // console.log("hashed password with salt", hashedPassword);

    let user = { username, password: hashedPassword };
    users.push(user);
    response.status(201).send(users);
  } catch (error) {
    response.status(500).send(users);
  }
});

//take a username and password, and verify that the username exists
//and verify that the password sent in the request matches the hash
//in the db when passing the request password and salt through the
//bcrypt crypto hash function
//COMPARING THE DIGESTS/HASHES INSTEAD OF PLAINTEXT PW

app.post("/authenticateuser", async (request, response) => {
  try {
    const userExists = username =>
      users.find(currentUser => username === currentUser.username);
    const username = request.body.username;
    const password = request.body.password;

    const currentUser = userExists(username);

    if (!userExists(username)) {
      return response.status(401).send({ message: "username does not exist" });
    }
    if (await bcrypt.compare(password, currentUser.password)) {
      const user = { username: username };
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      return response
        .status(200)
        .send({ jwt: accessToken, message: "congrats, you have logged in!" });
    } else {
      return response.status(401).send({ message: "incorrect password" });
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

function authorizeUser(request, response, next) {
  console.log(request.body);
  const token = request.body.token;
  if (token == null) {
    console.log(token, "null token");
    return response.status(401).send({ message: "No token sent" });
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return response.status(403).send({ message: err });
    console.log("User is authorized");
    request.user = user;
    next();
  });
  next();
}

app.listen(PORT, () => console.log(`App is listenting on ${PORT}`));
