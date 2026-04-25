import Swal from "sweetalert2";

const SweetAlert = ({ icon, message }) => {
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    },
  });
  return Toast.fire({
    icon,
    title: message,
    // color: "#00000",
  });
};
export default SweetAlert;
