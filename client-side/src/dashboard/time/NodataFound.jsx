import React from "react";
import { Comment } from "react-loader-spinner";

const NodataFound = ({ message }) => {
  return (
    <div className="my-3">
      <Comment
        visible={true}
        height="80"
        width="80"
        ariaLabel="comment-loading"
        wrapperStyle={{}}
        wrapperClass="comment-wrapper"
        color="#fff"
        backgroundColor="#F4442E"
      />
      <h3 className="fs-3 fw-bolder text-center text-danger">{message}</h3>
    </div>
  );
};

export default NodataFound;
