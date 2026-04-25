import { useState, useEffect, useContext } from "react";

import TimeDifference from "./time/TimeDifference";

import DateHandler from "./time/DateHandler";
import Pagination from "./users/usersTable/Pagination";
import BASE_URL from "../auth/dbUrl";
import TimeStartBangla from "./time/TimeStartBangla";
import TimeEndBangla from "./time/TimeEndBangla";
import DateDifferenceComponent from "./time/DateDifferenceComponent";
import convertToBengaliNumber from "./time/NumberConverter";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { AuthContext } from "../contexts/AuthContext";
import SweetAlert from "./time/SweetAlert";
import NodataFound from "./time/NodataFound";

const NoticeBoard = () => {
  const { userInfo } = useContext(AuthContext);
  const [noticeData, setNoticeData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [noticePerPage, setNoticePerPage] = useState(20);
  const [validCardView, setValidCardView] = useState(true);
  const [validTableView, setValidTableView] = useState(false);
  const [noticeCardView, setNoticeCardView] = useState(false);
  const [noticeTableView, setNoticeTableView] = useState(true);
  const [searchData, setSearchData] = useState("");
  const [total, setTotal] = useState(0);
  const [previousReportBtn, setPreviousReportBtn] = useState(false);
  const [contineousReportBtn, setContineousReportBtn] = useState(true);

  useEffect(() => {
    const getNoticeData = async () => {
      try {
        const response = await fetch(`${BASE_URL}/all-notice`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
          },
          body: JSON.stringify({
            query: searchData,
            page: currentPage,
            limit: noticePerPage,
            systemViews: validCardView ? true : false,
          }),
        });
        const data = await response.json();

        if (response.ok) {
          setNoticeData(data?.data);
          setCurrentPage(data?.page);
          setNoticePerPage(data?.limit);
          setTotal(data?.total);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };

    getNoticeData();
  }, [searchData, currentPage, noticePerPage, validCardView]);

  const selectHandler = (e) => {
    e.preventDefault();
    setNoticePerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to the first page on items per page change
  };

  const validCardData = (endDadeline) => {
    const currentDate = new Date();
    const endDadelineDate = new Date(endDadeline);

    const timeDiff = endDadelineDate - currentDate;
    const diffInDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return diffInDays;
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const indexOfLastNotice = currentPage * noticePerPage;
  const indexOfFirstNotice = indexOfLastNotice - noticePerPage;

  const validReportHandler = () => {
    setValidTableView(true);
    setContineousReportBtn(false);
    setPreviousReportBtn(true);
    setValidCardView(false);
  };
  const ViewCardHandler = () => {
    setValidCardView(true);
    setPreviousReportBtn(false);
    setContineousReportBtn(true);
    setValidTableView(false);
  };

  const deleteItem = async (e, id) => {
    e.preventDefault();

    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete Notice!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleted!",
          text: "Your Notice has been deleted.",
          icon: "success",
        });
        const response = await fetch(`${BASE_URL}/delete-notice/${id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "myworld " + window.localStorage.getItem("gsmToken"),
          },
        });
        await response.json();
        if (response.ok) {
          const updatedNoticeData = noticeData.filter(
            (item) => item?._id !== id
          );
          setNoticeData(updatedNoticeData);
        } else {
          SweetAlert({
            message: "Failed to delete Notice",
            icon: "error",
          });
        }
      }
    });
  };
  const handleReload = (event) => {
    event.preventDefault();
    window.location.reload();
  };

  const noticeCardViewClick = () => {
    setNoticeCardView(true);
    setNoticeTableView(false);
  };
  const noticeTableViewClick = () => {
    setNoticeCardView(false);
    setNoticeTableView(true);
  };

  return (
    <>
      <div className="card border-0">
        <div className="paginationAndHeader d-lg-none my-3">
          <h2 className="text-center fw-bold text-highlight">
            <span className="bg-success px-2 rounded">
              রিপোর্ট সেন্টারে আপনাকে স্বাগতম
            </span>
          </h2>
        </div>
        <div className="card-header mt-1">
          {/* button  */}
          <div className="d-flex justify-content-between align-items-center gap-3">
            <button
              type="button"
              className={`btn btn-success ${
                previousReportBtn ? "text-highlight" : ""
              }`}
              onClick={validReportHandler}
            >
              পূর্বের রিপোর্ট
            </button>

            <button
              type="button"
              className={`btn btn-success ${
                contineousReportBtn ? "text-highlight" : ""
              }`}
              onClick={ViewCardHandler}
            >
              চলমান রিপোর্ট
            </button>

            <div className=" d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0">
              <div className="input-group position-relative">
                <input
                  className="form-control"
                  type="text"
                  name="key"
                  placeholder="Search for..."
                  aria-label="Search for..."
                  aria-describedby="btnNavbarSearch"
                  value={searchData}
                  onChange={(e) => setSearchData(e.target.value)}
                />
                <div className="position-absolute end-0 bg-success">
                  <i className="fas fa-search text-highlight mt-2 mx-2 fs-4 mb-1"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        {noticeData?.length ? (
          <div className="card-body border-0 my-3">
            {/* table data পূর্বের রিপোর্ট */}

            <div
              className={`preReportData ${
                validTableView ? "d-block" : "d-none"
              }`}
            >
              {/* pagination counter  */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-content-center mx-3">
                  <div className="leftSelect">
                    <select
                      onChange={selectHandler}
                      className="form-select-custom"
                      id="userS"
                    >
                      <option defaultValue={20}>{20}</option>
                      <option value={Math.ceil(total / 16)}>
                        {Math.ceil(total / 16)}
                      </option>
                      <option value={Math.ceil(total / 8)}>
                        {Math.ceil(total / 8)}
                      </option>
                      <option value={Math.ceil(total / 4)}>
                        {Math.ceil(total / 4)}
                      </option>
                      <option value={Math.ceil(total / 2)}>
                        {Math.ceil(total / 2)}
                      </option>
                      <option value={Math.ceil(total)}>
                        {Math.ceil(total)}
                      </option>
                    </select>
                  </div>
                  <div>
                    <h1 className="text-light fw-lighter text-center">
                      <span className="bg-primary px-2 rounded">
                        পূর্বের রিপোর্ট
                      </span>
                    </h1>
                  </div>
                  <div className="rightViewOption">
                    <span onClick={noticeTableViewClick} className="bg-light">
                      <i
                        className="fa-solid fa-list fs-3 fw-bold text-success tableView"
                        title="Table View"
                      ></i>
                    </span>
                    &nbsp; &nbsp; &nbsp;
                    <span onClick={noticeCardViewClick}>
                      <i
                        className="fa-regular fa-square fs-3 fw-bold text-success cardView"
                        title="Card View"
                      ></i>
                    </span>
                  </div>
                </div>
              </div>
              {/* table view */}
              <div className={`${noticeTableView ? "d-block" : "d-none"}`}>
                <table
                  className={`table table-hover table-bordered table-responsive text-center `}
                  border={1}
                >
                  <thead>
                    <tr>
                      <th>ক্রম</th>
                      <th>নোটিশ</th>
                      <th>নোটিশের সময়সীমা</th>
                      <th> কার্যকর নয়</th>
                      <th> একশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noticeData.map((notice, index) => (
                      <tr key={index} className="text-light">
                        <td>{indexOfFirstNotice + index + 1}</td>
                        <td className="text-center">{notice?.document_name}</td>

                        <td>
                          <DateDifferenceComponent
                            startDadeline={notice?.startDadeline}
                            endDadeline={notice?.endDadeline}
                            range={notice?.range}
                            timeStart={notice?.timeStart}
                            timeEnd={notice?.timeEnd}
                          />
                          <DateHandler startDadeline={notice?.startDadeline} />{" "}
                          থেকে
                          <DateHandler startDadeline={notice?.endDadeline} />
                        </td>
                        <td>
                          {convertToBengaliNumber(
                            Math.abs(validCardData(notice?.endDadeline))
                          )}{" "}
                          দিন
                        </td>
                        <td>
                          <div className="UpdateAndEdit mt-3">
                            {userInfo?.userRole === "thana" ? (
                              <div className="d-flex gap-2 align-items-center justify-content-center">
                                <Link
                                  className="btn btn-sm btn-success disabled"
                                  to={`notice-answer/${notice?._id}`}
                                >
                                  <i
                                    className="fa fa-eye text-white"
                                    aria-hidden="true"
                                  ></i>
                                </Link>
                                <Link
                                  className="btn btn-sm btn-success"
                                  to={`thana-submission/${notice?._id}`}
                                >
                                  <i
                                    className="fa fa-address-card"
                                    aria-hidden="true"
                                  ></i>
                                </Link>
                              </div>
                            ) : userInfo?.userRole === "branch" ? (
                              <Link
                                className="btn btn-sm btn-success"
                                to={`branch-data-interface/${notice?._id}`}
                              >
                                <i className="fa fa-eye" aria-hidden="true"></i>
                              </Link>
                            ) : userInfo?.userRole === "zonal" ? (
                              <Link
                                className="btn btn-sm btn-success"
                                to={`zonal-data-interface/${notice?._id}`}
                              >
                                <i className="fa fa-eye" aria-hidden="true"></i>
                              </Link>
                            ) : userInfo?.userRole === "admin" ? (
                              <div className="d-flex gap-1">
                                <Link
                                  className="btn btn-sm btn-success"
                                  to={`admin-data-interface/${notice?._id}`}
                                >
                                  <i
                                    className="fa fa-eye"
                                    aria-hidden="true"
                                  ></i>
                                </Link>
                                <Link
                                  className="btn btn-sm btn-success"
                                  to={`notice-edit/${notice?._id}`}
                                >
                                  <i
                                    className="fa fa-edit"
                                    aria-hidden="true"
                                  ></i>
                                </Link>
                                <a
                                  className="btn btn-sm btn-danger"
                                  onClick={(e) => deleteItem(e, notice?._id)}
                                  href="/dashboard"
                                >
                                  <i
                                    className="fa fa-trash"
                                    aria-hidden="true"
                                  ></i>
                                </a>
                              </div>
                            ) : (
                              <Link
                                className="btn btn-sm btn-success"
                                to="/dashboard"
                                onClick={handleReload}
                              >
                                <i
                                  className="fa fa-refresh fa-spin"
                                  aria-hidden="true"
                                ></i>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* card view data  */}
              <div
                className={`cardViewPreNotice ${
                  noticeCardView ? "d-block" : "d-none"
                }`}
              >
                <div className="d-flex align-content-center justify-content-around gap-5  flex-wrap ">
                  {noticeData.map((notice, index) => (
                    <div key={index} className={`col-lg-4 col-md-4 col-sm-12`}>
                      <div className="card p-3 shadow card-hover">
                        <h5 className="text-center">{notice?.document_name}</h5>
                        <div className="my-2">
                          রিপোর্ট শুরু:
                          <DateHandler startDadeline={notice?.startDadeline} />
                          &nbsp; &nbsp;
                          <TimeStartBangla notice={notice} />
                          <br />
                          রিপোর্ট শেষ:
                          <DateHandler startDadeline={notice?.endDadeline} />
                          &nbsp; &nbsp;
                          <TimeEndBangla notice={notice} />
                        </div>

                        <div className="my-2">
                          <div className="card shadow p-2 text-danger fw-bold text-center">
                            কার্যকর নয়{" "}
                            {convertToBengaliNumber(
                              Math.abs(validCardData(notice?.endDadeline))
                            )}
                            {""}
                            দিন
                          </div>
                        </div>
                        <div className="UpdateAndEdit mt-3">
                          {userInfo?.userRole === "thana" ? (
                            <div className="d-flex gap-2 align-items-center justify-content-center">
                              <Link
                                className="btn btn-sm btn-success disabled"
                                to={`notice-answer/${notice?._id}`}
                              >
                                <i
                                  className="fa fa-eye text-white"
                                  aria-hidden="true"
                                ></i>
                              </Link>
                              <Link
                                className="btn btn-sm btn-success"
                                to={`thana-submission/${notice?._id}`}
                              >
                                <i
                                  className="fa fa-address-card"
                                  aria-hidden="true"
                                ></i>
                              </Link>
                            </div>
                          ) : userInfo?.userRole === "branch" ? (
                            <Link
                              className="btn btn-sm btn-success"
                              to={`branch-data-interface/${notice?._id}`}
                            >
                              <i className="fa fa-eye" aria-hidden="true"></i>
                            </Link>
                          ) : userInfo?.userRole === "zonal" ? (
                            <Link
                              className="btn btn-sm btn-success"
                              to={`zonal-data-interface/${notice?._id}`}
                            >
                              <i className="fa fa-eye" aria-hidden="true"></i>
                            </Link>
                          ) : userInfo?.userRole === "admin" ? (
                            <div className="d-flex gap-1">
                              <Link
                                className="btn btn-sm btn-success"
                                to={`admin-data-interface/${notice?._id}`}
                              >
                                <i className="fa fa-eye" aria-hidden="true"></i>
                              </Link>
                              <Link
                                className="btn btn-sm btn-success"
                                to={`notice-edit/${notice?._id}`}
                              >
                                <i
                                  className="fa fa-edit"
                                  aria-hidden="true"
                                ></i>
                              </Link>
                              <a
                                className="btn btn-sm btn-danger"
                                onClick={(e) => deleteItem(e, notice?._id)}
                                href="/dashboard"
                              >
                                <i
                                  className="fa fa-trash"
                                  aria-hidden="true"
                                ></i>
                              </a>
                            </div>
                          ) : (
                            <Link
                              className="btn btn-sm btn-success"
                              to="/dashboard"
                              onClick={handleReload}
                            >
                              <i
                                className="fa fa-refresh fa-spin"
                                aria-hidden="true"
                              ></i>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* notice card data show চলোমান রিপোর্ট */}
            <div
              className={`cardViewCurrentData ${
                validCardView ? "d-block" : "d-none"
              }`}
            >
              <div className="pb-5">
                <div className="position-relative">
                  {/* pagination counter  */}
                  <div className="leftSelect position-absolute ">
                    <select
                      onChange={selectHandler}
                      className="btn btn-outline-seondary border"
                      id="userS"
                    >
                      <option defaultValue={20}>{20}</option>
                      <option value={Math.ceil(total / 16)}>
                        {Math.ceil(total / 16)}
                      </option>
                      <option value={Math.ceil(total / 8)}>
                        {Math.ceil(total / 8)}
                      </option>
                      <option value={Math.ceil(total / 4)}>
                        {Math.ceil(total / 4)}
                      </option>
                      <option value={Math.ceil(total / 2)}>
                        {Math.ceil(total / 2)}
                      </option>
                      <option value={Math.ceil(total)}>
                        {Math.ceil(total)}
                      </option>
                    </select>
                  </div>

                  <h1 className="text-light fw-lighter text-center position-absolute start-50 translate-middle pt-4">
                    <span className="bg-primary px-2 rounded">
                      চলোমান রিপোর্ট
                    </span>
                  </h1>
                </div>
              </div>

              <div className="d-flex align-content-center justify-content-around gap-5  flex-wrap  pt-5">
                {noticeData?.map((notice, index) => (
                  <div key={index} className={`col-lg-5 col-md-5 col-sm-12`}>
                    <div className="card p-3 shadow card-hover">
                      {/* <span>{indexOfFirstNotice + index + 1}</span> */}
                      <h5 className="text-center text-danger">
                        {notice?.document_name}
                      </h5>
                      <div className="my-2">
                        রিপোর্ট শুরু:
                        <DateHandler startDadeline={notice?.startDadeline} />
                        &nbsp; &nbsp;
                        <TimeStartBangla notice={notice} />
                        <br />
                        রিপোর্ট শেষ:
                        <DateHandler startDadeline={notice?.endDadeline} />
                        &nbsp; &nbsp;
                        <TimeEndBangla notice={notice} />
                      </div>

                      <div className="my-2">
                        <TimeDifference notice={notice} />
                      </div>
                      <div className="UpdateAndEdit mt-3">
                        {userInfo?.userRole === "thana" ? (
                          <div className="d-flex gap-2 align-items-center justify-content-center">
                            <Link
                              className="btn btn-sm btn-success"
                              to={`notice-answer/${notice?._id}`}
                            >
                              <i
                                className="fa fa-eye text-white"
                                aria-hidden="true"
                              ></i>
                            </Link>
                            <Link
                              className="btn btn-sm btn-success"
                              to={`thana-submission/${notice?._id}`}
                            >
                              <i
                                className="fa fa-address-card"
                                aria-hidden="true"
                              ></i>
                            </Link>
                          </div>
                        ) : userInfo?.userRole === "branch" ? (
                          <Link
                            className="btn btn-sm btn-success"
                            to={`branch-data-interface/${notice?._id}`}
                          >
                            <i className="fa fa-eye" aria-hidden="true"></i>
                          </Link>
                        ) : userInfo?.userRole === "zonal" ? (
                          <Link
                            className="btn btn-sm btn-success"
                            to={`zonal-data-interface/${notice?._id}`}
                          >
                            <i className="fa fa-eye" aria-hidden="true"></i>
                          </Link>
                        ) : userInfo?.userRole === "admin" ? (
                          <div className="d-flex gap-1">
                            <Link
                              className="btn btn-sm btn-success"
                              to={`admin-data-interface/${notice?._id}`}
                            >
                              <i className="fa fa-eye" aria-hidden="true"></i>
                            </Link>
                            <Link
                              className="btn btn-sm btn-success"
                              to={`notice-edit/${notice?._id}`}
                            >
                              <i className="fa fa-edit" aria-hidden="true"></i>
                            </Link>
                            <a
                              className="btn btn-sm btn-danger"
                              onClick={(e) => deleteItem(e, notice?._id)}
                              href="/dashboard"
                            >
                              <i className="fa fa-trash" aria-hidden="true"></i>
                            </a>
                          </div>
                        ) : (
                          <Link
                            className="btn btn-sm btn-success"
                            to="/dashboard"
                            onClick={handleReload}
                          >
                            <i
                              className="fa fa-refresh fa-spin"
                              aria-hidden="true"
                            ></i>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="userAndDataLength">
              <div className="d-flex justify-content-between align-items-center">
                <div className="showingPaginationData">
                  <p className="border p-2 rounded">
                    Showing {noticeData.length} of {total} users
                  </p>
                </div>
                <div className="paginationView">
                  <Pagination
                    usersPerPage={noticePerPage}
                    totalUsers={total}
                    paginate={paginate}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="my-4 text-center">
              <div className="col-12 col-sm-12 col-md-11 col-lg-11 m-auto">
                <NodataFound
                  message={
                    "চলমান কোনো রিপোর্ট নেই, আপনি পূর্বের রিপোর্ট হতে খোজ করুন!!!"
                  }
                />
              </div>

              {/* <h2 className="text-center p-2 text-danger fw-bold"></h2> */}

              <button
                type="button"
                className={`btn btn-success col-12 col-sm-8 col-md-4 col-lg-4 m-auto`}
                onClick={validReportHandler}
              >
                পূর্বের রিপোর্ট দেখতে ক্লিক করুন
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default NoticeBoard;
