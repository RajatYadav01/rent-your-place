import { useContext, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios, {AxiosResponse} from "axios";
import { toast } from "react-toastify";
import { LoginStatusActionType, LoginSuccessStatusContext } from "../App";
import Properties from "./Properties";
import "../dist/css/Tenant.css";

type TenantPropsType = {
    startLogOutTimer: (callback: () => Promise<void>) => void;
    clearLogOutTimer: () => void;
    isLogOutTimerActive: React.MutableRefObject<boolean>;
}

type PropertyValuesType = {
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
}

const propertyValuesInitialState = {
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
    likedByUserIDs: null
}

function Tenant(props: TenantPropsType) {
    
    const navigate = useNavigate();
    const loginSuccessStatusContext = useContext(LoginSuccessStatusContext);
    const [propertyFormInitialValues, setPropertyFormInitialValues] = useState<PropertyValuesType>(propertyValuesInitialState);
    const [userID, setUserID] = useState("");
    const [tenantError, setTenantError] = useState("");

    const getID = async () => {
        try {
            const response: AxiosResponse = await axios.get("http://localhost:3050/api/users/getID", {
                headers: {
                    "Content-Type": "application/json",
                    "Token": localStorage.token,
                },
                withCredentials: true
            });
            setUserID(response.data.userID);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) { 
                if (error) {
                    console.error(error);
                    const errorMessage = error.response?.data ? error.response?.data.message : error.message;
                    setTenantError(errorMessage);
                }
            }
        }
    }
    
    async function verifyUser(): Promise<void> {
        try {
            const serverResponse: AxiosResponse = await axios.get("http://localhost:3050/api/users/verify", 
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Token": localStorage.token,
                        "UserType": localStorage.userType
                    },
                    withCredentials: true
                }
            );
            if (serverResponse.data.message === "Verified") {
                loginSuccessStatusContext.dispatchLoginStatusState({type: LoginStatusActionType.SET_LOGGED_IN_STATUS, payload: true});
                loginSuccessStatusContext.dispatchLoginStatusState({type: LoginStatusActionType.SET_LOGIN_USERTYPE, payload: serverResponse.data.userType});
                loginSuccessStatusContext.dispatchLoginStatusState({type: LoginStatusActionType.SET_LOGIN_USERNAME, payload: serverResponse.data.firstName});
                props.startLogOutTimer(verifyUser);
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) { 
                const error = JSON.parse(JSON.stringify(err));
                console.error(error);
                if (props.isLogOutTimerActive.current || localStorage.getItem("userType") === "tenant" || localStorage.getItem("token")) {
                    props.clearLogOutTimer();
                    localStorage.removeItem("token");
                    localStorage.removeItem("userType");
                    localStorage.removeItem("showLikedProperties");
                    loginSuccessStatusContext.dispatchLoginStatusState({type: LoginStatusActionType.SET_LOGGED_IN_STATUS, payload: false});
                    loginSuccessStatusContext.dispatchLoginStatusState({type: LoginStatusActionType.SET_LOGIN_USERNAME, payload: ""});
                    loginSuccessStatusContext.dispatchLoginStatusState({type: LoginStatusActionType.SET_LOGIN_USERTYPE, payload: ""});
                    toast.info("You have been logged out due to expired token");
                    navigate("../login", {replace: true});
                }
            }
        }
    }

    useEffect(() => {
        getID();
        verifyUser();
    }, [])

    return (
        <div className="tenant">
            <div className="tenant__form-container">
                <Outlet context={{isLogOutTimerActive: props.isLogOutTimerActive, clearLogOutTimer: props.clearLogOutTimer}} />
            </div>
            {tenantError && <p className="tenant__show-error" aria-live="assertive">{tenantError}</p>}
            <Properties userID={userID} newPropertyAdded={null} propertyUpdated={null} setPropertyFormInitialValues={setPropertyFormInitialValues} />
        </div>
    );
}

export default Tenant;