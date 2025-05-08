import { Fragment, createContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RegistrationForm from "./RegistrationForm";
import LoginForm from "./LoginForm";
import ResetPasswordForm from "./ResetPasswordForm";
import "../dist/css/Form.css";

type FormPropsType = {
  loginFormDisplayToggleValue: boolean;
  registrationFormDisplayToggleValue: boolean;
  resetPasswordFormDisplayToggleValue: boolean;
};

type RegistrationSuccessStatus = {
  registrationSuccessState: boolean;
  setRegistrationSuccessState: (newState: boolean) => void;
};

const registrationSuccessInitialState: RegistrationSuccessStatus = {
  registrationSuccessState: false,
  setRegistrationSuccessState: () => {},
};

export const RegistrationSuccessStatusContext =
  createContext<RegistrationSuccessStatus>(registrationSuccessInitialState);

function Form(props: FormPropsType) {
  const [registrationSuccessState, setRegistrationSuccessState] = useState(
    registrationSuccessInitialState.registrationSuccessState
  );
  const [isPasswordResetSuccessful, setIsPasswordResetSuccessful] =
    useState(false);
  const navigate = useNavigate();

  const closeForm = () => {
    navigate("/");
  };

  return (
    <div className="form-container">
      <div className="form-container__content">
        <h3 className="form-container__form-type-heading">
          {!props.resetPasswordFormDisplayToggleValue
            ? props.registrationFormDisplayToggleValue
              ? "Register"
              : "Log in"
            : "Reset password"}
        </h3>
        <svg
          className="form-container__button--close-form"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 20 20"
          xmlSpace="preserve"
          onClick={() => closeForm()}
        >
          <path d="M2,2 18,18 M18,2 2,18" stroke="#323232" strokeWidth={2} />
        </svg>
        <RegistrationSuccessStatusContext.Provider
          value={{ registrationSuccessState, setRegistrationSuccessState }}
        >
          {!props.resetPasswordFormDisplayToggleValue ? (
            !props.loginFormDisplayToggleValue ? (
              !registrationSuccessState ? (
                <RegistrationForm />
              ) : (
                <Fragment>
                  <h4 className="form-container__confirmation-message">
                    Successfully registered!
                  </h4>
                  <Link
                    className={`form-container__link ${
                      props.loginFormDisplayToggleValue
                        ? "is-instructions-link-active"
                        : ""
                    }`}
                    to={"/login"}
                  >
                    Log in
                  </Link>
                </Fragment>
              )
            ) : (
              <LoginForm />
            )
          ) : isPasswordResetSuccessful ? (
            <Fragment>
              <h4 className="form-container__confirmation-message">
                Password reset successful. You can log in now with the new
                password
              </h4>
              <Link
                className={`form-container__link ${
                  props.loginFormDisplayToggleValue
                    ? "is-instructions-link-active"
                    : ""
                }`}
                to={"/login"}
              >
                Log in
              </Link>
            </Fragment>
          ) : (
            <ResetPasswordForm
              setIsPasswordResetSuccessful={setIsPasswordResetSuccessful}
            />
          )}
        </RegistrationSuccessStatusContext.Provider>
        {!props.resetPasswordFormDisplayToggleValue && (
          <div className="form-container__instructions">
            <h4 className="form-container__instructions-text">
              {props.loginFormDisplayToggleValue
                ? "Don't have an account yet?"
                : !registrationSuccessState
                ? "Already have an account?"
                : ""}
            </h4>
            {props.loginFormDisplayToggleValue ? (
              <Link
                className={`form-container__instructions-link ${
                  !props.registrationFormDisplayToggleValue
                    ? "is-instructions-link-active"
                    : ""
                }`}
                to={"/register"}
              >
                Register
              </Link>
            ) : !registrationSuccessState ? (
              <Link
                className={`form-container__instructions-link ${
                  !props.loginFormDisplayToggleValue
                    ? "is-instructions-link-active"
                    : ""
                }`}
                to={"/login"}
              >
                Log in
              </Link>
            ) : (
              ""
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Form;
