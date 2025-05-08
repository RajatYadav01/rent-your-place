import React, { Fragment, useEffect, useContext, useReducer, useRef, useState } from "react";
import parse from "html-react-parser";
import axios from "axios";
import { RegistrationSuccessStatusContext } from "./Form";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../dist/css/RegistrationForm.css";

type RegistrationFormType = {
    userType: string;
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber: string;
    password: string;
    confirmPassword: string;
}

type RegistrationFormInputStatusType = {
    valid: boolean;
    focused: boolean;
}

type RegistrationFormInputActionType = {
    type: string;
    payload: boolean;
}

const registrationFormInputStatusInitialState = {
    valid: true,
    focused: false
};

const inputStatusReducer = (state: RegistrationFormInputStatusType, action: RegistrationFormInputActionType) => {
    switch(action.type) {
        case "focus":
            return {...state, focused: action.payload};
        case "valid":
            return {...state, valid: action.payload};
        default:
            throw new Error();
    }
};

type RegistrationFormErrorsType = {
    userTypeError: string;
    firstNameError: string;
    lastNameError: string;
    emailAddressError: string;
    phoneNumberError: string;
    passwordError: string;
    confirmPasswordError: string;
    registrationError: string;
}

type RegistrationFormErrorsActionType = {
    type: string;
    payload: string;
}

const registrationFormErrorsInitialState = {
    userTypeError: "",
    firstNameError: "",
    lastNameError: "",
    emailAddressError: "",
    phoneNumberError: "",
    passwordError: "",
    confirmPasswordError: "",
    registrationError: ""
};

function errorReducer (state: RegistrationFormErrorsType, action: RegistrationFormErrorsActionType) {
    switch(action.type) {
        case "userType":
            return {...state, userTypeError: action.payload};
        case "firstName":
            return {...state, firstNameError: action.payload};
        case "lastName":
            return {...state, lastNameError: action.payload};
        case "emailAddress":
            return {...state, emailAddressError: action.payload};
        case "phoneNumber":
            return {...state, phoneNumberError: action.payload};
        case "password":
            return {...state, passwordError: action.payload};
        case "confirmPassword":
            return {...state, confirmPasswordError: action.payload};
        case "registration":
            return {...state, registrationError: action.payload};
        default:
            throw new Error();
    }
};

type RegistrationFormPasswordVisibilityStatusType = {
    passwordVisibilityType: string;
    passwordVisibilityIcon: string;
    confirmPasswordVisibilityType: string;
    confirmPasswordVisibilityIcon: string;
}

type RegistrationFormPasswordVisibilityActionType = {
    name: string;
    type: string;
    icon: string;
}

const registrationFormPasswordVisibilityStatusInitialState = {
    passwordVisibilityType: "password",
    passwordVisibilityIcon: "bi-eye-slash-fill",
    confirmPasswordVisibilityType: "password",
    confirmPasswordVisibilityIcon: "bi-eye-slash-fill"
};

const passwordVisibilityStatusReducer = (state: RegistrationFormPasswordVisibilityStatusType, action: RegistrationFormPasswordVisibilityActionType) => {
    switch(action.name) {
        case "password":
            return {...state, passwordVisibilityType: action.type, passwordVisibilityIcon: action.icon};
        case "confirmPassword":
            return {...state, confirmPasswordVisibilityType: action.type, confirmPasswordVisibilityIcon: action.icon};
        default:
            throw new Error();
    }
};

