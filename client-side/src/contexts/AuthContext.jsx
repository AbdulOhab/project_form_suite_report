import { createContext, useEffect, useState } from "react";
import BASE_URL from "../auth/dbUrl";

export const AuthContext = createContext(null);

const AuthContextProvider = ({ children }) => {
  const [checkAuth, setcheckAuth] = useState(false);
  const [userInfo, setuserInfo] = useState(null);

  const checkUser = async () => {
    const token = window.localStorage.getItem("gsmToken");
    if (!token) {
      setcheckAuth(false);
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
        return console.log(err);
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
    <AuthContext.Provider value={{ checkAuth, setcheckAuth, logout, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
