const express = require("express");

const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
    username: req.cookies["user_id"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["user_id"],
    user: users[req.cookies["user_id"]],
  };

  res.render("urls_new", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["user_id"],
    user: users[req.cookies["user_id"]],
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];

  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("urls_registration");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
  console.log(urlDatabase);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.updatedlongURL;

  res.redirect(`/urls`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(`/urls`);
});

app.post("/login", (req, res) => {
  console.log("User object: ", users);
  const auth = authenticateUser(users, req.body.email, req.body.password);
  console.log(auth);
  if (auth) {
    res.cookie("user_id", auth.id);
    res.redirect(`/urls`);
  } else {
    res.status(403).send("Wrong email or password");
  }

  // for (let key in users) {
  //   console.log(users[key]["email"]);
  //   if (
  //     users[key]["email"] === req.body.email &&
  //     users[key]["password"] === req.body.password
  //   ) {
  //     res.cookie("user_id", users[key]["id"]);
  //     res.redirect(`/urls`);
  //   } else res.status(403).send("No email or password");
  // }
});

app.post("/register", (req, res) => {
  var randomid = generateRandomString();

  const userEmail = emailLookup(users, req.body.email);

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Missing email or password ");
  }

  // if (userEmail) {
  //   return res.status(400).send("Email already exisits");
  // }

  for (let key in users) {
    //console.log(users[key]["email"]);
    if (users[key]["email"] === req.body.email)
      return res.status(400).send("Email already exisits");
  }

  users[randomid] = {
    id: randomid,
    email: req.body.email,
    password: req.body.password,
  };

  //console.log(users);
  res.cookie("user_id", randomid);
  res.redirect("/urls");
});

function generateRandomString() {
  return Math.random().toString(36).slice(7);
}
function emailLookup(userdatabase, email) {
  for (const user in userdatabase) {
    //console.log("Users in email lookup:", user);
    if (userdatabase[user].email === email) {
      return userdatabase[user];
    }
  }
  return false;
}

function authenticateUser(userdatabase, email, password) {
  const foundUser = emailLookup(userdatabase, email);
  //console.log("True if exists; ", foundUser);
  if (foundUser && foundUser.password === password) {
    return foundUser;
  }
  return false;
}
