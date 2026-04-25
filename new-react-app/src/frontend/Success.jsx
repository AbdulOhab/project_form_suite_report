import React from "react";

function Success() {
  return (
    <div className="container">
      <div className="col-lg-5 col-md-6 col-sm-12 m-auto">
        <div className="card shadow">
          <div className="card-header">
            <h1 className="text-center text-success">Success</h1>
          </div>
          <div className="card-body text-center">
            <img
              src="/assects/images/success_img.gif"
              alt="successIimage"
              className=" border border-success border-4 rounded"
              width={250}
            />
          </div>
          <div className="card-footer">
            <p className="text-center text-bg-success p-1 rounded">
              Your form has been submitted successfully
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Success;
