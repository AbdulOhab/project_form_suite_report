const SweetAlert = ({ icon, message }) => {
  // Callers now handle their own MUI Snackbar/Dialog.
  // This function simply returns the args so callers can use them.
  return { icon, message };
};
export default SweetAlert;
