// export const initialState = {
//   question: [
//     {
//       questionText: "Question",
//       questionType: "radio",
//       options: [
//         {
//           optionText: "Option 1",
//         },
//       ],
//       open: true,
//       required: false,
//     },
//   ],
//   questionType: "radio",
//   docName: "Ultimate Form",
//   docDescription: "add the description", // Changed to docDescription for consistency
// };

// export const actionTypes = {
//   SET_QUESTIONS: "SET_QUESTIONS", // Corrected typo
//   CHANGE_TYPE: "CHANGE_TYPE", // Renamed for consistency
//   SET_DOC_NAME: "SET_DOC_NAME",
//   SET_DOC_DESC: "SET_DOC_DESC",
// };

// const reducer = (state = initialState, action) => {
//   switch (action.type) {
//     case actionTypes.SET_QUESTIONS:
//       return {
//         ...state,
//         question: action.question,
//       };
//     case actionTypes.CHANGE_TYPE: // Renamed for consistency
//       return {
//         ...state,
//         questionType: action.questionType,
//       };
//     case actionTypes.SET_DOC_NAME:
//       return {
//         ...state,
//         docName: action.docName,
//       };
//     case actionTypes.SET_DOC_DESC:
//       return {
//         ...state,
//         docDescription: action.docDescription,
//       };
//     default:
//       return state;
//   }
// };

// export default reducer;
