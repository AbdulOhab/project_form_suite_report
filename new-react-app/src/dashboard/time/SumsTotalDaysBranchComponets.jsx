// import React, { useEffect, useMemo, useState } from "react";
// import Loader from "./Loader";
// import ZonalBangladayDate from "./ZonalBangladayDate";

// const SumsTotalDaysBranchComponets = ({
//   startDadeline,
//   range,
//   questions,
//   thanaReport,
//   totalData,
// }) => {
//   //   const { dayId, noticeId } = useParams();

//   //   console.log(startDadeline, range, questions, thanaReport, totalData);

//   const [dateList, setDateList] = useState([]);
//   const [countUnSubmit, setCountUnSubmit] = useState();
//   const [countSubmit, setCountSubmit] = useState();
//   const [sortConfig, setSortConfig] = useState({
//     key: null,
//     direction: "ascending",
//   });

//   useEffect(() => {
//     let count = 0;
//     let thanaLength = 0;
//     thanaReport?.forEach((thana) => {
//       if (thana?.answer?.length === 0) {
//         count += 1;
//       }
//     });
//     setCountUnSubmit(count);
//     setCountSubmit(thanaLength - count);
//   }, [thanaReport]);

//   useEffect(() => {
//     const generateDateList = (start, range) => {
//       const startDate = new Date(start);
//       const dates = [];
//       for (let i = 0; i < range; i++) {
//         const currentDate = new Date(startDate);
//         currentDate.setDate(startDate.getDate() + i);
//         dates.push(currentDate);
//       }
//       return dates;
//     };

//     if (startDadeline && range) {
//       const dates = generateDateList(startDadeline, range);
//       setDateList(dates);
//     }
//   }, [startDadeline, range]);

//   // console.log(branchData);
//   const handleSort = (key) => {
//     let direction = "ascending";
//     if (sortConfig.key === key && sortConfig.direction === "ascending") {
//       direction = "descending";
//     }
//     setSortConfig({ key, direction });
//   };

//   const sortedData = useMemo(() => {
//     let sortableData = Array.isArray(thanaReport) ? [...thanaReport] : [];

//     if (sortConfig.key !== null) {
//       sortableData.sort((a, b) => {
//         let aValue, bValue;

//         // Check if sorting key is a predefined column or dynamic question
//         if (sortConfig.key === "branchCode" || sortConfig.key === "userName") {
//           aValue = a[sortConfig.key];
//           bValue = b[sortConfig.key];
//         } else {
//           // Sort by question values dynamically
//           aValue = a[sortConfig.key] || 0; // Default to 0 if key doesn't exist
//           bValue = b[sortConfig.key] || 0;
//         }

//         // Handle numeric sorting
//         if (!isNaN(aValue) && !isNaN(bValue)) {
//           return sortConfig.direction === "ascending"
//             ? aValue - bValue
//             : bValue - aValue;
//         }

//         // Handle string sorting
//         if (typeof aValue === "string" && typeof bValue === "string") {
//           return sortConfig.direction === "ascending"
//             ? aValue.localeCompare(bValue)
//             : bValue.localeCompare(aValue);
//         }

//         return 0; // Default case for undefined or mixed data
//       });
//     }

//     return sortableData;
//   }, [thanaReport, sortConfig]);

//   // console.log(startDadeline, range);

//   return (
//     <>
//       {!dateList.length ? (
//         <Loader />
//       ) : (
//         dateList?.map((date, index) => {
//           if (index + 1 === Number(index)) {
//             return (
//               <React.Fragment key={index}>
//                 <div>
//                   {/* <ZonalBangladayDate
//                     day={index + 1}
//                     date={date}
//                     dataUnSubmit={countUnSubmit}
//                     dataSubmit={countSubmit}
//                   /> */}
//                 </div>
//                 <div>
//                   <table
//                     className="table table-hover table-bordered table-responsive"
//                     border={1}
//                   >
//                     <thead>
//                       <tr className="text-center bg-primary ">
//                         {questions?.map((question, index) => (
//                           <th
//                             key={index}
//                             onClick={() => handleSort(question.questionText)} // Pass question text as key
//                           >
//                             {question?.questionText}
//                             {sortConfig.key === question.questionText &&
//                               (sortConfig.direction === "ascending"
//                                 ? " ▲"
//                                 : " ▼")}
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     {/* <tbody>
//                     <tr className="text-center bg-primary fs-5">
//                       <th className="text-light">Total</th>
//                       <th></th>
//                       {totalData?.length
//                         ? totalData?.map((value, index) => (
//                             <th className="text-danger fs-6" key={index}>
//                               {value[index.toString()]}
//                             </th>
//                           ))
//                         : questions?.map((value, index) => (
//                             <th className="text-danger fs-6" key={index}>
//                               0
//                             </th>
//                           ))}
//                     </tr>
//                   </tbody> */}
//                     {/* <tbody className="bg-white">
//                     {sortedData?.map((branch, branchIndex) => (
//                       <tr key={branchIndex} className="text-center">
//                         <td>{branch?.branchCode}</td>
//                         <td>{branch?.userName}</td>
//                         {questions?.map((question, qIndex) => (
//                           <td key={`${branchIndex}-${qIndex}`}>
//                             {branch?.[question.questionText] || 0}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody> */}
//                   </table>
//                 </div>
//               </React.Fragment>
//             );
//           } else {
//             return null;
//           }
//         })
//       )}

//       {/* <h1>hello bangladesh</h1> */}
//     </>
//   );
// };

// export default SumsTotalDaysBranchComponets;
