const urlDatabase = require("./express_server.js");

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

function urlsForUser(id) {
  let userURLS = {};
  for (let urlID in urlDatabase) {
    if (urlDatabase.hasOwnProperty(urlID)) {
      if (urlDatabase[urlID].userID === id) {
        userURLS[urlID] = urlDatabase[urlID];
      }
    }
  }
  return userURLS;
}

module.exports = {
  generateRandomString,
  emailLookup,
  authenticateUser,
  urlsForUser,
};
