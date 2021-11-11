const express = require("express");

const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

const cookieParser = require("cookie-parser");
let cookieSession = require("cookie-session");
app.use(
  cookieSession({
    name: "session",
    keys: ["secretkey", "secretkey"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);
const morgan = require("morgan");
const {
  generateRandomString,
  emailLookup,
  authenticateUser,
  urlsForUser,
} = require("./helpers.js");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
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
//DONE
app.get("/", (req, res) => {
  let displayUrls = {};

  if (req.session.user_id) {
    displayUrls = urlsForUser(req.session.user_id);
  }

  let templateVars = {
    urls: displayUrls,
    user: users[req.session.user_id],
    //username: req.cookies["user_id"],
  };

  res.render("urls_index", templateVars);
});
//DONE
app.get("/new", (req, res) => {
  let templateVars = {
    //username: req.cookies["user_id"],
    user: users[req.session["user_id"]],
  };

  if (users[req.session["user_id"]]) {
    return res.render("urls_new", templateVars);
  } else {
    res.redirect("urls_login");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//DONE
app.get(":/id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    let templateVars = {
      shortURL: req.params.id,
      fullURL: undefined,
      urlUserID: undefined,
      user: users[req.session["user_id"]],
    };
    return res.render("urls_show", templateVars);
    // Else if the URL is in our database, set the templateVars with its data
  } else {
    let templateVars = {
      shortURL: req.params.id,
      fullURL: urlDatabase[req.params.id].url,
      urlUserID: urlDatabase[req.params.id].userID,
      user: users[req.session["user_id"]],
    };
    res.render("urls_show", templateVars);
  }
});

//DONE
app.get("/u/:shortURL", (req, res) => {
  //const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!urlDatabase[req.params.shortURL]) {
    let templateVars = {
      user: users[req.session.user_id],
    };
    return res.render("urls_invalid", templateVars);
  } else {
    let longURL = urlDatabase[req.params.shortURL].url;
    res.redirect(longURL);
  }
  //return res.send("<html><body>ID does not exist</body></html>\n");
});

//DOnE
app.get("/register", (req, res) => {
  //res.render("urls_registration");
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_registration", templateVars);
  }
});

//DONE
app.get("/login", (req, res) => {
  if (req.session["user_id"]) {
    return res.redirect("/urls");
  } else {
    let templateVars = {
      user: users[req.session["user_id"]],
    };
    res.render("urls_login", templateVars);
  }
});

//DONE
app.post("/", (req, res) => {
  if (req.session["user_id"]) {
    let newRandomString = generateRandomString();
    urlDatabase[newRandomString] = {
      id: newRandomString,
      userID: req.body.userID,
      url: req.body.longURL,
    };

    return res.redirect("/urls/" + newRandomString);
  } else {
    res.end("<html><body>Log in first</body></html>\n");
  }
});

//DONE
app.post("/:id/delete", (req, res) => {
  if (urlDatabase[req.params.id].userID === users[req.session["user_id"]].id) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
    // Else, error
  } else {
    res.end("<html><head><No delete permissions</body></html>\n");
  }
});

//DONE
app.post("/:id", (req, res) => {
  if (
    req.session["user_id"] &&
    req.session["user_id"] === urlDatabase[req.body.shortURL].userID
  ) {
    let fullURL = req.body.newLongURL;
    let shortURL = req.body.shortURL;
    urlDatabase[req.body.shortURL].url = req.body.newLongURL;
    // Redirect back to the urls index page
    return res.redirect("/urls");
  } else {
    res.end(
      "<html><head><body></body>Cannot edit URl you didnt create</body></html>\n"
    );
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(`/urls`);
});

//DONE
app.post("/login", (req, res) => {
  let existingEmails = [];
  let matchedUserId = "";

  for (let userId in users) {
    if (users.hasOwnProperty(userId)) {
      existingEmails.push(users[userId].email);
    }
  }

  if (existingEmails.indexOf(req.body.email) === -1) {
    return res.end(
      "<html><head><title>TinyApp: Error</title></head><body>Invalid username or password. </body></html>\n"
    );
  } else {
    for (let userId in users) {
      if (users.hasOwnProperty(userId)) {
        if (users[userId].email === req.body.email) {
          matchedUserId = userId;
        }
      }
    }

    let hashedPassword = bcrypt.hashSync(req.body.password, 10);

    if (
      bcrypt.compareSync(req.body.password, users[matchedUserId].hashedPassword)
    ) {
      req.session.user_id = matchedUserId;
      return res.redirect("/urls");
    } else {
      res.end(
        "<html><head><title>TinyApp: Error</title></head><body>Invalid username or password. </body></html>\n"
      );
    }
  }
});

app.post("/register", (req, res) => {
  const userEmail = emailLookup(users, req.body.email);

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Missing email or password ");
  }

  if (userEmail) {
    return res.status(400).send("Email already exisits");
  }
  var randomid = generateRandomString();
  users[randomid] = {
    id: randomid,
    email: req.body.email,
    hashedPassword: bcrypt.hashSync(req.body.password, 10),
  };
  console.log(users);

  req.session.user_id = randomid;
  res.redirect("/urls");
});

module.exports = { urlDatabase };
