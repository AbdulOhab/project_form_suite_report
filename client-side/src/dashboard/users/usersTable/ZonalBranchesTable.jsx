import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import BASE_URL from "../../../auth/dbUrl";
import { Link } from "react-router-dom";
import Loader from "../../time/Loader";

const ZonalBranchesTable = ({ users }) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    setData(users);
  }, [users]);

  // delete item from database
  const deleteItem = (e, id) => {
    e.preventDefault();
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleted!",
          text: "Your user has been deleted.",
          icon: "success",
        });

        const response = await fetch(`${BASE_URL}/delete-branch-users/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
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
    <>
      {data.length ? (
        <table className="table table-responsive table-hover table-bordered align-middle">
          <thead className=" bg-hightlight position-sticky">
            <tr className="text-center text-capitalize">
              <th>ইউজার আইডি</th>
              <th>ব্রাঞ্চের আইডি</th>
              <th>ব্রাঞ্চের নাম</th>
              <th>আঞ্চলের আইডি</th>
              <th>ইউজার রোল</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {data?.map((element, index) => (
              <tr key={index} className="text-center">
                <td>{element.userId}</td>
                <td>{element.branchCode}</td>
                <td>{element.userName}</td>
                <td>{element.zonalCode}</td>
                <td>{element.userRole}</td>
                <td>
                  <Link
                    className="btn btn-success"
                    to={`/dashboard/update-branch/${element._id}`}
                    title="Edit Branch"
                  >
                    <i className="fa-solid fa-edit" aria-hidden="true"></i>
                  </Link>{" "}
                  &nbsp;
                  <Link
                    className="btn btn-outline-danger"
                    to={`/dashboard/update-branch-password/${element._id}`}
                    title="Forget Password"
                  >
                    <i className="fa-solid fa-key "></i>
                  </Link>{" "}
                  &nbsp;
                  <Link
                    className="btn btn-danger"
                    onClick={(e) => deleteItem(e, element._id)}
                  >
                    <i
                      className="fa-solid fa-trash "
                      aria-hidden="true"
                      title="Delete Branch"
                    ></i>
                  </Link>
                  &nbsp;
                  <Link
                    className="btn btn-success"
                    to={`/dashboard/zonal-branch/${element.zonalCode}/branch-thana/${element.branchCode}`}
                  >
                    <i
                      className="fa fa-plus"
                      aria-hidden="true"
                      title="View Users"
                    ></i>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot></tfoot>
        </table>
      ) : (
        <Loader />
      )}
    </>
  );
};

export default ZonalBranchesTable;