const inputInstructions = {
    userTypeInstructions: "<i className=\"bi bi-info-circle-fill\"></i> Can be either Owner or Tenant",
    firstNameInstructions: "<i className=\"bi bi-info-circle-fill\"></i> Must be between 2 to 75 characters<br />Only letters allowed",
    lastNameInstructions: "<i className=\"bi bi-info-circle-fill\"></i> Must be between 2 to 75 characters<br />Only letters allowed",
    emailAddressInstructions: "<i className=\"bi bi-info-circle-fill\"></i> Must be between 3 to 150 characters<br />Letters, numbers and some special characters allowed<br />Allowed special characters: <span aria-label=\"at symbol\">@</span> <span aria-label=\"dot symbol\">.</span> <span aria-label=\"hyphen\">-</span> <span aria-label=\"underscore symbol\">_</span>",
    phoneNumberInstructions: "<i className=\"bi bi-info-circle-fill\"></i> Must be between 5 to 15 characters<br />Only numbers and one special character allowed<br />Allowed special character: <span aria-label=\"plus symbol\">+</span>",
    passwordInstructions: "<i className=\"bi bi-info-circle-fill\"></i> Must contain at least 8 characters<br />Must contain at least 1 upper case letter<br />Must contain at least 1 lower case letter<br />Must contain at least 1 digit<br />Must contain at least 1 of the special characters: <span aria-label=\"exclamation symbol\">!</span> <span aria-label=\"at symbol\">@</span> <span aria-label=\"hash symbol\">#</span> <span aria-label=\"dollar symbol\">$</span> <span aria-label=\"percent symbol\">%</span> <span aria-label=\"caret symbol\">^</span> <span aria-label=\"ampersand symbol\">&</span> <span aria-label=\"asterisk symbol\">*</span> <span aria-label=\"hyphen symbol\">-</span> <span aria-label=\"underscore symbol\">_</span> <span aria-label=\"dot symbol\">.</span> <span aria-label=\"question mark symbol\">?</span>",
    confirmPasswordInstructions: "<i className=\"bi bi-info-circle-fill\"></i> Must match with the password"
};

