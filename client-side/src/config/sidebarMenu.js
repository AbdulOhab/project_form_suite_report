import DashboardIcon from "@mui/icons-material/Dashboard";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import GroupIcon from "@mui/icons-material/Group";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import EditNoteIcon from "@mui/icons-material/EditNote";
import HomeIcon from "@mui/icons-material/Home";
import DataUsageIcon from "@mui/icons-material/DataUsage";
import SubmitAnswerIcon from "@mui/icons-material/Assignment";

const menuConfig = {
  admin: [
    { label: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    {
      label: "Create Notice",
      icon: <AddCircleIcon />,
      path: "/dashboard/notice/new",
    },
    {
      label: "Create Users",
      icon: <PersonAddIcon />,
      children: [
        {
          label: "Upload CSV File",
          icon: <UploadFileIcon />,
          path: "/dashboard/upload-user-file",
        },
        {
          label: "Create Zonal",
          icon: <PersonAddIcon />,
          path: "/dashboard/create-zonal",
        },
        {
          label: "Create Branch",
          icon: <PersonAddIcon />,
          path: "/dashboard/create-branch",
        },
        {
          label: "Create Thana",
          icon: <PersonAddIcon />,
          path: "/dashboard/create-thana",
        },
      ],
    },
    {
      label: "Users List",
      icon: <GroupIcon />,
      children: [
        {
          label: "Zonal Users",
          icon: <PeopleIcon />,
          path: "/dashboard/zonal-users",
        },
        {
          label: "Branch Users",
          icon: <PeopleIcon />,
          path: "/dashboard/branch-users",
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
