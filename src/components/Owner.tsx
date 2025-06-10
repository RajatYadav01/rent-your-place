import React, { useContext, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";
import { Outlet, useNavigate } from "react-router-dom";
import { LoginStatusActionType, LoginSuccessStatusContext } from "../App";
import Properties from "./Properties";
import { toast } from "react-toastify";
import "../dist/css/Owner.css";

type OwnerPropsType = {
  startLogOutTimer: (callback: () => Promise<void>) => void;
  clearLogOutTimer: () => void;
  isLogOutTimerActive: React.MutableRefObject<boolean>;
};

type PropertyFormValuesType = {
  id: string;
  country: string | null;
  place: string | null;
  totalArea: number | string | null;
  numberOfBedrooms: number | string | null;
  numberOfBathrooms: number | string | null;
  nearbyLandmark: string | null;
  monthlyRent: number | string | null;
  currencyUnit: string | null;
  ownerID: string | null;
  likeCount: number;
  likedByUserIDs: string[] | null;
};

const propertyFormValuesInitialState = {
  id: "",
  country: "",
  place: "",
  totalArea: "",
  numberOfBedrooms: "",
  numberOfBathrooms: "",
  nearbyLandmark: "",
  monthlyRent: "",
  currencyUnit: "",
  ownerID: "",
  likeCount: 0,
  likedByUserIDs: null,
};

function Owner(props: OwnerPropsType) {
  const navigate = useNavigate();
  const loginSuccessStatusContext = useContext(LoginSuccessStatusContext);
  const [newPropertyAdded, setNewPropertyAdded] = useState(false);
  const [propertyUpdated, setPropertyUpdated] = useState(false);
  const [propertyFormInitialValues, setPropertyFormInitialValues] =
    useState<PropertyFormValuesType>(propertyFormValuesInitialState);
  const [userID, setUserID] = useState("");
  const [ownerError, setOwnerError] = useState("");

  const getID = async () => {
    try {
      const response: AxiosResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_API_URL}/users/getID`,
        {
          headers: {
            "Content-Type": "application/json",
            Token: localStorage.token,
          },
          withCredentials: true,
        }
      );
      setUserID(response.data.userID);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error) {
          console.error(error);
          const errorMessage = error.response?.data
            ? error.response?.data.message
            : error.message;
          setOwnerError(errorMessage);
        }
      }
    }
  };

  const verifyUser = async (): Promise<void> => {
    try {
      const serverResponse: AxiosResponse = await axios.get(
        `${process.env.REACT_APP_BACKEND_API_URL}/users/verify`,
        {
          headers: {
            "Content-Type": "application/json",
            Token: localStorage.token,
            UserType: localStorage.userType,
          },
          withCredentials: true,
        }
      );
      if (serverResponse.data.message === "Verified") {
        loginSuccessStatusContext.dispatchLoginStatusState({
          type: LoginStatusActionType.SET_LOGGED_IN_STATUS,
          payload: true,
        });
        loginSuccessStatusContext.dispatchLoginStatusState({
          type: LoginStatusActionType.SET_LOGIN_USERTYPE,
          payload: serverResponse.data.userType,
        });
        loginSuccessStatusContext.dispatchLoginStatusState({
          type: LoginStatusActionType.SET_LOGIN_USERNAME,
          payload: serverResponse.data.firstName,
        });
        props.startLogOutTimer(verifyUser);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const error = JSON.parse(JSON.stringify(err));
        console.error(error);
        if (
          props.isLogOutTimerActive.current ||
          localStorage.getItem("userType") === "owner" ||
          localStorage.getItem("token")
        ) {
          props.clearLogOutTimer();
          localStorage.removeItem("token");
          localStorage.removeItem("userType");
          localStorage.removeItem("showLikedProperties");
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
          toast.info("You have been logged out due to expired token");
          navigate("../login", { replace: true });
        }
      }
    }
  };

  useEffect(() => {
    getID();
    verifyUser();
  }, []);

  return (
    <div className="owner">
      <div className="owner__form-container">
        <Outlet
          context={{
            setNewPropertyAdded,
            propertyFormInitialValues,
            setPropertyUpdated,
            isLogOutTimerActive: props.isLogOutTimerActive,
            clearLogOutTimer: props.clearLogOutTimer,
          }}
        />
      </div>
      {ownerError && (
        <p className="owner__show-error" aria-live="assertive">
          {ownerError}
        </p>
      )}
      <Properties
        userID={userID}
        newPropertyAdded={newPropertyAdded}
        propertyUpdated={propertyUpdated}
        setPropertyFormInitialValues={setPropertyFormInitialValues}
      />
    </div>
  );
}

export default Owner;
