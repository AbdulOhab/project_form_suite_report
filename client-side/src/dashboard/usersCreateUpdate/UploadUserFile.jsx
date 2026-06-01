import React from "react";
import BASE_URL from "../../auth/dbUrl";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SweetAlert from "../time/SweetAlert";

const UploadUserFile = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  const csvfileHandler = async (e) => {
    e.preventDefault();
    const fileInput = e.target.querySelector('input[type="file"]');
    const file = fileInput?.files[0];

    if (!file) {
      console.error("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("csvFile", file); // Note the key "csvFile" matches what the server expects
    setIsUploading(true); // Set uploading state to true
    try {
      const response = await fetch(`${BASE_URL}/upload-user-file`, {
        method: "POST",
        headers: {
          Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          Accept: "application/json",
          // Note: Do not set the Content-Type header manually
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 200) {
        SweetAlert({
          message: "Uploaded successfully",
          icon: "success",
        });
        navigate("/dashboard");
      } else {
        SweetAlert({
          message: "Failed to upload",
          icon: "error",
        });
        console.error(`Error: ${response.status}`, data);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false); // Set uploading state to false after fetch completes
      setTimeout(() => {
        setIsUploading(false); // Ensure uploading state is false after 5 seconds (in case of error)
      }, 5000);
    }
  };

  return (
    <div className="w-50 m-auto my-5">
      <div className="card">
        <div className="card-header">
          <p className="fw-bold text-center fs-2 text-highlight bg-success rounded">Upload Your CSV File</p>
        </div>
        <div className="card-body">
          <form onSubmit={csvfileHandler}>
            <input type="file" id="file" name="file" />
            <div className="my-3 text-end mx-5">
              <button
                type="submit"
                className="btn btn-success"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadUserFile;
