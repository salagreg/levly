// Valide le format d'un email
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Valide la longueur du mot de passe
const isValidPassword = (password) => {
  return password && password.length >= 8;
};

module.exports = {
  isValidEmail,
  isValidPassword,
};
