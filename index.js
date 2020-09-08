const express = require("express");
const app = express();
const PORT = 4000;
const bcrypt = require("bcrypt");

app.use(express.json());

const users = [
  { username: "Todd", password: "specialSecret!" },
  { username: "Fredrico", password: "a" }
];

app.get("/users", (request, response) => {
  response.status(200).send(users);
});

//create user and put username and HASHED (w/salt) pw in database
app.post("/user", async (request, response) => {
  try {
    console.log(request.body);
    let username = request.body.username;
    let password = request.body.password;
    let salt = await bcrypt.genSalt();
    console.log("generated salt:", salt);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log("hashed password with salt", hashedPassword);

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
      return response
        .status(200)
        .send({ message: "congrats, you have logged in!" });
    } else {
      return response.status(401).send({ message: "incorrect password" });
    }
  } catch (error) {
    response.status(500).send(error);
  }
});

app.listen(PORT, () => console.log(`App is listenting on ${PORT}`));
