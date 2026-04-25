import React from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import BASE_URL from "../../../auth/dbUrl";
import { useState } from "react";
import { useEffect } from "react";
import Loader from "../../time/Loader";

function ThanaTableBody({ users }) {
  const [data, setData] = useState([]);
  useEffect(() => {
    setData(users);
  }, [users]);
  

  // delete item from database
  const deleteItem = (e, id) => {
    e.preventDefault();
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
        });

        const response = await fetch(`${BASE_URL}/delete-thana-users/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
          },
        });
        await response.json();
        if (response.ok) {
          const temp = [...data].filter((i) => i._id !== id);
          setData(temp);
        }
      }
    });
  };
  return (
    <div>
      {data.length ? (
        <table
          className="table table-responsive table-hover table-bordered  align-middle"
          border={1}
        >
          <thead className="bg-hightlight">
            <tr className="text-center text-capitalize">
              <th>ইউজার আইডি</th>
              {/* <th>user Password</th> */}
              <th>থানার নাম</th>
              <th>থানার আইডি</th>
              <th>ব্রাঞ্চ আইডি</th>
              <th>অঞ্চল আইডি</th>
              <th>ইউজার রোল</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="">
            {data?.map((element, index) => (
              <tr key={index} className="text-center">
                <td>{element.userId}</td>
                {/* <td>{element.password}</td> */}
                <td>{element.userName}</td>
                <td>{element.thanaCode}</td>
                <td>{element.branchCode}</td>
                <td>{element.zonalCode}</td>
                <td>{element.userRole}</td>
                <td>
                  <Link
                    className="btn btn-success"
                    to={`/dashboard/update-thana/${element._id}`}
                    title="Edit User"
                  >
                    <i
                      className="fa-solid fa-edit fa-beat"
                      aria-hidden="true"
                    ></i>
                  </Link>{" "}
                  &nbsp;
                  <Link
                    className="btn btn-outline-danger"
                    to={`/dashboard/update-thana-password/${element._id}`}
                    title="Forget Password"
                  >
                    <i className="fa-solid fa-key fa-shake"></i>
                  </Link>{" "}
                  &nbsp;
                  <Link
                    className="btn btn-danger"
                    onClick={(e) => deleteItem(e, element._id)}
                    to={`/dashboard/thana-users'`}
                    title="Delete User"
                  >
                    <i
                      className="fa-solid fa-trash fa-flip"
                      aria-hidden="true"
                    ></i>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <Loader />
      )}
    </div>
  );
}

export default ThanaTableBody;
