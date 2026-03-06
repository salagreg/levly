const bcrypt = require("bcrypt");

const password = "password123";

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error("Erreur:", err);
  } else {
  }
});
