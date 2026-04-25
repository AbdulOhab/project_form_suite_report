import React from "react";
import { RotatingLines } from "react-loader-spinner";
const Loader = () => {
  return (
    <div className="w-25 m-auto my-5">
      <RotatingLines
        visible={true}
        height="96"
        width="96"
        color="grey"
        strokeWidth="5"
        animationDuration="0.75"
        ariaLabel="rotating-lines-loading"
        wrapperStyle={{}}
        wrapperClass=""
      />
    </div>
  );
};

export default Loader;
