import { useState, useEffect, useContext } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import BASE_URL from "../../auth/dbUrl";
import { buildNoticeSlug } from "../../utils/noticeSlug";
import DateHandler from "../time/DateHandler";
import TimeStartBangla from "../time/TimeStartBangla";
import TimeEndBangla from "../time/TimeEndBangla";
import { AuthContext } from "../../contexts/AuthContext";

// Report destination is role-specific: each role has its own submitted-data
// page, except thana, which has no separate report view — their submission
// page doubles as the report.
const REPORT_ROUTE_PREFIX_BY_ROLE = {
  admin: "admin-data-interface",
  zonal: "zonal-data-interface",
  branch: "branch-data-interface",
  thana: "thana-submission",
};

const NoticeDetail = () => {
  const location = useLocation();
  const id = location.state?.id;
  const navigate = useNavigate();
  const { userInfo } = useContext(AuthContext);

  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) return;

    const getNotice = async () => {
      try {
        const response = await fetch(`${BASE_URL}/get-notice/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + window.localStorage.getItem("gsmToken"),
          },
        });
        const data = await response.json();
        if (response.ok) setNotice(data);
      } catch (error) {
        console.error("Error fetching notice detail:", error);
      } finally {
        setLoading(false);
      }
    };
    getNotice();
  }, [id]);

  const reportPrefix = REPORT_ROUTE_PREFIX_BY_ROLE[userInfo?.userRole];
  const reportTo = reportPrefix && notice ? `/dashboard/${reportPrefix}/${buildNoticeSlug(notice)}` : null;

  return (
    <Box sx={{ maxWidth: 900, mx: "auto" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon fontSize="small" />}
          onClick={() => navigate(-1)}
          size="small"
          variant="outlined"
          sx={{
            color: "text.secondary",
            borderColor: "divider",
            bgcolor: "#ffffff",
            fontWeight: 600,
            "&:hover": { bgcolor: "action.hover", borderColor: "divider" },
          }}
        >
          Back
        </Button>
        {reportTo && (
          <Button component={Link} to={reportTo} state={{ id }} variant="contained">
            Report
          </Button>
        )}
      </Stack>

      {loading ? (
        <Typography color="text.secondary">লোড হচ্ছে...</Typography>
      ) : !id ? (
        <Typography color="text.secondary">
          নোটিশ বোর্ড থেকে View বাটনে ক্লিক করে আসুন।
        </Typography>
      ) : !notice ? (
        <Typography color="text.secondary">নোটিশ পাওয়া যায়নি।</Typography>
      ) : (
        <>
          <Typography variant="h5" fontWeight={700}>
            {notice.document_name}
          </Typography>
          {notice.sub_title && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {notice.sub_title}
            </Typography>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3, mb: 1 }}>
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                Start Deadline
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{ py: 1 }}>
                <DateHandler startDadeline={notice.startDadeline} /> <TimeStartBangla notice={notice} />
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={600} color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                End Deadline
              </Typography>
              <Typography variant="body2" fontWeight={500} sx={{ py: 1 }}>
                <DateHandler startDadeline={notice.endDadeline} /> <TimeEndBangla notice={notice} />
              </Typography>
            </Box>
          </Box>

          <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mt: 3, mb: 1.5 }}>
            Description
          </Typography>
          <Box
            sx={{
              color: "text.primary",
              overflowWrap: "break-word",
              wordBreak: "break-word",
              "& p": { m: 0 },
            }}
            dangerouslySetInnerHTML={{ __html: notice.doc_desc || "" }}
          />

          <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mt: 3, mb: 1.5 }}>
            Questions
          </Typography>
          <Stack spacing={1}>
            {(notice.questions || []).map((q, i) => (
              <Box
                key={i}
                sx={{ border: 1, borderColor: "divider", borderRadius: 1, p: 1.5, bgcolor: "#ffffff" }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {i + 1}. {q.questionText}
                  {q.required && (
                    <Typography component="span" color="error.main">
                      {" "}*
                    </Typography>
                  )}
                </Typography>
              </Box>
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
};

export default NoticeDetail;