function RegistrationForm() {
    const [registrationFormState, setRegistrationFormState] = useState<RegistrationFormType>({
        userType: "",
        firstName: "",
        lastName: "",
        emailAddress: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const [loadingIconState, setLoadingIconState] = useState(false);
    
    const userTypeInputRef = useRef<HTMLSelectElement | null>(null);

    const registrationErrorRef = useRef<HTMLParagraphElement | null>(null);
    const userTypeErrorRef = useRef<HTMLParagraphElement | null>(null);
    const firstNameErrorRef = useRef<HTMLParagraphElement | null>(null);
    const lastNameErrorRef = useRef<HTMLParagraphElement | null>(null);
    const emailAddressErrorRef = useRef<HTMLParagraphElement | null>(null);
    const phoneNumberErrorRef = useRef<HTMLParagraphElement | null>(null);
    const passwordErrorRef = useRef<HTMLParagraphElement | null>(null);
    const confirmPasswordErrorRef = useRef<HTMLParagraphElement | null>(null);

    const [userTypeInputStatus, dispatchUserTypeInputStatus] = useReducer(inputStatusReducer, registrationFormInputStatusInitialState);
    const [firstNameInputStatus, dispatchFirstNameInputStatus] = useReducer(inputStatusReducer, registrationFormInputStatusInitialState);
    const [lastNameInputStatus, dispatchLastNameInputStatus] = useReducer(inputStatusReducer, registrationFormInputStatusInitialState);
    const [emailAddressInputStatus, dispatchEmailAddressInputStatus] = useReducer(inputStatusReducer, registrationFormInputStatusInitialState);
    const [phoneNumberInputStatus, dispatchPhoneNumberInputStatus] = useReducer(inputStatusReducer, registrationFormInputStatusInitialState);
    const [passwordInputStatus, dispatchPasswordInputStatus] = useReducer(inputStatusReducer, registrationFormInputStatusInitialState);
    const [confirmPasswordInputStatus, dispatchConfirmPasswordInputStatus] = useReducer(inputStatusReducer, registrationFormInputStatusInitialState);

    const [passwordVisibilityStatus, dispatchPasswordVisibilityStatus] = useReducer(passwordVisibilityStatusReducer, registrationFormPasswordVisibilityStatusInitialState);

    const togglePasswordVisibilityStatus = (fieldName: string) => {
        if ((fieldName === "password" && passwordVisibilityStatus.passwordVisibilityType === "password") || (fieldName === "confirmPassword" && passwordVisibilityStatus.confirmPasswordVisibilityType === "password"))
            dispatchPasswordVisibilityStatus({name: fieldName, type: "text", icon: "bi-eye-fill"});
        else if ((fieldName === "password" && passwordVisibilityStatus.passwordVisibilityType === "text") || (fieldName === "confirmPassword" && passwordVisibilityStatus.confirmPasswordVisibilityType === "text"))
            dispatchPasswordVisibilityStatus({name: fieldName, type: "password", icon: "bi-eye-slash-fill"});
    }
    
    const [errorMessage, dispatchErrorMessage] = useReducer(errorReducer, registrationFormErrorsInitialState);

    useEffect(() => {
        userTypeInputRef.current?.focus();
    }, []);

    const userTypeRegEx = /^(Owner|Tenant|owner|tenant)$/;
    const nameRegEx = /^\s*([A-Za-z]{1,}([\.,] |[-']| )?)+[A-Za-z]+\.?\s*$/;
    const emailAddressRegEx = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const passwordRegEx = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*\-_.?]).{8,50}$/;
    const phoneNumberRegEx = /^\+[1-9]{1}[0-9]{3,14}$/;

    const isRegisterButtonDisabled = !firstNameInputStatus.valid || !lastNameInputStatus.valid || !emailAddressInputStatus.valid || !phoneNumberInputStatus.valid || !passwordInputStatus.valid || !confirmPasswordInputStatus.valid;

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setRegistrationFormState(prevFormData => ({
            ...prevFormData, [event.target.name]: event.target.value 
        }));
    }

    useEffect(() => {
        const userTypeValidationResult = userTypeRegEx.test(registrationFormState.userType);
        dispatchUserTypeInputStatus({type: "valid", payload: userTypeValidationResult});
    }, [registrationFormState.userType]);

    useEffect(() => {
        const firstNameValidationResult = nameRegEx.test(registrationFormState.firstName);
        dispatchFirstNameInputStatus({type: "valid", payload: firstNameValidationResult});
    }, [registrationFormState.firstName]);

    useEffect(() => {
        const lastNameValidationResult = nameRegEx.test(registrationFormState.lastName);
        dispatchLastNameInputStatus({type: "valid", payload: lastNameValidationResult});
    }, [registrationFormState.lastName]);
     
    useEffect(() => {
        const emailAddressValidationResult = emailAddressRegEx.test(registrationFormState.emailAddress);
        dispatchEmailAddressInputStatus({type: "valid", payload: emailAddressValidationResult});
    }, [registrationFormState.emailAddress]);
 
    useEffect(() => {
       const phoneNumberValidationResult = phoneNumberRegEx.test(registrationFormState.phoneNumber);
       dispatchPhoneNumberInputStatus({type: "valid", payload: phoneNumberValidationResult});
    }, [registrationFormState.phoneNumber]);

    useEffect(() => {
        const passwordValidationResult = passwordRegEx.test(registrationFormState.password);
        dispatchPasswordInputStatus({type: "valid", payload: passwordValidationResult});
    }, [registrationFormState.password]);

    useEffect(() => {
        const confirmPasswordValidationResult = (passwordRegEx.test(registrationFormState.confirmPassword) && registrationFormState.confirmPassword === registrationFormState.password) ? true : false;
        dispatchConfirmPasswordInputStatus({type: "valid", payload: confirmPasswordValidationResult});
    }, [registrationFormState.password, registrationFormState.confirmPassword]);

    useEffect(() => {
        dispatchErrorMessage({type: "userType", payload: ""});
        dispatchErrorMessage({type: "registration", payload: ""});
    }, [registrationFormState.userType]);

    useEffect(() => {
        dispatchErrorMessage({type: "firstName", payload: ""});
        dispatchErrorMessage({type: "registration", payload: ""});
    }, [registrationFormState.firstName]);

    useEffect(() => {
        dispatchErrorMessage({type: "lastName", payload: ""});
        dispatchErrorMessage({type: "registration", payload: ""});
    }, [registrationFormState.lastName]);

    useEffect(() => {
        dispatchErrorMessage({type: "emailAddress", payload: ""});
        dispatchErrorMessage({type: "registration", payload: ""});
    }, [registrationFormState.emailAddress]);
    
    useEffect(() => {
        dispatchErrorMessage({type: "phoneNumber", payload: ""});
        dispatchErrorMessage({type: "registration", payload: ""});
    }, [registrationFormState.phoneNumber]);

    useEffect(() => {
        dispatchErrorMessage({type: "password", payload: ""});
        dispatchErrorMessage({type: "registration", payload: ""});
    }, [registrationFormState.password]);

    useEffect(() => {
        dispatchErrorMessage({type: "confirmPassword", payload: ""});
        dispatchErrorMessage({type: "registration", payload: ""});
    }, [registrationFormState.confirmPassword]);

    const registrationSuccessStatusContext = useContext(RegistrationSuccessStatusContext);

    const handleRegistration = async (event: React.ChangeEvent<HTMLFormElement>) => {
        event.preventDefault();
        const userTypeValidation = (() => {
            if (registrationFormState.userType === "") {
                dispatchErrorMessage({type: "userType", payload: "User type cannot be empty"}); 
                dispatchUserTypeInputStatus({type: "valid", payload: false});
            } else if (!userTypeRegEx.test(registrationFormState.userType)) {
                dispatchErrorMessage({type: "userType", payload: "Invalid first name"});
                dispatchUserTypeInputStatus({type: "valid", payload: false});
            }
        })();
        const firstNameValidation = (() => {
            if (registrationFormState.firstName === "") {
                dispatchErrorMessage({type: "firstName", payload: "First name cannot be empty."}); 
                dispatchFirstNameInputStatus({type: "valid", payload: false});
            } else if (!nameRegEx.test(registrationFormState.firstName)) {
                dispatchErrorMessage({type: "firstName", payload: "Invalid first name."});
                dispatchFirstNameInputStatus({type: "valid", payload: false});
            }
        })();
        const lastNameValidation = (() => { 
            if (registrationFormState.lastName === "") {
                dispatchErrorMessage({type: "lastName", payload: "Last name cannot be empty."});
                dispatchLastNameInputStatus({type: "valid", payload: false});
            } else if (!nameRegEx.test(registrationFormState.lastName)) {
                dispatchErrorMessage({type: "lastName", payload: "Invalid last name."});
                dispatchLastNameInputStatus({type: "valid", payload: false});
            }
        })();
        const emailAddressValidation = (() => { 
            if (registrationFormState.emailAddress === "") {
                dispatchErrorMessage({type: "emailAddress", payload: "Email address cannot be empty."});
                dispatchEmailAddressInputStatus({type: "valid", payload: false});
            } else if (!emailAddressRegEx.test(registrationFormState.emailAddress)) {
                dispatchErrorMessage({type: "emailAddress", payload: "Invalid email address."});
                dispatchEmailAddressInputStatus({type: "valid", payload: false});
            }
        })();
        const phoneNumberValidation = (() => { 
            if (registrationFormState.phoneNumber === "") {
                dispatchErrorMessage({type: "phoneNumber", payload: "Phone number cannot be empty."});
                dispatchPhoneNumberInputStatus({type: "valid", payload: false});
            } else if (!phoneNumberRegEx.test(registrationFormState.phoneNumber)) {
                dispatchErrorMessage({type: "phoneNumber", payload: "Invalid phone number."});
                dispatchPhoneNumberInputStatus({type: "valid", payload: false});
            }
        })();
        const passwordValidation = (() => { 
            if (registrationFormState.password === "") {
                dispatchErrorMessage({type: "password", payload: "Password cannot be empty."});
                dispatchPasswordInputStatus({type: "valid", payload: false});
            } else if (!passwordRegEx.test(registrationFormState.password)) {
                dispatchErrorMessage({type: "password", payload: "Invalid password."});
                dispatchPasswordInputStatus({type: "valid", payload: false});
            }
        })();
        const confirmPasswordValidation = (() => { 
            if (registrationFormState.confirmPassword === "") {
                dispatchErrorMessage({type: "confirmPassword", payload: "Confirm password cannot be empty."});
                dispatchConfirmPasswordInputStatus({type: "valid", payload: false});
            } else if (!(passwordRegEx.test(registrationFormState.confirmPassword) && registrationFormState.confirmPassword === registrationFormState.password)) {
                dispatchErrorMessage({type: "confirmPassword", payload: "Confirm password not matching with password."});
                dispatchConfirmPasswordInputStatus({type: "valid", payload: false});
            }
        })();
        if (!userTypeInputStatus.valid || !firstNameInputStatus.valid || !lastNameInputStatus.valid || !emailAddressInputStatus.valid || !phoneNumberInputStatus.valid || !passwordInputStatus.valid || !confirmPasswordInputStatus.valid) {
            dispatchErrorMessage({type: "registration", payload: "Invalid data"});
            return;
        }
        if (userTypeInputStatus.valid && firstNameInputStatus.valid && lastNameInputStatus.valid && emailAddressInputStatus.valid && phoneNumberInputStatus.valid && passwordInputStatus.valid && confirmPasswordInputStatus.valid) {
            try {
                setLoadingIconState(true);
                const serverResponse = await axios.post("http://localhost:3050/api/users/new", JSON.stringify(registrationFormState), 
                    {
                        headers: {"Content-Type": "application/json"},
                        withCredentials: true
                    }
                );
                const isRegistrationSuccessful = serverResponse.data.status === "Registration successful" ? true : false;
                registrationSuccessStatusContext.setRegistrationSuccessState(isRegistrationSuccessful);
                setLoadingIconState(false);
            } catch (error: unknown) {
                if (axios.isAxiosError(error)) { 
                    if (error) {
                        console.error(error);
                        const errorMessage = error.response?.data ? error.response?.data.message : error.message;
                        dispatchErrorMessage({type: "registration", payload: errorMessage});
                        setLoadingIconState(false);
                    }
                }
                registrationErrorRef.current?.focus();
            }
        }
    }

    return (
        <Fragment>
            {errorMessage.registrationError && <p ref={registrationErrorRef} className="registration-form__show-error" aria-live="assertive">{errorMessage.registrationError}</p>}
            <form className="registration-form" onSubmit = {handleRegistration} method="POST">
            <div className="registration-form__label-group">
                    <label lang="en" className="registration-form__label" htmlFor="registration-form__user-type">Choose user type: </label>
                    <select 
                        id="registration-form__user-type" 
                        className={`registration-form__user-type ${registrationFormState.userType !== "" ? (userTypeInputStatus.valid ? "valid-input" : "invalid-input") : ""}`} 
                        lang="en" 
                        name="userType" 
                        ref={userTypeInputRef}
                        value={registrationFormState.userType} 
                        onChange={handleInputChange} 
                        onFocus={() => dispatchUserTypeInputStatus({type: "focus", payload: true})} 
                        onBlur={() => dispatchUserTypeInputStatus({type: "focus", payload: false})} 
                        required={true}
                        autoComplete="off"
                        aria-invalid={userTypeInputStatus.valid ? "false" : "true"} 
                        aria-describedby="registration-form__user-type-requirements">
                            <option value="">Select an option</option>
                            <option value="Owner">Owner</option>
                            <option value="Tenant">Tenant</option>
                    </select>
                </div>
                {registrationFormState.userType && userTypeInputStatus.focused && !userTypeInputStatus.valid && <p id="registration-form__user-type-requirements" className="registration-form__show-instructions">{parse(inputInstructions.userTypeInstructions)}</p>}
                {errorMessage.userTypeError && <p ref={userTypeErrorRef} className="registration-form__show-error" aria-live="assertive">{errorMessage.userTypeError}</p>}
                <div className="registration-form__name-group">
                    <div className="registration-form__name-floating-label-group">
                        <input 
                            id="registration-form__first-name"
                            className={`registration-form__first-name ${registrationFormState.firstName !== "" ? (firstNameInputStatus.valid ? "valid-input" : "invalid-input") : ""}`} 
                            lang="en" 
                            name="firstName" 
                            type="text" 
                            maxLength={75}
                            value={registrationFormState.firstName} 
                            onChange={handleInputChange}
                            onFocus={() => dispatchFirstNameInputStatus({type: "focus", payload: true})}
                            onBlur={() => dispatchFirstNameInputStatus({type: "focus", payload: false})}
                            required={true}
                            autoComplete="off"
                            aria-invalid={firstNameInputStatus.valid ? "false" : "true"} 
                            aria-describedby="registration-form__first-name-requirements" />
                        <label lang="en" className="registration-form__name-floating-label" htmlFor="registration-form__first-name">Enter your first name</label>
                    </div>
                    <div className="registration-form__name-floating-label-group">    
                        <input 
                            id="registration-form__last-name"
                            className={`registration-form__last-name ${registrationFormState.lastName !== "" ? (lastNameInputStatus.valid ? "valid-input" : "invalid-input") : ""}`} 
                            lang="en" 
                            name="lastName" 
                            type="text" 
                            maxLength={75} 
                            value={registrationFormState.lastName} 
                            onChange={handleInputChange}
                            onFocus={() => dispatchLastNameInputStatus({type: "focus", payload: true})}
                            onBlur={() => dispatchLastNameInputStatus({type: "focus", payload: false})}
                            required={true}
                            autoComplete="off" 
                            aria-invalid={lastNameInputStatus.valid ? "false" : "true"} 
                            aria-describedby="registration-form__last-name-requirements" />
                        <label lang="en" className="registration-form__name-floating-label" htmlFor="registration-form__last-name">Enter your last name</label>
                    </div>
                </div>
                {(registrationFormState.firstName && firstNameInputStatus.focused && !firstNameInputStatus.valid) && <p id="registration-form__first-name-requirements" className="registration-form__show-instructions">{parse(inputInstructions.firstNameInstructions)}</p>}
                {(registrationFormState.lastName && lastNameInputStatus.focused && !lastNameInputStatus.valid) && <p id="registration-form__last-name-requirements" className="registration-form__show-instructions">{parse(inputInstructions.lastNameInstructions)}</p>}
                {errorMessage.firstNameError && <p ref={firstNameErrorRef} className="registration-form__show-error" aria-live="assertive">{errorMessage.firstNameError}</p>}
                {errorMessage.lastNameError && <p ref={lastNameErrorRef} className="registration-form__show-error" aria-live="assertive">{errorMessage.lastNameError}</p>}
                <div className="registration-form__floating-label-group">
                    <input 
                        id="registration-form__email-address" 
                        className={`registration-form__email-address ${registrationFormState.emailAddress !== "" ? (emailAddressInputStatus.valid ? "valid-input" : "invalid-input") : ""}`} 
                        lang="en" 
                        name="emailAddress"  
                        type="email" 
                        maxLength={150} 
                        value={registrationFormState.emailAddress} 
                        onChange={handleInputChange}
                        onFocus={() => dispatchEmailAddressInputStatus({type: "focus", payload: true})}
                        onBlur={() => dispatchEmailAddressInputStatus({type: "focus", payload: false})}
                        required={true}
                        autoComplete="off"
                        aria-invalid={emailAddressInputStatus.valid ? "false" : "true"} 
                        aria-describedby="registration-form__email-address-requirements" />
                    <label lang="en" className="registration-form__floating-label" htmlFor="registration-form__email-address">Enter your email address</label>
                </div>
                {(registrationFormState.emailAddress && emailAddressInputStatus.focused && !emailAddressInputStatus.valid) && <p id="registration-form__email-address-requirements" className="registration-form__show-instructions">{parse(inputInstructions.emailAddressInstructions)}</p>}
                {errorMessage.emailAddressError && <p ref={emailAddressErrorRef} className="registration-form__show-error" aria-live="assertive">{errorMessage.emailAddressError}</p>}
                <div className="registration-form__floating-label-group">
                    <input 
                        id="registration-form__phone-number" 
                        className={`registration-form__phone-number ${registrationFormState.phoneNumber !== "" ? (phoneNumberInputStatus.valid ? "valid-input" : "invalid-input") : ""}`} 
                        lang="en" 
                        name="phoneNumber" 
                        type="text" 
                        maxLength={14} 
                        value={registrationFormState.phoneNumber} 
                        onChange={handleInputChange} 
                        onFocus={() => dispatchPhoneNumberInputStatus({type: "focus", payload: true})} 
                        onBlur={() => dispatchPhoneNumberInputStatus({type: "focus", payload: false})} 
                        required={true}
                        autoComplete="off"
                        aria-invalid={phoneNumberInputStatus.valid ? "false" : "true"} 
                        aria-describedby="registration-form__phone-number-requirements" />
                    <label lang="en" className="registration-form__floating-label" htmlFor="registration-form__phone-number">Enter your phone number with country code</label>
                </div>
                {(registrationFormState.phoneNumber && phoneNumberInputStatus.focused && !phoneNumberInputStatus.valid) && <p id="registration-form__phone-number-requirements" className="registration-form__show-instructions">{parse(inputInstructions.phoneNumberInstructions)}</p>}
                {errorMessage.phoneNumberError && <p ref={phoneNumberErrorRef} className="registration-form__show-error" aria-live="assertive">{errorMessage.phoneNumberError}</p>}	
                <div className="registration-form__floating-label-group">
                    <input 
                        id="registration-form__password" 
                        className={`registration-form__password ${registrationFormState.password !== "" ? (passwordInputStatus.valid ? "valid-input" : "invalid-input") : ""}`} 
                        lang="en" 
                        name="password" 
                        type={passwordVisibilityStatus.passwordVisibilityType} 
                        maxLength={50} 
                        value={registrationFormState.password} 
                        onChange={handleInputChange} 
                        onFocus={() => dispatchPasswordInputStatus({type: "focus", payload: true})} 
                        onBlur={() => dispatchPasswordInputStatus({type: "focus", payload: false})} 
                        required={true}
                        autoComplete="off"
                        aria-invalid={passwordInputStatus.valid ? "false" : "true"} 
                        aria-describedby="registration-form__password-requirements" />
                    <label lang="en" className="registration-form__floating-label" htmlFor="registration-form__password">Create new password</label>
                    <span className="registration-form__password-visibility-icon"><i className={`bi ${passwordVisibilityStatus.passwordVisibilityIcon}`} onClick={() => togglePasswordVisibilityStatus("password")}></i></span>
                </div>
                {(registrationFormState.password && passwordInputStatus.focused && !passwordInputStatus.valid) && <p id="registration-form__password-requirements" className="registration-form__show-instructions">{parse(inputInstructions.passwordInstructions)}</p>}
                {errorMessage.passwordError && <p ref={passwordErrorRef} className="registration-form__show-error" aria-live="assertive">{errorMessage.passwordError}</p>}
                <div className="registration-form__floating-label-group">
                    <input 
                        id="registration-form__confirm-password" 
                        className={`registration-form__confirm-password ${registrationFormState.confirmPassword !== "" ? (confirmPasswordInputStatus.valid ? "valid-input" : "invalid-input") : ""}`} 
                        lang="en" 
                        name="confirmPassword" 
                        type={passwordVisibilityStatus.confirmPasswordVisibilityType} 
                        maxLength={50} 
                        value={registrationFormState.confirmPassword} 
                        onChange={handleInputChange} 
                        onFocus={() => dispatchConfirmPasswordInputStatus({type: "focus", payload: true})} 
                        onBlur={() => dispatchConfirmPasswordInputStatus({type: "focus", payload: false})} 
                        required={true}
                        autoComplete="off"
                        aria-invalid={confirmPasswordInputStatus.valid ? "false" : "true"} 
                        aria-describedby="registration-form__confirm-password-requirements" />
                    <label lang="en" className="registration-form__floating-label" htmlFor="registration-form__confirm-password">Confirm password</label>
                    <span className="registration-form__password-visibility-icon"><i className={`bi ${passwordVisibilityStatus.confirmPasswordVisibilityIcon}`} onClick={() => togglePasswordVisibilityStatus("confirmPassword")}></i></span>
                </div>
                {(registrationFormState.confirmPassword && confirmPasswordInputStatus.focused && !confirmPasswordInputStatus.valid) && <p id="registration-form__confirm-password-requirements" className="registration-form__show-instructions">{parse(inputInstructions.confirmPasswordInstructions)}</p>}
                {errorMessage.confirmPasswordError && <p ref={confirmPasswordErrorRef} className="registration-form__show-error" aria-live="assertive">{errorMessage.confirmPasswordError}</p>}
                {loadingIconState && (<div className="d-flex justify-content-center">
                    <div className="spinner-border" style={{width: "2rem", height: "2rem"}} role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>)}
                <button className={`registration-form__button--register ${isRegisterButtonDisabled ? "button-disabled" : ""}`} lang="en" name="register" type="submit" disabled={isRegisterButtonDisabled ? true : false}><i></i>REGISTER</button>
            </form>
        </Fragment>
    );
}

export default RegistrationForm