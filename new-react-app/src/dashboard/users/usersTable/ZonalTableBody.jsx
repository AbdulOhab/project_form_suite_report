import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import BASE_URL from "../../../auth/dbUrl";
import Swal from "sweetalert2";
import Loader from "../../time/Loader";

function ZonalTableBody({ users }) {
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
          text: "Your regional has been deleted.",
          icon: "success",
        });

        const response = await fetch(`${BASE_URL}/delete-zonal-users/${id}`, {
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
        <table className="table table-responsive table-hover table-bordered  align-middle">
          <thead className="bg-hightlight position-static">
            <tr className="text-center text-capitalize ">
              <th>ইউজার আইডি</th>
              <th>অঞ্চল আইডি</th>
              <th>অঞ্চলের নাম</th>
              <th>ইউজার রোল</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="table-group-divider">
            {data?.map((element, index) => (
              <tr key={index} className="text-center">
                <td>{element.userId}</td>
                <td>{element.zonalCode}</td>
                <td>{element.userName}</td>
                <td>{element.userRole}</td>
                <td>
                  <Link
                    className="btn btn-success"
                    to={`/dashboard/update-zonal/${element._id}`}
                  >
                    <i
                      className="fa-solid fa-edit"
                      aria-hidden="true"
                      title="Edit Item"
                    ></i>
                  </Link>{" "}
                  &nbsp;
                  <Link
                    className="btn btn-outline-danger"
                    to={`/dashboard/update-zonal-password/${element._id}`}
                    title="Forget Password"
                  >
                    <i className="fa-solid fa-key "></i>
                  </Link>{" "}
                  &nbsp;
                  <Link
                    className="btn btn-danger"
                    onClick={(e) => deleteItem(e, element._id)}
                    title="Delete Item"
                  >
                    <i className="fa-solid fa-trash" aria-hidden="true"></i>
                  </Link>{" "}
                  &nbsp;
                  <Link
                    className="btn btn-success"
                    to={`/dashboard/zonal-branch/${element?.zonalCode}`}
                  >
                    <i className="fa fa-plus" aria-hidden="true"></i>
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
    </div>
  );
}

export default ZonalTableBody;
