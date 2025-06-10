import React, {
  Fragment,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { LoginStatusActionType, LoginSuccessStatusContext } from "../App";
import "react-toastify/dist/ReactToastify.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../dist/css/LoginForm.css";

type LoginFormType = {
  emailAddress: string;
  password: string;
};

type LoginFormErrorsType = {
  emailAddressError: string;
  passwordError: string;
  loginError: string;
};

type LoginFormErrorsActionType = {
  type: string;
  payload: string;
};

type LoginFormInputStatusType = {
  valid: boolean;
  focused: boolean;
};

type LoginFormInputActionType = {
  type: string;
  payload: boolean;
};

const loginFormInputStatusInitialState = {
  valid: true,
  focused: false,
};

const inputStatusReducer = (
  state: LoginFormInputStatusType,
  action: LoginFormInputActionType
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

const loginFormErrorsInitialState = {
  emailAddressError: "",
  passwordError: "",
  loginError: "",
};

const errorReducer = (
  state: LoginFormErrorsType,
  action: LoginFormErrorsActionType
) => {
  switch (action.type) {
    case "emailAddress":
      return { ...state, emailAddressError: action.payload };
    case "password":
      return { ...state, passwordError: action.payload };
    case "login":
      return { ...state, loginError: action.payload };
    default:
      throw new Error();
  }
};

type LoginFormPasswordVisibilityStatusType = {
  visibilityType: string;
  visibilityIcon: string;
};

type LoginFormPasswordVisibilityActionType = {
  name: string;
  type: string;
  icon: string;
};

const loginFormPasswordVisibilityStatusInitialState = {
  visibilityType: "password",
  visibilityIcon: "bi-eye-slash-fill",
};

const passwordVisibilityStatusReducer = (
  state: LoginFormPasswordVisibilityStatusType,
  action: LoginFormPasswordVisibilityActionType
) => {
  switch (action.name) {
    case "password":
      return {
        ...state,
        visibilityType: action.type,
        visibilityIcon: action.icon,
      };
    default:
      throw new Error();
  }
};

function LoginForm() {
  const [loginFormState, setLoginFormState] = useState<LoginFormType>({
    emailAddress: "",
    password: "",
  });

  const loginSuccessStatusContext = useContext(LoginSuccessStatusContext);

  const navigate = useNavigate();

  const location = useLocation();

  const [loadingIconState, setLoadingIconState] = useState(false);

  const emailAddressInputRef = useRef<HTMLInputElement | null>(null);

  const loginErrorRef = useRef<HTMLParagraphElement | null>(null);
  const emailAddressErrorRef = useRef<HTMLParagraphElement | null>(null);
  const passwordErrorRef = useRef<HTMLParagraphElement | null>(null);

  const [emailAddressInputStatus, dispatchEmailAddressInputStatus] = useReducer(
    inputStatusReducer,
    loginFormInputStatusInitialState
  );
  const [passwordInputStatus, dispatchPasswordInputStatus] = useReducer(
    inputStatusReducer,
    loginFormInputStatusInitialState
  );

  const [passwordVisibilityStatus, dispatchPasswordVisibilityStatus] =
    useReducer(
      passwordVisibilityStatusReducer,
      loginFormPasswordVisibilityStatusInitialState
    );

  const togglePasswordVisibilityStatus = (inputFieldName: string) => {
    if (
      inputFieldName === "password" &&
      passwordVisibilityStatus.visibilityType === "password"
    )
      dispatchPasswordVisibilityStatus({
        name: inputFieldName,
        type: "text",
        icon: "bi-eye-fill",
      });
    else if (
      inputFieldName === "password" &&
      passwordVisibilityStatus.visibilityType === "text"
    )
      dispatchPasswordVisibilityStatus({
        name: inputFieldName,
        type: "password",
        icon: "bi-eye-slash-fill",
      });
  };

  const [errorMessage, dispatchErrorMessage] = useReducer(
    errorReducer,
    loginFormErrorsInitialState
  );

  useEffect(() => {
    emailAddressInputRef.current?.focus();
  }, []);

  const emailAddressRegEx =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  const passwordRegEx =
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*\-_.?]).{8,50}$/;

  const isLoginButtonDisabled =
    !emailAddressInputStatus.valid || !passwordInputStatus.valid;

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoginFormState((prevFormData) => ({
      ...prevFormData,
      [event.target.name]: event.target.value,
    }));
  };

  useEffect(() => {
    const emailAddressValidationResult = emailAddressRegEx.test(
      loginFormState.emailAddress
    );
    dispatchEmailAddressInputStatus({
      type: "valid",
      payload: emailAddressValidationResult,
    });
  }, [loginFormState.emailAddress]);

  useEffect(() => {
    const passwordValidationResult = passwordRegEx.test(
      loginFormState.password
    );
    dispatchPasswordInputStatus({
      type: "valid",
      payload: passwordValidationResult,
    });
  }, [loginFormState.password]);

  useEffect(() => {
    dispatchErrorMessage({ type: "emailAddress", payload: "" });
    dispatchErrorMessage({ type: "login", payload: "" });
  }, [loginFormState.emailAddress]);

  useEffect(() => {
    dispatchErrorMessage({ type: "password", payload: "" });
    dispatchErrorMessage({ type: "login", payload: "" });
  }, [loginFormState.password]);

  const handleLogin = async (event: React.ChangeEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailAddressValidation = (() => {
      if (loginFormState.emailAddress === "") {
        dispatchErrorMessage({
          type: "emailAddress",
          payload: "Email address cannot be empty.",
        });
        dispatchEmailAddressInputStatus({ type: "valid", payload: false });
      } else if (!emailAddressRegEx.test(loginFormState.emailAddress)) {
        dispatchErrorMessage({
          type: "emailAddress",
          payload: "Invalid email address.",
        });
        dispatchEmailAddressInputStatus({ type: "valid", payload: false });
      }
    })();
    const passwordValidation = (() => {
      if (loginFormState.password === "") {
        dispatchErrorMessage({
          type: "password",
          payload: "Password cannot be empty.",
        });
        dispatchPasswordInputStatus({ type: "valid", payload: false });
      } else if (!passwordRegEx.test(loginFormState.password)) {
        dispatchErrorMessage({
          type: "password",
          payload: "Invalid password.",
        });
        dispatchPasswordInputStatus({ type: "valid", payload: false });
      }
    })();
    if (!emailAddressInputStatus.valid || !passwordInputStatus.valid) {
      dispatchErrorMessage({ type: "login", payload: "Invalid data" });
      return;
    }
    if (emailAddressInputStatus.valid && passwordInputStatus.valid) {
      try {
        setLoadingIconState(true);
        const serverResponse = await axios.post(
          `${process.env.REACT_APP_BACKEND_API_URL}/users/authenticate`,
          JSON.stringify(loginFormState),
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        );
        if (serverResponse.data.jwtToken) {
          localStorage.setItem("token", serverResponse.data.jwtToken);
          localStorage.setItem(
            "userType",
            serverResponse.data.userType.toLowerCase()
          );
          loginSuccessStatusContext.dispatchLoginStatusState({
            type: LoginStatusActionType.SET_LOGGED_IN_STATUS,
            payload: true,
          });
          loginSuccessStatusContext.dispatchLoginStatusState({
            type: LoginStatusActionType.SET_LOGIN_USERTYPE,
            payload: serverResponse.data.userType.toLowerCase(),
          });
          setLoadingIconState(false);
          toast.success("Logged in successfully");
          navigate(
            location.state?.path ||
              `/${serverResponse.data.userType.toLowerCase()}`,
            { replace: true }
          );
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          if (error) {
            console.error(error);
            const errorMessage = error.response?.data
              ? error.response?.data.message
              : error.message;
            dispatchErrorMessage({ type: "login", payload: errorMessage });
            setLoadingIconState(false);
          }
        }
        loginErrorRef.current?.focus();
      }
    }
  };

  return (
    <Fragment>
      {errorMessage.loginError && (
        <p
          ref={loginErrorRef}
          className="login-form__show-error"
          aria-live="assertive"
        >
          {errorMessage.loginError}
        </p>
      )}
      <form className="login-form" onSubmit={handleLogin} method="POST">
        <div className="login-form__floating-label-group">
          <input
            id="login-form__email-address"
            className={`login-form__email-address ${
              loginFormState.emailAddress !== ""
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
            value={loginFormState.emailAddress}
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
            aria-describedby="login-form__emailAddressRequirements"
          />
          <label
            lang="en"
            className="login-form__floating-label"
            htmlFor="login-form__email-address"
          >
            Enter your email address
          </label>
        </div>
        {errorMessage.emailAddressError && (
          <p
            ref={emailAddressErrorRef}
            className="login-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.emailAddressError}
          </p>
        )}
        <div className="login-form__floating-label-group">
          <input
            id="login-form__password"
            className={`login-form__password ${
              loginFormState.password !== ""
                ? passwordInputStatus.valid
                  ? "valid-input"
                  : "invalid-input"
                : ""
            }`}
            lang="en"
            name="password"
            type={passwordVisibilityStatus.visibilityType}
            maxLength={14}
            value={loginFormState.password}
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
            className="login-form__floating-label"
            htmlFor="login-form__password"
          >
            Enter your password
          </label>
          <span className="login-form__password-visibility-icon">
            <i
              className={`bi ${passwordVisibilityStatus.visibilityIcon}`}
              onClick={() => togglePasswordVisibilityStatus("password")}
            ></i>
          </span>
          <Link to="../reset-password" className="login-form__forgot-password">
            Forgot password?
          </Link>
        </div>
        {errorMessage.passwordError && (
          <p
            ref={passwordErrorRef}
            className="login-form__show-error"
            aria-live="assertive"
          >
            {errorMessage.passwordError}
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
          className={`login-form__button--login ${
            isLoginButtonDisabled ? "button-disabled" : ""
          }`}
          lang="en"
          name="login"
          type="submit"
          disabled={isLoginButtonDisabled ? true : false}
        >
          <i></i>LOG IN
        </button>
      </form>
    </Fragment>
  );
}

export default LoginForm;
