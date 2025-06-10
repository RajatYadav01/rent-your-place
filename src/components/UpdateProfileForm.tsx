import React, {
  Fragment,
  useEffect,
  useContext,
  useReducer,
  useRef,
  useState,
} from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import axios, { AxiosResponse } from "axios";
import parse from "html-react-parser";
import { toast } from "react-toastify";
import { LoginStatusActionType, LoginSuccessStatusContext } from "../App";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../dist/css/UpdateProfileForm.css";

type UpdateProfileFormType = {
  id: string;
  userType: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

type UpdateProfileAttributesType = {
  id: string | null;
  userType: string | null;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string | null;
  phoneNumber: string | null;
  password: string | null;
  confirmPassword: string | null;
};

const updateProfileFormEmptyState: UpdateProfileFormType = {
  id: "",
  userType: "",
  firstName: "",
  lastName: "",
  emailAddress: "",
  phoneNumber: "",
  password: "",
  confirmPassword: "",
};

type UpdateProfileFormInputStatusType = {
  valid: boolean;
  focused: boolean;
  // instructions: string[];
};

type UpdateProfileFormInputActionType = {
  type: string;
  payload: boolean;
};

const updateProfileFormInputStatusInitialState = {
  valid: true,
  focused: false,
  // instructions: inputInstructions
};

const inputStatusReducer = (
  state: UpdateProfileFormInputStatusType,
  action: UpdateProfileFormInputActionType
) => {
  switch (action.type) {
    case "focus":
      return { ...state, focused: action.payload };
    case "valid":
      return { ...state, valid: action.payload };
    default:
      throw new Error();
  }
};

type UpdateProfileFormErrorsType = {
  userTypeError: string;
  firstNameError: string;
  lastNameError: string;
  emailAddressError: string;
  phoneNumberError: string;
  passwordError: string;
  confirmPasswordError: string;
  updateProfileError: string;
};

type UpdateProfileFormErrorsActionType = {
  type: string;
  payload: string;
};

const updateProfileFormErrorsInitialState = {
  userTypeError: "",
  firstNameError: "",
  lastNameError: "",
  emailAddressError: "",
  phoneNumberError: "",
  passwordError: "",
  confirmPasswordError: "",
  updateProfileError: "",
};

function errorReducer(
  state: UpdateProfileFormErrorsType,
  action: UpdateProfileFormErrorsActionType
) {
  switch (action.type) {
    case "userType":
      return { ...state, firstNameError: action.payload };
    case "firstName":
      return { ...state, firstNameError: action.payload };
    case "lastName":
      return { ...state, lastNameError: action.payload };
    case "emailAddress":
      return { ...state, emailAddressError: action.payload };
    case "phoneNumber":
      return { ...state, phoneNumberError: action.payload };
    case "password":
      return { ...state, passwordError: action.payload };
    case "confirmPassword":
      return { ...state, confirmPasswordError: action.payload };
    case "updateProfile":
      return { ...state, updateProfileError: action.payload };
    default:
      throw new Error();
  }
}

type UpdateProfileFormPasswordVisibilityStatusType = {
  passwordVisibilityType: string;
  passwordVisibilityIcon: string;
  confirmPasswordVisibilityType: string;
  confirmPasswordVisibilityIcon: string;
};

type UpdateProfileFormPasswordVisibilityActionType = {
  name: string;
  type: string;
  icon: string;
};

const updateProfileFormPasswordVisibilityStatusInitialState = {
  passwordVisibilityType: "password",
  passwordVisibilityIcon: "bi-eye-slash-fill",
  confirmPasswordVisibilityType: "password",
  confirmPasswordVisibilityIcon: "bi-eye-slash-fill",
};

const passwordVisibilityStatusReducer = (
  state: UpdateProfileFormPasswordVisibilityStatusType,
  action: UpdateProfileFormPasswordVisibilityActionType
) => {
  switch (action.name) {
    case "password":
      return {
        ...state,
        passwordVisibilityType: action.type,
        passwordVisibilityIcon: action.icon,
      };
    case "confirmPassword":
      return {
        ...state,
        confirmPasswordVisibilityType: action.type,
        confirmPasswordVisibilityIcon: action.icon,
      };
    default:
      throw new Error();
  }
};

const inputInstructions = {
  userTypeInstructions:
    '<i className="bi bi-info-circle-fill"></i> Can be either Owner or Tenant',
  firstNameInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must be between 2 to 75 characters<br />Only letters allowed',
  lastNameInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must be between 2 to 75 characters<br />Only letters allowed',
  emailAddressInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must be between 3 to 150 characters<br />Letters, numbers and some special characters allowed<br />Allowed special characters: <span aria-label="at symbol">@</span> <span aria-label="dot symbol">.</span> <span aria-label="hyphen">-</span> <span aria-label="underscore symbol">_</span>',
  phoneNumberInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must be between 5 to 15 characters<br />Only numbers and one special character allowed<br />Allowed special character: <span aria-label="plus symbol">+</span>',
  passwordInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must contain at least 8 characters<br />Must contain at least 1 upper case letter<br />Must contain at least 1 lower case letter<br />Must contain at least 1 digit<br />Must contain at least 1 of the special characters: <span aria-label="exclamation symbol">!</span> <span aria-label="at symbol">@</span> <span aria-label="hash symbol">#</span> <span aria-label="dollar symbol">$</span> <span aria-label="percent symbol">%</span> <span aria-label="caret symbol">^</span> <span aria-label="ampersand symbol">&</span> <span aria-label="asterisk symbol">*</span> <span aria-label="hyphen symbol">-</span> <span aria-label="underscore symbol">_</span> <span aria-label="dot symbol">.</span> <span aria-label="question mark symbol">?</span>',
  confirmPasswordInstructions:
    '<i className="bi bi-info-circle-fill"></i> Must match with the password',
};

function UpdateProfileForm() {
  const { clearLogOutTimer } = useOutletContext<{
    isLogOutTimerActive: React.MutableRefObject<boolean>;
    clearLogOutTimer: () => void;
  }>();

  const loginSuccessStatusContext = useContext(LoginSuccessStatusContext);

  const getUserDetails = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_API_URL}/users/get`,
        {
          headers: {
            "Content-Type": "application/json",
            Token: localStorage.token,
          },
          withCredentials: true,
        }
      );
      if (response.data) {
        setUpdateProfileFormState({
          id: response.data.id,
          userType: response.data.userType,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          emailAddress: response.data.emailAddress,
          phoneNumber: response.data.phoneNumber,
          password: "",
          confirmPassword: "",
        });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error) {
          console.error(error);
          const errorMessage = error.response?.data
            ? error.response?.data.message
            : error.message;
          dispatchErrorMessage({
            type: "updateProfile",
            payload: errorMessage,
          });
        }
      }
      return null;
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  const [updateProfileFormState, setUpdateProfileFormState] =
    useState<UpdateProfileFormType>(updateProfileFormEmptyState);

  const [loadingIconState, setLoadingIconState] = useState(false);

  const userTypeInputRef = useRef<HTMLSelectElement | null>(null);

  const updateProfileErrorRef = useRef<HTMLParagraphElement | null>(null);
  const userTypeErrorRef = useRef<HTMLParagraphElement | null>(null);
  const firstNameErrorRef = useRef<HTMLParagraphElement | null>(null);
  const lastNameErrorRef = useRef<HTMLParagraphElement | null>(null);
  const phoneNumberErrorRef = useRef<HTMLParagraphElement | null>(null);
  const passwordErrorRef = useRef<HTMLParagraphElement | null>(null);
  const confirmPasswordErrorRef = useRef<HTMLParagraphElement | null>(null);

  const [userTypeInputStatus, dispatchUserTypeInputStatus] = useReducer(
    inputStatusReducer,
    updateProfileFormInputStatusInitialState
  );
  const [firstNameInputStatus, dispatchFirstNameInputStatus] = useReducer(
    inputStatusReducer,
    updateProfileFormInputStatusInitialState
  );
  const [lastNameInputStatus, dispatchLastNameInputStatus] = useReducer(
    inputStatusReducer,
    updateProfileFormInputStatusInitialState
  );
  const [emailAddressInputStatus, dispatchEmailAddressInputStatus] = useReducer(
    inputStatusReducer,
    updateProfileFormInputStatusInitialState
  );
  const [phoneNumberInputStatus, dispatchPhoneNumberInputStatus] = useReducer(
    inputStatusReducer,
    updateProfileFormInputStatusInitialState
  );
  const [passwordInputStatus, dispatchPasswordInputStatus] = useReducer(
    inputStatusReducer,
    updateProfileFormInputStatusInitialState
  );
  const [confirmPasswordInputStatus, dispatchConfirmPasswordInputStatus] =
    useReducer(inputStatusReducer, updateProfileFormInputStatusInitialState);

  const [passwordVisibilityStatus, dispatchPasswordVisibilityStatus] =
    useReducer(
      passwordVisibilityStatusReducer,
      updateProfileFormPasswordVisibilityStatusInitialState
    );

  const togglePasswordVisibilityStatus = (fieldName: string) => {
    if (
      (fieldName === "password" &&
        passwordVisibilityStatus.passwordVisibilityType === "password") ||
      (fieldName === "confirmPassword" &&
        passwordVisibilityStatus.confirmPasswordVisibilityType === "password")
    )
      dispatchPasswordVisibilityStatus({
        name: fieldName,
        type: "text",
        icon: "bi-eye-fill",
      });
    else if (
      (fieldName === "password" &&
        passwordVisibilityStatus.passwordVisibilityType === "text") ||
      (fieldName === "confirmPassword" &&
        passwordVisibilityStatus.confirmPasswordVisibilityType === "text")
    )
      dispatchPasswordVisibilityStatus({
        name: fieldName,
        type: "password",
        icon: "bi-eye-slash-fill",
      });
  };

  const [errorMessage, dispatchErrorMessage] = useReducer(
    errorReducer,
    updateProfileFormErrorsInitialState
  );

  useEffect(() => {
    userTypeInputRef.current?.focus();
  }, []);

  const userTypeRegEx = /^(Owner|Tenant|owner|tenant)$/;
  const nameRegEx = /^\s*([A-Za-z]{1,}([\.,] |[-']| )?)+[A-Za-z]+\.?\s*$/;
  const emailAddressRegEx =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const passwordRegEx =
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*\-_.?]).{8,50}$/;
  const phoneNumberRegEx = /^\+[1-9]{1}[0-9]{3,14}$/;

  const isUpdateButtonDisabled =
    !firstNameInputStatus.valid ||
    !lastNameInputStatus.valid ||
    !emailAddressInputStatus.valid ||
    !phoneNumberInputStatus.valid;

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setUpdateProfileFormState((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    const userTypeValidationResult = userTypeRegEx.test(
      updateProfileFormState.userType
    );
    dispatchUserTypeInputStatus({
      type: "valid",
      payload: userTypeValidationResult,
    });
  }, [updateProfileFormState.userType]);

  useEffect(() => {
    const firstNameValidationResult = nameRegEx.test(
      updateProfileFormState.firstName
    );
    dispatchFirstNameInputStatus({
      type: "valid",
      payload: firstNameValidationResult,
    });
  }, [updateProfileFormState.firstName]);

  useEffect(() => {
    const lastNameValidationResult = nameRegEx.test(
      updateProfileFormState.lastName
    );
    dispatchLastNameInputStatus({
      type: "valid",
      payload: lastNameValidationResult,
    });
  }, [updateProfileFormState.lastName]);

  useEffect(() => {
    const emailAddressValidationResult = emailAddressRegEx.test(
      updateProfileFormState.emailAddress
    );
    dispatchEmailAddressInputStatus({
      type: "valid",
      payload: emailAddressValidationResult,
    });
  }, [updateProfileFormState.emailAddress]);

  useEffect(() => {
    const phoneNumberValidationResult = phoneNumberRegEx.test(
      updateProfileFormState.phoneNumber
    );
    dispatchPhoneNumberInputStatus({
      type: "valid",
      payload: phoneNumberValidationResult,
    });
  }, [updateProfileFormState.phoneNumber]);

  useEffect(() => {
    const passwordValidationResult = passwordRegEx.test(
      updateProfileFormState.password
    );
    dispatchPasswordInputStatus({
      type: "valid",
      payload: passwordValidationResult,
    });
  }, [updateProfileFormState.password]);

  useEffect(() => {
    const confirmPasswordValidationResult =
      passwordRegEx.test(updateProfileFormState.confirmPassword) &&
      updateProfileFormState.confirmPassword === updateProfileFormState.password
        ? true
        : false;
    dispatchConfirmPasswordInputStatus({
      type: "valid",
      payload: confirmPasswordValidationResult,
    });
  }, [updateProfileFormState.confirmPassword]);

  useEffect(() => {
    dispatchErrorMessage({ type: "userType", payload: "" });
    dispatchErrorMessage({ type: "updateProfile", payload: "" });
  }, [updateProfileFormState.userType]);

  useEffect(() => {
    dispatchErrorMessage({ type: "firstName", payload: "" });
    dispatchErrorMessage({ type: "updateProfile", payload: "" });
  }, [updateProfileFormState.firstName]);

  useEffect(() => {
    dispatchErrorMessage({ type: "lastName", payload: "" });
    dispatchErrorMessage({ type: "updateProfile", payload: "" });
  }, [updateProfileFormState.lastName]);

  useEffect(() => {
    dispatchErrorMessage({ type: "emailAddress", payload: "" });
    dispatchErrorMessage({ type: "updateProfile", payload: "" });
  }, [updateProfileFormState.emailAddress]);

  useEffect(() => {
    dispatchErrorMessage({ type: "phoneNumber", payload: "" });
    dispatchErrorMessage({ type: "updateProfile", payload: "" });
  }, [updateProfileFormState.phoneNumber]);

  useEffect(() => {
    dispatchErrorMessage({ type: "password", payload: "" });
    dispatchErrorMessage({ type: "updateProfile", payload: "" });
  }, [updateProfileFormState.password]);

  useEffect(() => {
    dispatchErrorMessage({ type: "confirmPassword", payload: "" });
    dispatchErrorMessage({ type: "updateProfile", payload: "" });
  }, [updateProfileFormState.confirmPassword]);

  const navigate = useNavigate();
  const closeProfileForm = () => {
    navigate("..");
  };

  const [displayDeleteDialogBox, setDisplayDeleteDialogBox] = useState(false);

  const deleteUser = async () => {
    try {
      setDisplayDeleteDialogBox(false);
      const serverResponse = await axios.delete(
        `${process.env.REACT_APP_BACKEND_API_URL}/users/delete`,
        {
          headers: {
            "Content-Type": "application/json",
            Token: localStorage.token,
            ID: updateProfileFormState.id,
            UserType: localStorage.userType,
          },
          withCredentials: true,
        }
      );
      if (serverResponse.data.status === "User deleted") {
        toast.success("User deleted successfully");
        clearLogOutTimer();
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("showLikedProperties");
        if (localStorage.getItem("showOwnerProperties"))
          localStorage.removeItem("showOwnerProperties");
        loginSuccessStatusContext.dispatchLoginStatusState({
          type: LoginStatusActionType.SET_LOGGED_IN_STATUS,
          payload: false,
        });
        loginSuccessStatusContext.dispatchLoginStatusState({
          type: LoginStatusActionType.SET_LOGIN_USERNAME,
          payload: "",
        });
        loginSuccessStatusContext.dispatchLoginStatusState({
          type: LoginStatusActionType.SET_LOGIN_USERTYPE,
          payload: "",
        });
        navigate("../login", { replace: true });
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error) {
          console.error(error);
          const errorMessage = error.response?.data
            ? error.response?.data.message
            : error.message;
          dispatchErrorMessage({
            type: "updateProfile",
            payload: errorMessage,
          });
        }
      }
    }
  };

  const handleProfileUpdate = async (
    event: React.ChangeEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const userTypeValidation = (() => {
      if (updateProfileFormState.userType === "") {
        dispatchErrorMessage({
          type: "userType",
          payload: "User type cannot be empty",
        });
        dispatchUserTypeInputStatus({ type: "valid", payload: false });
      } else if (!userTypeRegEx.test(updateProfileFormState.userType)) {
        dispatchErrorMessage({
          type: "userType",
          payload: "Invalid first name",
        });
        dispatchUserTypeInputStatus({ type: "valid", payload: false });
      }
    })();
    const firstNameValidation = (() => {
      if (updateProfileFormState.firstName === "") {
        dispatchErrorMessage({
          type: "firstName",
          payload: "First name cannot be empty",
        });
        dispatchFirstNameInputStatus({ type: "valid", payload: false });
      } else if (!nameRegEx.test(updateProfileFormState.firstName)) {
        dispatchErrorMessage({
          type: "firstName",
          payload: "Invalid first name",
        });
        dispatchFirstNameInputStatus({ type: "valid", payload: false });
      }
    })();
    const lastNameValidation = (() => {
      if (updateProfileFormState.lastName === "") {
        dispatchErrorMessage({
          type: "lastName",
          payload: "Last name cannot be empty",
        });
        dispatchLastNameInputStatus({ type: "valid", payload: false });
      } else if (!nameRegEx.test(updateProfileFormState.lastName)) {
        dispatchErrorMessage({
          type: "lastName",
          payload: "Invalid last name",
        });
        dispatchLastNameInputStatus({ type: "valid", payload: false });
      }
    })();
    const emailAddressValidation = (() => {
      if (updateProfileFormState.emailAddress === "") {
        dispatchErrorMessage({
          type: "emailAddress",
          payload: "Email address cannot be empty",
        });
        dispatchEmailAddressInputStatus({ type: "valid", payload: false });
      } else if (!emailAddressRegEx.test(updateProfileFormState.emailAddress)) {
        dispatchErrorMessage({
          type: "emailAddress",
          payload: "Invalid email address",
        });
        dispatchEmailAddressInputStatus({ type: "valid", payload: false });
      }
    })();
    const phoneNumberValidation = (() => {
      if (updateProfileFormState.phoneNumber === "") {
        dispatchErrorMessage({
          type: "phoneNumber",
          payload: "Phone number cannot be empty",
        });
        dispatchPhoneNumberInputStatus({ type: "valid", payload: false });
      } else if (!phoneNumberRegEx.test(updateProfileFormState.phoneNumber)) {
        dispatchErrorMessage({
          type: "phoneNumber",
          payload: "Invalid phone number",
        });
        dispatchPhoneNumberInputStatus({ type: "valid", payload: false });
      }
    })();
    const passwordValidation = (() => {
      if (!passwordRegEx.test(updateProfileFormState.password)) {
        dispatchErrorMessage({ type: "password", payload: "Invalid password" });
        dispatchPasswordInputStatus({ type: "valid", payload: false });
      }
    })();
    const confirmPasswordValidation = (() => {
      if (
        !(
          passwordRegEx.test(updateProfileFormState.confirmPassword) &&
          updateProfileFormState.confirmPassword ===
            updateProfileFormState.password
        )
      ) {
        dispatchErrorMessage({
          type: "confirmPassword",
          payload: "Confirm password not matching with password",
        });
        dispatchConfirmPasswordInputStatus({ type: "valid", payload: false });
      }
    })();
    const isPasswordInputValid = updateProfileFormState.password
      ? passwordInputStatus.valid
      : true;
    const isConfirmPasswordInputValid = updateProfileFormState.confirmPassword
      ? confirmPasswordInputStatus.valid
      : true;
    if (
      !userTypeInputStatus.valid ||
      !firstNameInputStatus.valid ||
      !lastNameInputStatus.valid ||
      !phoneNumberInputStatus.valid ||
      !isPasswordInputValid ||
      !isConfirmPasswordInputValid
    ) {
      dispatchErrorMessage({ type: "updateProfile", payload: "Invalid data" });
      return;
    }
    if (
      userTypeInputStatus.valid &&
      firstNameInputStatus.valid &&
      lastNameInputStatus.valid &&
      phoneNumberInputStatus.valid &&
      isPasswordInputValid &&
      isConfirmPasswordInputValid
    ) {
      try {
        setLoadingIconState(true);
        const serverResponse = await axios.patch(
          `${process.env.REACT_APP_BACKEND_API_URL}/users/update`,
          JSON.stringify(updateProfileFormState),
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        const isUpdateSuccessful =
          serverResponse.data.status === "Update successful" ? true : false;
        if (
          isUpdateSuccessful &&
          serverResponse.data.userTypeUpdated === true &&
          serverResponse.data.newUserType !== localStorage.getItem("userType")
        ) {
          toast.success(
            "Profile details updated successfully. Please log in as the new user type."
          );
          clearLogOutTimer();
          localStorage.removeItem("token");
          localStorage.removeItem("userType");
          localStorage.removeItem("showLikedProperties");
          if (localStorage.getItem("showOwnerProperties"))
            localStorage.removeItem("showOwnerProperties");
          loginSuccessStatusContext.dispatchLoginStatusState({
            type: LoginStatusActionType.SET_LOGGED_IN_STATUS,
            payload: false,
          });
          loginSuccessStatusContext.dispatchLoginStatusState({
            type: LoginStatusActionType.SET_LOGIN_USERNAME,
            payload: "",
          });
          loginSuccessStatusContext.dispatchLoginStatusState({
            type: LoginStatusActionType.SET_LOGIN_USERTYPE,
            payload: "",
          });
          setLoadingIconState(false);
          navigate(`${"/" + serverResponse.data.newUserType}/login`, {
            replace: true,
          });
        } else if (
          isUpdateSuccessful &&
          serverResponse.data.userTypeUpdated === false
        ) {
          setLoadingIconState(false);
          getUserDetails();
          toast.success("Profile details updated successfully");
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error) {
            console.error(error);
            const errorMessage = error.response?.data
              ? error.response?.data.message
              : error.message;
            dispatchErrorMessage({
              type: "updateProfile",
              payload: errorMessage,
            });
            setLoadingIconState(false);
          }
        }
        updateProfileErrorRef.current?.focus();
      }
    }
  };

  return (
    <Fragment>
      <form
        className="update-profile-form"
        onSubmit={handleProfileUpdate}
        method="POST"
      >
        <h3 className="update-profile-form__heading">Update profile details</h3>
        <svg
          className="update-profile-form__button--close-form"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 20 20"
          xmlSpace="preserve"
          onClick={closeProfileForm}
        >
          <path d="M2,2 18,18 M18,2 2,18" stroke="#323232" strokeWidth={2} />
        </svg>
        {errorMessage.updateProfileError && (
          <p
            ref={updateProfileErrorRef}
            className="update-profile-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.updateProfileError}
          </p>
        )}
        <div className="update-profile-form__label-group">
          <label
            lang="en"
            className="update-profile-form__label"
            htmlFor="update-profile-form__user-type"
          >
            Choose your new user type:{" "}
          </label>
          <select
            id="update-profile-form__user-type"
            className={`update-profile-form__user-type ${
              updateProfileFormState.userType !== ""
                ? userTypeInputStatus.valid
                  ? "valid-input"
                  : "invalid-input"
                : ""
            }`}
            lang="en"
            name="userType"
            ref={userTypeInputRef}
            value={updateProfileFormState.userType}
            onChange={handleInputChange}
            onFocus={() =>
              dispatchUserTypeInputStatus({ type: "focus", payload: true })
            }
            onBlur={() =>
              dispatchUserTypeInputStatus({ type: "focus", payload: false })
            }
            required={true}
            autoComplete="off"
            aria-invalid={userTypeInputStatus.valid ? "false" : "true"}
            aria-describedby="update-profile-form__user-type-requirements"
          >
            <option value="Owner">Owner</option>
            <option value="Tenant">Tenant</option>
          </select>
          <p className="update-profile-form__user-type-warning">
            NOTE: If you change your user type from Owner to Tenant then all the
            properties posted by you as Owner will be deleted permanently.
          </p>
        </div>
        {updateProfileFormState.userType &&
          userTypeInputStatus.focused &&
          !userTypeInputStatus.valid && (
            <p
              id="update-profile-form__user-type-requirements"
              className="update-profile-form__show-instructions"
            >
              {parse(inputInstructions.userTypeInstructions)}
            </p>
          )}
        {errorMessage.userTypeError && (
          <p
            ref={userTypeErrorRef}
            className="update-profile-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.userTypeError}
          </p>
        )}
        <div className="update-profile-form__name-group">
          <div className="update-profile-form__name-floating-label-group">
            <input
              id="update-profile-form__first-name"
              className={`update-profile-form__first-name ${
                updateProfileFormState.firstName !== ""
                  ? firstNameInputStatus.valid
                    ? "valid-input"
                    : "invalid-input"
                  : ""
              }`}
              lang="en"
              name="firstName"
              type="text"
              maxLength={75}
              value={updateProfileFormState.firstName}
              onChange={handleInputChange}
              onFocus={() =>
                dispatchFirstNameInputStatus({ type: "focus", payload: true })
              }
              onBlur={() =>
                dispatchFirstNameInputStatus({ type: "focus", payload: false })
              }
              required={true}
              autoComplete="off"
              aria-invalid={firstNameInputStatus.valid ? "false" : "true"}
              aria-describedby="update-profile-form__first-name-requirements"
            />
            <label
              lang="en"
              className="update-profile-form__name-floating-label"
              htmlFor="update-profile-form__first-name"
            >
              Update your first name
            </label>
          </div>
          <div className="update-profile-form__name-floating-label-group">
            <input
              id="update-profile-form__last-name"
              className={`update-profile-form__last-name ${
                updateProfileFormState.lastName !== ""
                  ? lastNameInputStatus.valid
                    ? "valid-input"
                    : "invalid-input"
                  : ""
              }`}
              lang="en"
              name="lastName"
              type="text"
              maxLength={75}
              value={updateProfileFormState.lastName}
              onChange={handleInputChange}
              onFocus={() =>
                dispatchLastNameInputStatus({ type: "focus", payload: true })
              }
              onBlur={() =>
                dispatchLastNameInputStatus({ type: "focus", payload: false })
              }
              required={true}
              autoComplete="off"
              aria-invalid={lastNameInputStatus.valid ? "false" : "true"}
              aria-describedby="update-profile-form__last-name-requirements"
            />
            <label
              lang="en"
              className="update-profile-form__name-floating-label"
              htmlFor="update-profile-form__last-name"
            >
              Update your last name
            </label>
          </div>
        </div>
        {updateProfileFormState.firstName &&
          firstNameInputStatus.focused &&
          !firstNameInputStatus.valid && (
            <p
              id="update-profile-form__first-name-requirements"
              className="update-profile-form__show-instructions"
            >
              {parse(inputInstructions.firstNameInstructions)}
            </p>
          )}
        {updateProfileFormState.lastName &&
          lastNameInputStatus.focused &&
          !lastNameInputStatus.valid && (
            <p
              id="update-profile-form__last-name-requirements"
              className="update-profile-form__show-instructions"
            >
              {parse(inputInstructions.lastNameInstructions)}
            </p>
          )}
        {errorMessage.firstNameError && (
          <p
            ref={firstNameErrorRef}
            className="update-profile-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.firstNameError}
          </p>
        )}
        {errorMessage.lastNameError && (
          <p
            ref={lastNameErrorRef}
            className="update-profile-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.lastNameError}
          </p>
        )}
        <div className="update-profile-form__floating-label-group">
          <p className="update-profile-form__email-address">
            {updateProfileFormState.emailAddress}
          </p>
        </div>
        <div className="update-profile-form__floating-label-group">
          <input
            id="update-profile-form__phone-number"
            className={`update-profile-form__phone-number ${
              updateProfileFormState.phoneNumber !== ""
                ? phoneNumberInputStatus.valid
                  ? "valid-input"
                  : "invalid-input"
                : ""
            }`}
            lang="en"
            name="phoneNumber"
            type="text"
            maxLength={14}
            value={updateProfileFormState.phoneNumber}
            onChange={handleInputChange}
            onFocus={() =>
              dispatchPhoneNumberInputStatus({ type: "focus", payload: true })
            }
            onBlur={() =>
              dispatchPhoneNumberInputStatus({ type: "focus", payload: false })
            }
            required={true}
            autoComplete="off"
            aria-invalid={phoneNumberInputStatus.valid ? "false" : "true"}
            aria-describedby="update-profile-form__phone-number-requirements"
          />
          <label
            lang="en"
            className="update-profile-form__floating-label"
            htmlFor="update-profile-form__phone-number"
          >
            Update your phone number with country code
          </label>
        </div>
        {updateProfileFormState.phoneNumber &&
          phoneNumberInputStatus.focused &&
          !phoneNumberInputStatus.valid && (
            <p
              id="update-profile-form__phone-number-requirements"
              className="update-profile-form__show-instructions"
            >
              {parse(inputInstructions.phoneNumberInstructions)}
            </p>
          )}
        {errorMessage.phoneNumberError && (
          <p
            ref={phoneNumberErrorRef}
            className="update-profile-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.phoneNumberError}
          </p>
        )}
        <div className="update-profile-form__floating-label-group">
          <input
            id="update-profile-form__password"
            className={`update-profile-form__password ${
              updateProfileFormState.password !== ""
                ? passwordInputStatus.valid
                  ? "valid-input"
                  : "invalid-input"
                : ""
            }`}
            lang="en"
            name="password"
            type={passwordVisibilityStatus.passwordVisibilityType}
            maxLength={50}
            value={updateProfileFormState.password}
            onChange={handleInputChange}
            onFocus={() =>
              dispatchPasswordInputStatus({ type: "focus", payload: true })
            }
            onBlur={() =>
              dispatchPasswordInputStatus({ type: "focus", payload: false })
            }
            autoComplete="off"
            aria-invalid={passwordInputStatus.valid ? "false" : "true"}
            aria-describedby="update-profile-form__password-requirements"
          />
          <label
            lang="en"
            className="update-profile-form__floating-label"
            htmlFor="update-profile-form__password"
          >
            Enter new password to update your password
          </label>
          <span className="update-profile-form__password-visibility-icon">
            <i
              className={`bi ${passwordVisibilityStatus.passwordVisibilityIcon}`}
              onClick={() => togglePasswordVisibilityStatus("password")}
            ></i>
          </span>
        </div>
        {updateProfileFormState.password &&
          passwordInputStatus.focused &&
          !passwordInputStatus.valid && (
            <p
              id="update-profile-form__password-requirements"
              className="update-profile-form__show-instructions"
            >
              {parse(inputInstructions.passwordInstructions)}
            </p>
          )}
        {errorMessage.passwordError && (
          <p
            ref={passwordErrorRef}
            className="update-profile-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.passwordError}
          </p>
        )}
        <div className="update-profile-form__floating-label-group">
          <input
            id="update-profile-form__confirm-password"
            className={`update-profile-form__confirm-password ${
              updateProfileFormState.confirmPassword !== ""
                ? confirmPasswordInputStatus.valid
                  ? "valid-input"
                  : "invalid-input"
                : ""
            }`}
            lang="en"
            name="confirmPassword"
            type={passwordVisibilityStatus.confirmPasswordVisibilityType}
            maxLength={50}
            value={updateProfileFormState.confirmPassword}
            required={updateProfileFormState.password !== "" ? true : false}
            onChange={handleInputChange}
            onFocus={() =>
              dispatchConfirmPasswordInputStatus({
                type: "focus",
                payload: true,
              })
            }
            onBlur={() =>
              dispatchConfirmPasswordInputStatus({
                type: "focus",
                payload: false,
              })
            }
            autoComplete="off"
            aria-invalid={confirmPasswordInputStatus.valid ? "false" : "true"}
            aria-describedby="update-profile-form__confirm-password-requirements"
          />
          <label
            lang="en"
            className="update-profile-form__floating-label"
            htmlFor="update-profile-form__confirm-password"
          >
            Confirm new password
          </label>
          <span className="update-profile-form__password-visibility-icon">
            <i
              className={`bi ${passwordVisibilityStatus.confirmPasswordVisibilityIcon}`}
              onClick={() => togglePasswordVisibilityStatus("confirmPassword")}
            ></i>
          </span>
        </div>
        {updateProfileFormState.confirmPassword &&
          confirmPasswordInputStatus.focused &&
          !confirmPasswordInputStatus.valid && (
            <p
              id="update-profile-form__confirm-password-requirements"
              className="update-profile-form__show-instructions"
            >
              {parse(inputInstructions.confirmPasswordInstructions)}
            </p>
          )}
        {errorMessage.confirmPasswordError && (
          <p
            ref={confirmPasswordErrorRef}
            className="update-profile-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.confirmPasswordError}
          </p>
        )}
        {loadingIconState && (
          <div className="d-flex justify-content-center">
            <div
              className="spinner-border"
              style={{ width: "2rem", height: "2rem" }}
              role="status"
            >
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        )}
        <div className="update-profile-form__buttons-container">
          <button
            className={`update-profile-form__button update-profile-form__button--update ${
              isUpdateButtonDisabled ? "button-disabled" : ""
            }`}
            lang="en"
            name="update"
            type="submit"
            disabled={isUpdateButtonDisabled ? true : false}
          >
            <i></i>UPDATE
          </button>
          <button
            className={
              "update-profile-form__button update-profile-form__button--delete"
            }
            lang="en"
            name="update"
            type="button"
            onClick={() => setDisplayDeleteDialogBox(true)}
          >
            <i></i>DELETE ACCOUNT
          </button>
        </div>
      </form>
      {displayDeleteDialogBox && (
        <Fragment>
          <div
            className="modal show"
            style={{ display: "block" }}
            tabIndex={-1}
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Confirm deletion</h5>
                  <button
                    type="button"
                    className="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                    onClick={() => setDisplayDeleteDialogBox(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  Are you sure you want to permanently delete your account?
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                    onClick={() => setDisplayDeleteDialogBox(false)}
                  >
                    Cancel
                  </button>
                  <button className="btn btn-danger" onClick={deleteUser}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </Fragment>
      )}
    </Fragment>
  );
}

export default UpdateProfileForm;
