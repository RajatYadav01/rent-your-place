module.exports = async (request, response, next) => {
  function isUserTypeValid(type) {
    return /^(Owner|Tenant|owner|tenant)$/.test(type);
  }

  function isNameValid(name) {
    return /^\s*([A-Za-z]{1,}([\.,] |[-']| )?)+[A-Za-z]+\.?\s*$/.test(name);
  }

  function isEmailAddressValid(emailAddress) {
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
      emailAddress
    );
  }

  function isPhoneNumberValid(phoneNumber) {
    return /^\+[1-9]{1}[0-9]{3,14}$/.test(phoneNumber);
  }

  function isPasswordValid(password) {
    return /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*\-_.?]).{8,50}$/.test(
      password
    );
  }

  if (request.path === "/api/users/new") {
    const {
      userType,
      firstName,
      lastName,
      emailAddress,
      phoneNumber,
      password,
      confirmPassword,
    } = request.body;
    if (
      ![
        userType,
        firstName,
        lastName,
        emailAddress,
        phoneNumber,
        password,
        confirmPassword,
      ].every(Boolean)
    )
      return response.status(422).json({ message: "Missing credentials" });
    else if (!isUserTypeValid(userType))
      return response.status(422).json({ message: "Invalid user type" });
    else if (!isNameValid(firstName))
      return response.status(422).json({ message: "Invalid first name" });
    else if (!isNameValid(lastName))
      return response.status(422).json({ message: "Invalid last name" });
    else if (!isEmailAddressValid(emailAddress))
      return response.status(422).json({ message: "Invalid email address" });
    else if (!isPhoneNumberValid(phoneNumber))
      return response.status(422).json({ message: "Invalid phone number" });
    else if (!isPasswordValid(password))
      return response.status(422).json({ message: "Invalid password" });
    else if (!isPasswordValid(confirmPassword) && confirmPassword !== password)
      return response
        .status(422)
        .json({ message: "Confirm password does not match with password" });
  } else if (request.path === "/api/users/authenticate") {
    const { emailAddress, password } = request.body;
    if (![emailAddress, password].every(Boolean))
      return response.status(422).json({ message: "Missing credentials" });
    else if (!isEmailAddressValid(emailAddress))
      return response.status(422).json({ message: "Invalid email address" });
    else if (!isPasswordValid(password))
      return response.status(422).json({ message: "Invalid password" });
  } else if (request.path === "/api/users/resetPassword") {
    const { emailAddress, password, confirmPassword } = request.body;
    if (![emailAddress, password, confirmPassword].every(Boolean))
      return response.status(422).json({ message: "Missing credentials" });
    else if (!isEmailAddressValid(emailAddress))
      return response.status(422).json({ message: "Invalid email address" });
    else if (!isPasswordValid(password))
      return response.status(422).json({ message: "Invalid password" });
    else if (!isPasswordValid(confirmPassword) && confirmPassword !== password)
      return response
        .status(422)
        .json({ message: "Confirm password does not match with password" });
  } else if (request.path === "/api/users/update") {
    const {
      userType,
      firstName,
      lastName,
      phoneNumber,
      password,
      confirmPassword,
    } = request.body;
    if (!isUserTypeValid(userType))
      return response.status(422).json({ message: "Invalid user type" });
    else if (!isNameValid(firstName))
      return response.status(422).json({ message: "Invalid first name" });
    else if (!isNameValid(lastName))
      return response.status(422).json({ message: "Invalid last name" });
    else if (!isEmailAddressValid(emailAddress))
      return response.status(422).json({ message: "Invalid email address" });
    else if (!isPhoneNumberValid(phoneNumber))
      return response.status(422).json({ message: "Invalid phone number" });
    else if (!isPasswordValid(password))
      return response.status(422).json({ message: "Invalid password" });
    else if (!isPasswordValid(confirmPassword) && confirmPassword !== password)
      return response
        .status(422)
        .json({ message: "Confirm password does not match with password" });
  }

  next();
};
