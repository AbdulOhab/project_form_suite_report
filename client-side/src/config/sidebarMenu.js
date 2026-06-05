import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import DataUsageIcon from "@mui/icons-material/DataUsage";
import SubmitAnswerIcon from "@mui/icons-material/Assignment";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

const menuConfig = {
  admin: [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {
      label: "Create Notice",
      icon: <AddCircleIcon />,
      path: "/dashboard/notice/new",
    },
    {
      label: "User Management",
      icon: <ManageAccountsIcon />,
      children: [
        {
          label: "Create User",
          icon: <PersonAddIcon />,
          path: "/dashboard/create-user",
        },
        {
          label: "Users List",
          icon: <GroupIcon />,
          path: "/dashboard/users-list",
        },
        {
          label: "Import / Export Users",
          icon: <UploadFileIcon />,
          path: "/dashboard/upload-user-file",
        },
      ],
    },
    {
      label: "Admin Review",
      icon: <AssessmentIcon />,
      path: "/dashboard/admin-submission",
    },
  ],
  zonal: [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {
      label: "Data Interface",
      icon: <DataUsageIcon />,
      path: "/dashboard/zonal-data-interface",
    },
    {
      label: "Submission",
      icon: <EditNoteIcon />,
      path: "/dashboard/zonal-submission",
    },
  ],
  branch: [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {
      label: "Data Interface",
      icon: <DataUsageIcon />,
      path: "/dashboard/branch-data-interface",
    },
    {
      label: "Submission",
      icon: <EditNoteIcon />,
      path: "/dashboard/branch-edit-answer",
    },
  ],
  thana: [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {
      label: "Submit Answer",
      icon: <SubmitAnswerIcon />,
      path: "/dashboard/thana-empty-answer",
    },
    {
      label: "Submission",
      icon: <EditNoteIcon />,
      path: "/dashboard/thana-submission",
    },
  ],
};

export const getMenuItems = (role) => menuConfig[role] || menuConfig.thana;
export default menuConfig;
