import { useContext, useState } from "react";
import { LoginStatusActionType, LoginSuccessStatusContext } from "../App";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../dist/css/Header.css";

type HeaderPropsType = {
    clearLogOutTimer: () => void;
    isLogOutTimerActive: React.MutableRefObject<boolean>;
}

function Header(props: HeaderPropsType) {
    const navigate = useNavigate();

    const displayProfileUpdateForm = () => {
        navigate("update-profile");
    };

    const displayPropertyForm = () => {
        navigate("new-property");
    };

    const loginSuccessStatusContext = useContext(LoginSuccessStatusContext);

    const logout = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.preventDefault();
        if (props.isLogOutTimerActive) {
            props.clearLogOutTimer();
        }
        localStorage.removeItem("token");
        localStorage.removeItem("userType");
        localStorage.removeItem("showLikedProperties");
        localStorage.removeItem("showOwnerProperties");
        loginSuccessStatusContext.dispatchLoginStatusState({type: LoginStatusActionType.SET_LOGGED_IN_STATUS, payload: false});
        loginSuccessStatusContext.dispatchLoginStatusState({type: LoginStatusActionType.SET_LOGIN_USERNAME, payload: ""});
        loginSuccessStatusContext.dispatchLoginStatusState({type: LoginStatusActionType.SET_LOGIN_USERTYPE, payload: ""});
        toast.success("Logged out successfully");
        navigate("/", {replace: true});
    };

    const [hamburgerMenuDisplay, setHamburgerMenuDisplay] = useState<boolean>(false);
    const toggleMenuDisplay = () => {
        setHamburgerMenuDisplay(!hamburgerMenuDisplay);
    }

    return (
        <div className="header">
            <div className="header__logo-container">
                <svg className="header__logo" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 2H9c-1.103 0-2 .897-2 2v5.586l-4.707 4.707A1 1 0 0 0 3 16v5a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4c0-1.103-.897-2-2-2zm-8 18H5v-5.586l3-3 3 3V20zm8 0h-6v-4a.999.999 0 0 0 .707-1.707L9 9.586V4h10v16z"/>
                    <path d="M11 6h2v2h-2zm4 0h2v2h-2zm0 4.031h2V12h-2zM15 14h2v2h-2zm-8 1h2v2H7z"/>
                </svg>
                <Link className="header__link" to="/">Rent Your Place</Link>
            </div>
            { loginSuccessStatusContext.loginStatusState.loggedIn ? (<div className={`header__nav ${hamburgerMenuDisplay ? "header__nav--hamburger-menu" : ""}`}>
                <h3 className="header__nav-user-name">Welcome, {loginSuccessStatusContext.loginStatusState.loginUserName}</h3> 
                <button className="header__nav-button header__nav-button--update-profile header__nav-button--text" onClick={displayProfileUpdateForm}>Update profile</button>
                {loginSuccessStatusContext.loginStatusState.loginUserType === "owner" ? 
                <button className="header__nav-button header__nav-button--add-property header__nav-button--text" onClick={displayPropertyForm}>Add property</button>
                : ""} <button className="header__nav-button header__nav-button--logout header__nav-button--text" onClick={(event) => {logout(event)}}>Log out</button>
            </div>)
            : (<div className={`header__nav ${hamburgerMenuDisplay ? "header__nav--hamburger-menu" : ""}`}>
                <Link to="/login" className="header__nav-button header__nav-button--login header__nav-button--text">Log in</Link>
                <Link to="/register" className="header__nav-button header__nav-button--register header__nav-button--text">Register</Link>
               </div>) }
            <div className="header__hamburger-menu" onClick={toggleMenuDisplay}>
                {<svg className={hamburgerMenuDisplay ? "header__hamburger-menu--open" : "header__hamburger-menu--close"} viewBox="0 0 100 100">
                    <path className="line line1" d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058" />
                    <path className="line line2" d="M 20,50 H 80" />
                    <path className="line line3" d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942" />
                </svg>}
            </div>
        </div>
    );
}

export default Header;