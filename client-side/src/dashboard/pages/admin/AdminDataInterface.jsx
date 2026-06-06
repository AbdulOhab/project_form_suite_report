import React, { useEffect, useState } from "react";
import AdminTableDataInterfce from "./AdminTableDataInterfce";
import { Link, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  IconButton,
  Divider,
} from "@mui/material";
import {
  Close,
  ArrowBack,
  InfoOutlined,
  AccountTreeOutlined,
  StorefrontOutlined,
  LocationCityOutlined,
  TableChartOutlined,
} from "@mui/icons-material";
import DateDifferenceComponent from "../../time/DateDifferenceComponent";
import BASE_URL from "../../../auth/dbUrl";
import convertToBengaliNumber from "../../time/NumberConverter";

function AdminDataInterface() {
  const { id } = useParams();

  const [descriptionAlert, setDescriptionAlert] = useState(false);
  const [zonalReport, setZonalReport] = useState();
  const [notice, setNotice] = useState();
  const [totalData, setTotalData] = useState();

  useEffect(() => {
    const getZonalUsers = async () => {
      try {
        const response = await fetch(`${BASE_URL}/admin/data-interface/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        const data = await response.json();
        if (response.ok) {
          setZonalReport(data?.tempZonal);
          setNotice(data?.question);
          setTotalData(data?.sumsArray);
        } else {
          throw new Error("Failed to fetch");
        }
      } catch (error) {
        console.error("Error fetching notice data:", error);
      }
    };
    getZonalUsers();
  }, [id]);

  const validCardData = (endDadeline) =>
    Math.ceil((new Date(endDadeline) - new Date()) / (1000 * 60 * 60 * 24));

  const navLinks = [
    { label: "এক নজরে অঞ্চল", to: `/dashboard/sums-all-zonal-data/${notice?._id}`, icon: <AccountTreeOutlined fontSize="small" /> },
    { label: "এক নজরে ব্রাঞ্চ", to: `/dashboard/sums-all-branches-data/${notice?._id}`, icon: <StorefrontOutlined fontSize="small" /> },
    { label: "এক নজরে থানা", to: `/dashboard/sums-all-thana-data/${notice?._id}`, icon: <LocationCityOutlined fontSize="small" /> },
  ];

  return (
    <>
      {/* Description dialog */}
      <Dialog open={descriptionAlert} onClose={() => setDescriptionAlert(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography fontWeight="bold">{notice?.document_name}</Typography>
          <IconButton onClick={() => setDescriptionAlert(false)} size="small"><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{notice?.doc_desc}</DialogContentText>
        </DialogContent>
      </Dialog>

      <Box sx={{ px: { xs: 1, sm: 2, md: 3 }, py: 2 }}>

        {/* ── Compact top bar ── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1, flexWrap: "wrap", gap: 1 }}>
          <Button component={Link} to="/dashboard" size="small" startIcon={<ArrowBack />} variant="text" sx={{ fontWeight: 600 }}>
            ফিরে যান
          </Button>
          <Box sx={{ textAlign: "center", flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight="bold" noWrap>
              {notice?.document_name || "Loading..."}
            </Typography>
            {notice?.sub_title && (
              <Typography variant="caption" color="text.secondary">{notice.sub_title}</Typography>
            )}
          </Box>
          <Button size="small" startIcon={<InfoOutlined />} variant="outlined" onClick={() => setDescriptionAlert(true)} sx={{ fontWeight: 600 }}>
            বিবরণ
          </Button>
        </Box>

        {/* ── Compact timer ── */}
        <Box sx={{ mb: 2 }}>
          {validCardData(notice?.endDadeline) < 0 ? (
            <Chip
              color="error"
              variant="outlined"
              size="small"
              label={`নোটিশ প্রদানের সময় শেষ হয়েছে ${convertToBengaliNumber(Math.abs(validCardData(notice?.endDadeline)))} দিন পূর্বে`}
              sx={{ fontWeight: "bold" }}
            />
          ) : (
            <DateDifferenceComponent
              startDadeline={notice?.startDadeline}
              range={notice?.range}
              timeStart={notice?.timeStart}
              timeEnd={notice?.timeEnd}
              endDadeline={notice?.endDadeline}
            />
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* ── Nav pills ── */}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {navLinks.map((nav) => (
            <Button
              key={nav.label}
              component={Link}
              to={nav.to}
              variant="outlined"
              size="small"
              startIcon={nav.icon}
              sx={{ borderRadius: 2, fontWeight: 600, textTransform: "none", fontSize: "0.82rem" }}
            >
              {nav.label}
            </Button>
          ))}
        </Box>

        {/* ── Table card ── */}
        <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          <Box sx={{ px: 2, py: 1.5, bgcolor: "grey.50", borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", gap: 1 }}>
            <TableChartOutlined fontSize="small" color="action" />
            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">দৈনিক রিপোর্ট সারসংক্ষেপ</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <AdminTableDataInterfce
              startDadeline={notice?.startDadeline}
              range={notice?.range}
              totalData={totalData}
              questions={notice?.questions}
              zonalReport={zonalReport}
            />
          </Box>
        </Paper>

      </Box>
    </>
  );
}

export default AdminDataInterface;
