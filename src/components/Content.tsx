import { Fragment, useContext } from "react";
import { LoginSuccessStatusContext } from "../App";
import Form from "./Form";
import Properties from "./Properties";
import "../dist/css/Content.css";

type ContentFormProps = {
  loginFormDisplayToggleValue: boolean;
  registrationFormDisplayToggleValue: boolean;
  resetPasswordFormDisplayToggleValue: boolean;
};

function Content(props: ContentFormProps) {
  let displayFormElement: boolean = false;

  if (
    props.loginFormDisplayToggleValue ||
    props.registrationFormDisplayToggleValue ||
    props.resetPasswordFormDisplayToggleValue
  ) {
    displayFormElement = true;
  }

  const { loginStatusState } = useContext(LoginSuccessStatusContext);

  return (
    <div className="content">
      <div className="content__hero-section">
        <h2 className="content__first-heading">Find the</h2>
        <h2 className="content__second-heading">best property</h2>
        <h2 className="content__third-heading">for your needs</h2>
      </div>
      {!loginStatusState.loggedIn
        ? displayFormElement && (
            <Fragment>
              <Form
                loginFormDisplayToggleValue={props.loginFormDisplayToggleValue}
                registrationFormDisplayToggleValue={
                  props.registrationFormDisplayToggleValue
                }
                resetPasswordFormDisplayToggleValue={
                  props.resetPasswordFormDisplayToggleValue
                }
              />
            </Fragment>
          )
        : ""}
      <Properties
        userID={""}
        newPropertyAdded={null}
        propertyUpdated={null}
        setPropertyFormInitialValues={null}
      />
    </div>
  );
}

export default Content;
