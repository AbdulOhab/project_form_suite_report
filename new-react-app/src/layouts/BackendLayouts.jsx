import React from "react";
import BackendHeader from "../dashboard/layouts/BackendHeader";
import BackendSideNav from "../dashboard/layouts/BackendSideNav";
import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import BASE_URL from "../auth/dbUrl";

const BackendLayouts = () => {
  const [role, setRole] = useState();
  const [userName, setUserName] = useState();

  useEffect(() => {
    async function getUserName() {
      try {
        await fetch(`${BASE_URL}/dashboard`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
          },
        })
          .then((res) => res.json())
          .then((data) => {
            // console.log(data?.user?.userName);
            setUserName(data?.user?.userName);
          });
      } catch (error) {
        console.error("Error fetching notice data:", error);
        // Handle error
      }
    }
    getUserName();
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      let req = await fetch(`${BASE_URL}/check-user`, {
        headers: {
          Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
        },
      });
      const response = await req.json();
      setRole(response);
    };

    checkUser();
  }, []);
  return (
    <>
      {role?.userRole === "admin" ? (
        <div className="sb-nav-fixed">
          <div id="layoutSidenav">
            <BackendHeader role={role} userName={userName} />
            <div id="layoutSidenav_nav">
              <BackendSideNav />
            </div>
            <div id="layoutSidenav_content">
              <main>
                <div className="container-fluid p-0 px-lg-4 px-md-2">
                  <Outlet />
                </div>
              </main>
            </div>
          </div>
        </div>
      ) : (
        <div className="sb-nav-fixed">
          <>
            <BackendHeader role={role} userName={userName} />

            <main className="mt-5">
              <div className="container-fluid p-0 px-lg-4 px-md-2">
                <Outlet />
              </div>
            </main>
          </>
        </div>
      )}
    </>
  );
};

export default BackendLayouts;
