import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import BASE_URL from "../../../auth/dbUrl";

function BranchTableBody({ users }) {
  const [data, setData] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    setData(users);
  }, [users]);

  const handleDeleteClick = (e, id) => {
    e.preventDefault();
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      const response = await fetch(
        `${BASE_URL}/delete-branch-users/${deleteTargetId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization:
              "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        }
      );
      await response.json();
      if (response.ok) {
        const temp = [...data].filter((i) => i._id !== deleteTargetId);
        setData(temp);
        setSnackbar({
          open: true,
          message: "Branch has been deleted.",
          severity: "success",
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Delete failed.",
        severity: "error",
      });
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div>
      {data === null ? (
        <Typography sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
          Loading...
        </Typography>
      ) : data.length === 0 ? (
        <Typography sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
          No branch users found.
        </Typography>
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                ইউজার আইডি
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                ব্রাঞ্চের আইডি
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                ব্রাঞ্চের নাম
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                আঞ্চলের আইডি
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                ইউজার রোল
              </TableCell>
              <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data?.map((element, index) => (
              <TableRow key={index} hover>
                <TableCell sx={{ textAlign: "center" }}>
                  {element.userId}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {element.branchCode}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {element.userName}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {element.zonalCode}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {element.userRole}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  <Tooltip title="Edit Branch">
                    <IconButton
                      component={Link}
                      to={`/dashboard/update-branch/${element._id}`}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Forget Password">
                    <IconButton
                      component={Link}
                      to={`/dashboard/update-branch-password/${element._id}`}
                      color="warning"
                      size="small"
                    >
                      <VpnKeyIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Branch">
                    <IconButton
                      color="error"
                      size="small"
                      onClick={(e) => handleDeleteClick(e, element._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Thanas">
                    <IconButton
                      component={Link}
                      to={`/dashboard/branch-thana/${element.branchCode}`}
                      color="primary"
                      size="small"
                    >
                      <AddIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. Do you want to delete this branch
            user?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default BranchTableBody;
