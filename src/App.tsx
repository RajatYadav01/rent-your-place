import { createContext, Fragment, useReducer, useRef } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import PublicRoutes from "./components/PublicRoutes";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Header from "./components/Header";
import Content from "./components/Content";
import Tenant from "./components/Tenant";
import Owner from "./components/Owner";
import Footer from "./components/Footer";
import PageNotFound from "./components/PageNotFound";
import UpdateProfileForm from "./components/UpdateProfileForm";
import NewPropertyForm from "./components/NewPropertyForm";
import UpdatePropertyForm from "./components/UpdatePropertyForm";
import "./dist/css/App.css";

type LoginStatusDetailsType = {
  loggedIn: boolean;
  loginUserType: string;
  loginUserName: string;
};

export enum LoginStatusActionType {
  SET_LOGGED_IN_STATUS = "SET_LOGGED_IN_STATUS",
  SET_LOGIN_USERTYPE = "SET_LOGIN_USERTYPE",
  SET_LOGIN_USERNAME = "SET_LOGIN_USERNAME",
}

type SetLoggedInStatus = {
  type: LoginStatusActionType.SET_LOGGED_IN_STATUS;
  payload: boolean;
};

type SetLoginUserType = {
  type: LoginStatusActionType.SET_LOGIN_USERTYPE;
  payload: string;
};

type SetLoginUserName = {
  type: LoginStatusActionType.SET_LOGIN_USERNAME;
  payload: string;
};

type LoginStatusActions =
  | SetLoggedInStatus
  | SetLoginUserType
  | SetLoginUserName;

const loginStatusInitialState: LoginStatusDetailsType = {
  loggedIn: false,
  loginUserType: "",
  loginUserName: "",
};

function loginStatusReducer(
  state: LoginStatusDetailsType,
  action: LoginStatusActions
) {
  switch (action.type) {
    case LoginStatusActionType.SET_LOGGED_IN_STATUS:
      return { ...state, loggedIn: action.payload };
    case LoginStatusActionType.SET_LOGIN_USERTYPE:
      return { ...state, loginUserType: action.payload };
    case LoginStatusActionType.SET_LOGIN_USERNAME:
      return { ...state, loginUserName: action.payload };
    default:
      return state;
  }
}

export const LoginSuccessStatusContext = createContext<{
  loginStatusState: LoginStatusDetailsType;
  dispatchLoginStatusState: React.Dispatch<LoginStatusActions>;
}>({
  loginStatusState: loginStatusInitialState,
  dispatchLoginStatusState: () => null,
});

function App() {
  const [loginStatusState, dispatchLoginStatusState] = useReducer(
    loginStatusReducer,
    loginStatusInitialState
  );

  const logOutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLogOutTimerActive = useRef<boolean>(false);
  const startLogOutTimer = async (callback: () => Promise<void>) => {
    if (!logOutTimerRef.current) {
      isLogOutTimerActive.current = true;
      logOutTimerRef.current = setTimeout(async () => {
        logOutTimerRef.current = null;
        await callback();
      }, 300000);
    }
  };

  const clearLogOutTimer = () => {
    if (logOutTimerRef.current) {
      clearTimeout(logOutTimerRef.current);
      logOutTimerRef.current = null;
      isLogOutTimerActive.current = false;
    }
  };

  return (
    <div className="App">
      <Routes>
        <Route element={<PublicRoutes />}>
          <Route
            element={
              <LoginSuccessStatusContext.Provider
                value={{ loginStatusState, dispatchLoginStatusState }}
              >
                <Header
                  isLogOutTimerActive={isLogOutTimerActive}
                  clearLogOutTimer={clearLogOutTimer}
                />
                <Outlet />
                <Footer />
              </LoginSuccessStatusContext.Provider>
            }
          >
            <Route
              path="/"
              element={
                <Content
                  loginFormDisplayToggleValue={false}
                  registrationFormDisplayToggleValue={false}
                  resetPasswordFormDisplayToggleValue={false}
                />
              }
            />
            <Route
              path="/register"
              element={
                <Content
                  loginFormDisplayToggleValue={false}
                  registrationFormDisplayToggleValue={true}
                  resetPasswordFormDisplayToggleValue={false}
                />
              }
            />
            <Route
              path="/login"
              element={
                <Content
                  loginFormDisplayToggleValue={true}
                  registrationFormDisplayToggleValue={false}
                  resetPasswordFormDisplayToggleValue={false}
                />
              }
            />
            <Route
              path="/reset-password"
              element={
                <Content
                  loginFormDisplayToggleValue={false}
                  registrationFormDisplayToggleValue={false}
                  resetPasswordFormDisplayToggleValue={true}
                />
              }
            />
          </Route>
        </Route>
        <Route element={<ProtectedRoutes />}>
          <Route
            path="/tenant"
            element={
              localStorage.getItem("userType") === "tenant" ? (
                <LoginSuccessStatusContext.Provider
                  value={{ loginStatusState, dispatchLoginStatusState }}
                >
                  <Header
                    isLogOutTimerActive={isLogOutTimerActive}
                    clearLogOutTimer={clearLogOutTimer}
                  />
                  <Outlet />
                  <Footer />
                </LoginSuccessStatusContext.Provider>
              ) : (
                <Navigate to="/owner" />
              )
            }
          >
            <Route
              index
              element={
                <Tenant
                  isLogOutTimerActive={isLogOutTimerActive}
                  startLogOutTimer={startLogOutTimer}
                  clearLogOutTimer={clearLogOutTimer}
                />
              }
            />
            <Route
              element={
                <Tenant
                  isLogOutTimerActive={isLogOutTimerActive}
                  startLogOutTimer={startLogOutTimer}
                  clearLogOutTimer={clearLogOutTimer}
                />
              }
            >
              <Route path="update-profile" element={<UpdateProfileForm />} />
            </Route>
          </Route>
          <Route
            path="/owner"
            element={
              localStorage.getItem("userType") === "owner" ? (
                <LoginSuccessStatusContext.Provider
                  value={{ loginStatusState, dispatchLoginStatusState }}
                >
                  <Header
                    isLogOutTimerActive={isLogOutTimerActive}
                    clearLogOutTimer={clearLogOutTimer}
                  />
                  <Outlet />
                  <Footer />
                </LoginSuccessStatusContext.Provider>
              ) : (
                <Navigate to="/tenant" />
              )
            }
          >
            <Route
              index
              element={
                <Owner
                  isLogOutTimerActive={isLogOutTimerActive}
                  startLogOutTimer={startLogOutTimer}
                  clearLogOutTimer={clearLogOutTimer}
                />
              }
            />
            <Route
              element={
                <Owner
                  isLogOutTimerActive={isLogOutTimerActive}
                  startLogOutTimer={startLogOutTimer}
                  clearLogOutTimer={clearLogOutTimer}
                />
              }
            >
              <Route path="update-profile" element={<UpdateProfileForm />} />
              <Route path="new-property" element={<NewPropertyForm />} />
              <Route path="update-property" element={<UpdatePropertyForm />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;
