import { createContext, useEffect, useState } from "react";
import BASE_URL from "../auth/dbUrl";

export const AuthContext = createContext(null);

const AuthContextProvider = ({ children }) => {
  const [checkAuth, setcheckAuth] = useState(false);
  const [userInfo, setuserInfo] = useState(null);
  // Distinguishes "still verifying the token" from "confirmed logged out" —
  // without this, a reload briefly looks logged-out (checkAuth === false)
  // before the async check resolves, flashing the login page.
  const [authChecked, setAuthChecked] = useState(false);

  const checkUser = async () => {
    const token = window.localStorage.getItem("gsmToken");
    if (!token) {
      setcheckAuth(false);
      setAuthChecked(true);
      return;
    }

    await fetch(`${BASE_URL}/check-user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
    })
      .then(async (res) => {
        let status = res.status;
        return {
          status: status,
          response: await res.json(),
        };
      })
      .then((res) => {
        if (res.status === 200) {
          setuserInfo(res?.response);
          setcheckAuth({
            isAuth: true,
            gsmToken: window.localStorage.getItem("gsmToken"),
          });
        } else {
          setcheckAuth(false);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  };
  useEffect(() => {
    checkUser();
  }, [checkAuth.isAuth]);

  const logout = () => {
    setcheckAuth(false);
    window.localStorage.removeItem("gsmToken");
  };

  return (
    <AuthContext.Provider value={{ checkAuth, setcheckAuth, logout, userInfo, authChecked }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
