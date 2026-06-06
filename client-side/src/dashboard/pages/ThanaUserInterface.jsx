import React, { useState } from "react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import { Close, ArrowBack } from "@mui/icons-material";
import DateDifferenceComponent from "../time/DateDifferenceComponent";
import DateByDayCount from "../time/DateByDayCount";
import BASE_URL from "../../auth/dbUrl";

function ThanaUserInterface() {
  const { id } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);

  const [answer, setAnswer] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();

  useEffect(() => {
    const getThanaUsers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/thana/data-checkout/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        const data = await response.json();

        if (response.ok) {
          setAnswer(data.answers);
          setNotice(data.question);
          setTotalData(data.sumsArray);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getThanaUsers();
  }, [id]);

  const descriptionHandler = () => {
    setDescriptionAlert(true);
  };
  const descriptionCloserHandler = () => {
    setDescriptionAlert(false);
  };

  return (
    <>
      <Box>
        <Paper elevation={0} sx={{ my: 0.5 }}>
          {/* Description Dialog */}
          <Dialog
            open={descriptionAlert}
            onClose={descriptionCloserHandler}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle sx={{ display: "flex", justifyContent: "flex-end" }}>
              <IconButton onClick={descriptionCloserHandler} size="small">
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Typography>{notice?.doc_desc}</Typography>
            </DialogContent>
          </Dialog>

          {/* Header Section */}
          <Paper elevation={0} sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {/* Left - Deadline */}
              <Box sx={{ border: 1, borderColor: "divider", p: 1.5 }}>
                <DateDifferenceComponent
                  startDadeline={notice?.startDadeline}
                  endDadeline={notice?.endDadeline}
                  range={notice?.range}
                  timeStart={notice?.timeStart}
                  timeEnd={notice?.timeEnd}
                />
              </Box>

              {/* Middle - Title */}
              <Box>
                <Typography
                  align="center"
                  variant="h4"
                  fontWeight={600}
                  color="success.main"
                >
                  {notice?.document_name}
                </Typography>
                {notice?.sub_title && (
                  <Typography align="center" variant="body1">
                    {notice?.sub_title}
                  </Typography>
                )}
              </Box>

              {/* Right - Actions */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                {!descriptionAlert && (
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={descriptionHandler}
                    sx={{ fontWeight: 600 }}
                  >
                    Notice
                  </Button>
                )}
                <Button
                  component={Link}
                  to="/dashboard"
                  variant="contained"
                  color="success"
                  startIcon={<ArrowBack />}
                  sx={{ p: 1 }}
                >
                  Back
                </Button>
              </Box>
            </Box>
          </Paper>
        </Paper>

        {/* Table Section */}
        <Paper elevation={3} sx={{ my: 1.5, p: 2, borderRadius: 1 }}>
          <DateByDayCount
            startDadeline={notice?.startDadeline}
            range={notice?.range}
            thanaReport={answer}
            questions={notice?.questions}
            totalData={totalData}
          />
        </Paper>
      </Box>
    </>
  );
}

export default ThanaUserInterface;
