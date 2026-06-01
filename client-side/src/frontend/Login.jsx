import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Paper, Typography, TextField, Button, Alert, Snackbar, Collapse, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AuthContext } from "../contexts/AuthContext";
import BASE_URL from "../auth/dbUrl";

const Login = () => {
  const [formErrors, setFormErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, severity: "success", message: "" });
  const { checkAuth, setcheckAuth } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    const storedPath = sessionStorage.getItem("authPrevlink") || "/dashboard";
    const pathName = window?.authPrevlink?.pathname || storedPath;

    if (checkAuth?.isAuth && pathName) {
      navigate(pathName);
      sessionStorage.setItem("authPrevlink", pathName);
    } else if (checkAuth?.isAuth) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [checkAuth, navigate]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  async function submitHandler(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    setFormErrors({});

    await fetch(`${BASE_URL}/submit`, {
      method: "POST",
      body: formData,
    })
      .then(async (res) => {
        let data = await res.json();
        return {
          status: res.status,
          data,
        };
      })
      .then((res) => {
        if (res.status === 422) {
          let tempError = {
            userId: [],
            password: [],
          };
          res.data?.errors?.forEach((e, index) => {
            if (!tempError[e.path]) {
              tempError[e.path] = [];
            }
            tempError[e.path].push(e.msg);
          });
          setFormErrors(tempError);
        }
        if (res.status === 200) {
          window.localStorage.setItem("gsmToken", res.data.token);
          setcheckAuth({
            isAuth: true,
            gsmToken: res.data.token,
          });
          setSnackbar({ open: true, severity: "success", message: res.data.message });
        } else if (res.status === 404) {
          setSnackbar({ open: true, severity: "error", message: res.data.message });
        } else {
          setSnackbar({ open: true, severity: "error", message: res.data.errors[0].msg });
        }
      })
      .catch((err) => {
        console.log(err, "error");
        setSnackbar({ open: true, severity: "error", message: err.message });
      });
  }

  return (
    <>
      {!checkAuth?.isAuth ? (
        <Container maxWidth="sm">
          <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
            <Typography variant="h4" align="center" color="primary" fontWeight="bold" gutterBottom>
              রিপোর্ট সেন্টার
            </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 3 }}>
              Login to your account
            </Typography>

            <Box component="form" onSubmit={submitHandler} encType="multipart/form-data" noValidate>
              <TextField
                fullWidth
                id="userId"
                name="userId"
                label="ইউজার আইডি"
                type="number"
                margin="normal"
                variant="outlined"
                placeholder="ইউজার আইডি"
                error={!!formErrors?.userId?.length}
                helperText={
                  formErrors?.userId?.length
                    ? formErrors.userId.map((msg, i) => (
                        <span key={i} style={{ display: "block" }}>{msg}</span>
                      ))
                    : ""
                }
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                label="পাসওয়ার্ড"
                type="password"
                margin="normal"
                variant="outlined"
                placeholder="পাসওয়ার্ড"
                error={!!formErrors?.password?.length}
                helperText={
                  formErrors?.password?.length
                    ? formErrors.password.map((msg, i) => (
                        <span key={i} style={{ display: "block" }}>{msg}</span>
                      ))
                    : ""
                }
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 3, mb: 2 }}
              >
                জমা দিন
              </Button>
            </Box>
          </Paper>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      ) : null}
    </>
  );
};

export default Login;
