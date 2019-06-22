import localAuth from "passport-local";

export const signUpValidator = (
  req,
  email,
  firstName,
  lastName,
  existingUser,
  password,
  confirmPassword,
  done
) => {
  const errors = [];

  if (existingUser) {
    errors.push("That email is already taken.");
  }
  if (email.indexOf("@") == -1) {
    errors.push("Email is not a valid email.");
  }
  if (email.match(/[-!$%^&*()_+|~=`{}\[\]:\/;<>?,#]/)) {
    errors.push("Email is not a valid email.");
  }
  if (password !== confirmPassword) {
    errors.push("The passwords do not match.");
  }
  if (password.length < 8) {
    errors.push("The password is too short.");
  }
  if (!password.match(/[A-Z]/)) {
    errors.push("Password must contain at least one capital letter.");
  }
  if (!password.match(/[a-z]/)) {
    errors.push("Password must contain at least one lowercase letter.");
  }
  if (!password.match(/[-!$%^&*()_+|~=`{}\[\]:\/;<>?,.@#]/)) {
    errors.push("Password must contain at least one special symbol.");
  }
  if (firstName < 1) {
    errors.push("First name must be at least one character.");
  }
  if (firstName.match(/[0-9!$%^&*()_+|~={}\[\]:\/;<>?,.@#]/)) {
    errors.push("First name is not valid.");
  }
  if (lastName < 1) {
    errors.push("Last name must be at least one character.");
  }
  if (lastName.match(/[0-9!$%^&*()_+|~={}\[\]:\/;<>?,.@#]/)) {
    errors.push("Last name is not valid.");
  }
  if (errors.length > 0) {
    done(null, false, req.flash("signupMessage", errors));
  }
};
