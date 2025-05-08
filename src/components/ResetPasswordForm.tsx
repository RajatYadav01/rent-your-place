import React, {
  Fragment,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../dist/css/ResetPasswordForm.css";

type ResetPasswordFromPropsType = {
  setIsPasswordResetSuccessful: React.Dispatch<React.SetStateAction<boolean>>;
};

type ResetPasswordFormType = {
  emailAddress: string;
  password: string;
  confirmPassword: string;
};

type ResetPasswordFormErrorsType = {
  emailAddressError: string;
  passwordError: string;
  confirmPasswordError: string;
  resetPasswordError: string;
};

type ResetPasswordFormErrorsActionType = {
  type: string;
  payload: string;
};

type ResetPasswordFormInputStatusType = {
  valid: boolean;
  focused: boolean;
};

type ResetPasswordFormInputActionType = {
  type: string;
  payload: boolean;
};

const resetPasswordFormInputStatusInitialState = {
  valid: true,
  focused: false,
};

const inputStatusReducer = (
  state: ResetPasswordFormInputStatusType,
  action: ResetPasswordFormInputActionType
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

const resetPasswordFormErrorsInitialState = {
  emailAddressError: "",
  passwordError: "",
  confirmPasswordError: "",
  resetPasswordError: "",
};

const errorReducer = (
  state: ResetPasswordFormErrorsType,
  action: ResetPasswordFormErrorsActionType
) => {
  switch (action.type) {
    case "emailAddress":
      return { ...state, emailAddressError: action.payload };
    case "password":
      return { ...state, passwordError: action.payload };
    case "confirmPassword":
      return { ...state, confirmPasswordError: action.payload };
    case "resetPassword":
      return { ...state, resetPasswordError: action.payload };
    default:
      throw new Error();
  }
};

type ResetPasswordFormPasswordVisibilityStatusType = {
  passwordVisibilityType: string;
  passwordVisibilityIcon: string;
  confirmPasswordVisibilityType: string;
  confirmPasswordVisibilityIcon: string;
};

type ResetPasswordFormPasswordVisibilityActionType = {
  name: string;
  type: string;
  icon: string;
};

const resetPasswordFormPasswordVisibilityStatusInitialState = {
  passwordVisibilityType: "password",
  passwordVisibilityIcon: "bi-eye-slash-fill",
  confirmPasswordVisibilityType: "password",
  confirmPasswordVisibilityIcon: "bi-eye-slash-fill",
};

const passwordVisibilityStatusReducer = (
  state: ResetPasswordFormPasswordVisibilityStatusType,
  action: ResetPasswordFormPasswordVisibilityActionType
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

function ResetPasswordForm(props: ResetPasswordFromPropsType) {
  const [resetPasswordFormState, setResetPasswordFormState] =
    useState<ResetPasswordFormType>({
      emailAddress: "",
      password: "",
      confirmPassword: "",
    });

  const [loadingIconState, setLoadingIconState] = useState(false);

  const emailAddressInputRef = useRef<HTMLInputElement | null>(null);

  const resetPasswordErrorRef = useRef<HTMLParagraphElement | null>(null);
  const emailAddressErrorRef = useRef<HTMLParagraphElement | null>(null);
  const passwordErrorRef = useRef<HTMLParagraphElement | null>(null);
  const confirmPasswordErrorRef = useRef<HTMLParagraphElement | null>(null);

  const [emailAddressInputStatus, dispatchEmailAddressInputStatus] = useReducer(
    inputStatusReducer,
    resetPasswordFormInputStatusInitialState
  );
  const [passwordInputStatus, dispatchPasswordInputStatus] = useReducer(
    inputStatusReducer,
    resetPasswordFormInputStatusInitialState
  );
  const [confirmPasswordInputStatus, dispatchConfirmPasswordInputStatus] =
    useReducer(inputStatusReducer, resetPasswordFormInputStatusInitialState);

  const [passwordVisibilityStatus, dispatchPasswordVisibilityStatus] =
    useReducer(
      passwordVisibilityStatusReducer,
      resetPasswordFormPasswordVisibilityStatusInitialState
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
    resetPasswordFormErrorsInitialState
  );

  useEffect(() => {
    emailAddressInputRef.current?.focus();
  }, []);

  const emailAddressRegEx =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const passwordRegEx =
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*\-_.?]).{8,50}$/;

  const isResetPasswordButtonDisabled =
    !emailAddressInputStatus.valid ||
    !passwordInputStatus.valid ||
    !confirmPasswordInputStatus.valid;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResetPasswordFormState((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    const emailAddressValidationResult = emailAddressRegEx.test(
      resetPasswordFormState.emailAddress
    );
    dispatchEmailAddressInputStatus({
      type: "valid",
      payload: emailAddressValidationResult,
    });
  }, [resetPasswordFormState.emailAddress]);

  useEffect(() => {
    const passwordValidationResult = passwordRegEx.test(
      resetPasswordFormState.password
    );
    dispatchPasswordInputStatus({
      type: "valid",
      payload: passwordValidationResult,
    });
  }, [resetPasswordFormState.password]);

  useEffect(() => {
    const confirmPasswordValidationResult =
      passwordRegEx.test(resetPasswordFormState.confirmPassword) &&
      resetPasswordFormState.confirmPassword === resetPasswordFormState.password
        ? true
        : false;
    dispatchConfirmPasswordInputStatus({
      type: "valid",
      payload: confirmPasswordValidationResult,
    });
  }, [resetPasswordFormState.password, resetPasswordFormState.confirmPassword]);

  useEffect(() => {
    dispatchErrorMessage({ type: "emailAddress", payload: "" });
    dispatchErrorMessage({ type: "resetPassword", payload: "" });
  }, [resetPasswordFormState.emailAddress]);

  useEffect(() => {
    dispatchErrorMessage({ type: "password", payload: "" });
    dispatchErrorMessage({ type: "resetPassword", payload: "" });
  }, [resetPasswordFormState.password]);

  useEffect(() => {
    dispatchErrorMessage({ type: "confirmPassword", payload: "" });
    dispatchErrorMessage({ type: "resetPassword", payload: "" });
  }, [resetPasswordFormState.confirmPassword]);

  const handleResetPassword = async (
    event: React.ChangeEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const emailAddressValidation = (() => {
      if (resetPasswordFormState.emailAddress === "") {
        dispatchErrorMessage({
          type: "emailAddress",
          payload: "Email address cannot be empty.",
        });
        dispatchEmailAddressInputStatus({ type: "valid", payload: false });
      } else if (!emailAddressRegEx.test(resetPasswordFormState.emailAddress)) {
        dispatchErrorMessage({
          type: "emailAddress",
          payload: "Invalid email address.",
        });
        dispatchEmailAddressInputStatus({ type: "valid", payload: false });
      }
    })();
    const passwordValidation = (() => {
      if (resetPasswordFormState.password === "") {
        dispatchErrorMessage({
          type: "password",
          payload: "Phone number cannot be empty.",
        });
        dispatchPasswordInputStatus({ type: "valid", payload: false });
      } else if (!passwordRegEx.test(resetPasswordFormState.password)) {
        dispatchErrorMessage({
          type: "password",
          payload: "Invalid phone number.",
        });
        dispatchPasswordInputStatus({ type: "valid", payload: false });
      }
    })();
    const confirmPasswordValidation = (() => {
      if (resetPasswordFormState.confirmPassword === "") {
        dispatchErrorMessage({
          type: "confirmPassword",
          payload: "Confirm password cannot be empty.",
        });
        dispatchConfirmPasswordInputStatus({ type: "valid", payload: false });
      } else if (
        !(
          passwordRegEx.test(resetPasswordFormState.confirmPassword) &&
          resetPasswordFormState.confirmPassword ===
            resetPasswordFormState.password
        )
      ) {
        dispatchErrorMessage({
          type: "confirmPassword",
          payload: "Confirm password not matching with password.",
        });
        dispatchConfirmPasswordInputStatus({ type: "valid", payload: false });
      }
    })();
    if (
      !emailAddressInputStatus.valid ||
      !passwordInputStatus.valid ||
      !confirmPasswordInputStatus.valid
    ) {
      dispatchErrorMessage({ type: "resetPassword", payload: "Invalid data" });
      return;
    }
    if (
      emailAddressInputStatus.valid &&
      passwordInputStatus.valid &&
      confirmPasswordInputStatus.valid
    ) {
      try {
        setLoadingIconState(true);
        const serverResponse = await axios.patch(
          "http://localhost:3050/api/users/resetPassword",
          JSON.stringify(resetPasswordFormState),
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        if (serverResponse.data.status === "Password reset successful") {
          setLoadingIconState(false);
          props.setIsPasswordResetSuccessful(true);
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error) {
            console.error(error);
            const errorMessage = error.response?.data
              ? error.response?.data.message
              : error.message;
            dispatchErrorMessage({
              type: "resetPassword",
              payload: errorMessage,
            });
            setLoadingIconState(false);
          }
        }
        resetPasswordErrorRef.current?.focus();
      }
    }
  };

  return (
    <Fragment>
      {errorMessage.resetPasswordError && (
        <p
          ref={resetPasswordErrorRef}
          className="reset-password-form__show-error"
          aria-live="assertive"
        >
          {errorMessage.resetPasswordError}
        </p>
      )}
      <form
        className="reset-password-form"
        onSubmit={handleResetPassword}
        method="POST"
      >
        <div className="reset-password-form__floating-label-group">
          <input
            id="reset-password-form__email-address"
            className={`reset-password-form__email-address ${
              resetPasswordFormState.emailAddress !== ""
                ? emailAddressInputStatus.valid
                  ? "valid-input"
                  : "invalid-input"
                : ""
            }`}
            lang="en"
            name="emailAddress"
            type="email"
            maxLength={150}
            ref={emailAddressInputRef}
            value={resetPasswordFormState.emailAddress}
            onChange={handleInputChange}
            onFocus={() =>
              dispatchEmailAddressInputStatus({ type: "focus", payload: true })
            }
            onBlur={() =>
              dispatchEmailAddressInputStatus({ type: "focus", payload: false })
            }
            required={true}
            autoComplete="off"
            aria-invalid={emailAddressInputStatus.valid ? "false" : "true"}
            aria-describedby="reset-password-form__emailAddressRequirements"
          />
          <label
            lang="en"
            className="reset-password-form__floating-label"
            htmlFor="reset-password-form__email-address"
          >
            Enter your email address
          </label>
        </div>
        {errorMessage.emailAddressError && (
          <p
            ref={emailAddressErrorRef}
            className="reset-password-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.emailAddressError}
          </p>
        )}
        <div className="reset-password-form__floating-label-group">
          <input
            id="reset-password-form__password"
            className={`reset-password-form__password ${
              resetPasswordFormState.password !== ""
                ? passwordInputStatus.valid
                  ? "valid-input"
                  : "invalid-input"
                : ""
            }`}
            lang="en"
            name="password"
            type={passwordVisibilityStatus.passwordVisibilityType}
            maxLength={14}
            value={resetPasswordFormState.password}
            onChange={handleInputChange}
            onFocus={() =>
              dispatchPasswordInputStatus({ type: "focus", payload: true })
            }
            onBlur={() =>
              dispatchPasswordInputStatus({ type: "focus", payload: false })
            }
            required={true}
            autoComplete="off"
            aria-invalid={passwordInputStatus.valid ? "false" : "true"}
          />
          <label
            lang="en"
            className="reset-password-form__floating-label"
            htmlFor="reset-password-form__password"
          >
            Enter new password
          </label>
          <span className="reset-password-form__password-visibility-icon">
            <i
              className={`bi ${passwordVisibilityStatus.passwordVisibilityIcon}`}
              onClick={() => togglePasswordVisibilityStatus("password")}
            ></i>
          </span>
        </div>
        {errorMessage.passwordError && (
          <p
            ref={passwordErrorRef}
            className="reset-password-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.passwordError}
          </p>
        )}
        <div className="reset-password-form__floating-label-group">
          <input
            id="reset-password-form__confirm-password"
            className={`reset-password-form__confirm-password ${
              resetPasswordFormState.confirmPassword !== ""
                ? confirmPasswordInputStatus.valid
                  ? "valid-input"
                  : "invalid-input"
                : ""
            }`}
            lang="en"
            name="confirmPassword"
            type={passwordVisibilityStatus.confirmPasswordVisibilityType}
            maxLength={14}
            value={resetPasswordFormState.confirmPassword}
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
            required={true}
            autoComplete="off"
            aria-invalid={confirmPasswordInputStatus.valid ? "false" : "true"}
          />
          <label
            lang="en"
            className="reset-password-form__floating-label"
            htmlFor="reset-password-form__confirm-Password"
          >
            Confirm password
          </label>
          <span className="reset-password-form__password-visibility-icon">
            <i
              className={`bi ${passwordVisibilityStatus.confirmPasswordVisibilityIcon}`}
              onClick={() => togglePasswordVisibilityStatus("confirmPassword")}
            ></i>
          </span>
        </div>
        {errorMessage.confirmPasswordError && (
          <p
            ref={confirmPasswordErrorRef}
            className="reset-password-form__show-error"
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
        <button
          className={`reset-password-form__button--reset ${
            isResetPasswordButtonDisabled ? "button-disabled" : ""
          }`}
          lang="en"
          name="resetPassword"
          type="submit"
          disabled={isResetPasswordButtonDisabled ? true : false}
        >
          <i></i>RESET
        </button>
      </form>
    </Fragment>
  );
}

export default ResetPasswordForm;
