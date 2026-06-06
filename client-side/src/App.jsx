import { HashRouter, Route, Routes } from "react-router-dom";
import Login from "./frontend/Login";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Notice from "./dashboard/Notice";
import NoticeBoard from "./dashboard/NoticeBoard";
import AuthContextProvider from "./contexts/AuthContext";
import AuthRoutes from "./routes/AuthRoutes";
import NoticeTable from "./dashboard/QuestionAnswer";
import ZonalUsers from "./dashboard/users/ZonalUsers";
import BranchUsers from "./dashboard/users/BranchUsers";
import ZonalSubmission from "./dashboard/users/database/ZonalSubmission";
import AdminReview from "./dashboard/users/database/AdminReview";
import Success from "./frontend/Success";
import EditQuestionAnswer from "./dashboard/users/database/EditQuestionAnswer";
import BranchEmptyNotice from "./dashboard/users/database/BranchEmptyNotice";
import ThanaUserInterface from "./dashboard/pages/ThanaUserInterface";
import ThanaEmptyNotice from "./dashboard/pages/ThanaEmptyNotice";
import BranchUserInterface from "./dashboard/pages/BranchUserInterface";
import BranchDataInterface from "./dashboard/pages/BranchDataInterface";
import ZonalDataInterface from "./dashboard/pages/regional/ZonalDataInterface";
import ZonalUserInterface from "./dashboard/pages/regional/ZonalUserInterface";
import ZonalDataPerDayCount from "./dashboard/pages/regional/ZonalDataPerDayCount";
import AdminDataInterface from "./dashboard/pages/admin/AdminDataInterface";
import AdminUserInterface from "./dashboard/pages/admin/AdminUserInterface";
import AdminBranchUserInterface from "./dashboard/pages/admin/AdminBranchUserInterface";
import AdminDataPerDayCount from "./dashboard/pages/admin/AdminDataPerDayCount";
import NoticeEditor from "./dashboard/NoticeEditor";
import BranchUserCreate from "./dashboard/usersCreateUpdate/create/BranchUserCreate";
import RegionalUserCreate from "./dashboard/usersCreateUpdate/create/RegionalUserCreate";
import ThanaUsersCreate from "./dashboard/usersCreateUpdate/create/ThanaUsersCreate";
import UnifiedCreateUser from "./dashboard/usersCreateUpdate/create/UnifiedCreateUser";
import UnifiedUsersList from "./dashboard/usersCreateUpdate/UnifiedUsersList";
import BranchUsersUpdate from "./dashboard/usersCreateUpdate/update/BranchUsersUpdate";
import RegionalUsersUpdate from "./dashboard/usersCreateUpdate/update/RegionalUsersUpdate";
import ThanaUsersUpdate from "./dashboard/usersCreateUpdate/update/ThanaUsersUpdate";
import AdminUsersUpdate from "./dashboard/usersCreateUpdate/update/AdminUsersUpdate";

import UpdateRegionalPassword from "./dashboard/usersCreateUpdate/forgetPassword/UpdateRegionalPassword";
import UpdateBranchPassword from "./dashboard/usersCreateUpdate/forgetPassword/UpdateBranchPassword";
import UpdateThanaPassword from "./dashboard/usersCreateUpdate/forgetPassword/UpdateThanaPassword";
import UpdateAdminPassword from "./dashboard/usersCreateUpdate/forgetPassword/UpdateAdminPassword";
import UploadUserFile from "./dashboard/usersCreateUpdate/UploadUserFile";
import PageNotFound from "./frontend/PageNotFound";
import ZonalBranchUsersTable from "./dashboard/users/usersTable/ZonalBranchUsersTable";
import ZonalBranchThana from "./dashboard/users/ZonalBranchThana";
import ThanaUsers from "./dashboard/users/ThanaUsers";
import SumsAllZonalData from "./dashboard/pages/sumsData/SumsAllZonalData";
import SumsAllBranchData from "./dashboard/pages/sumsData/SumsAllBranchData";
import SumsAllThanaData from "./dashboard/pages/sumsData/SumsAllThanaData";
import SumsThanaByBranches from "./dashboard/pages/sumsData/SumsThanaByBranches";
import EditQuestionAnswerByThana from "./dashboard/pages/EditQuestionAnswerByThana";
import SumsTotalDayThanaData from "./dashboard/pages/sumsData/SumsTotalDayThanaData";
import SumsDayByDayBranchData from "./dashboard/pages/sumsData/SumsDayByDayBranchData";
import SumsDayByDayZonalData from "./dashboard/pages/sumsData/SumsDayByDayZonalData";
import SumsZonalDataByBranch from "./dashboard/pages/sumsData/SumsZonalDataByBranch";
import RoleRoute from "./routes/RoleRoute";

function App() {
  return (
    <AuthContextProvider>
      <HashRouter>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Login />} />
            <Route path="login" element={<Login />} />
            <Route path={"success"} element={<Success />} />
          </Route>

          <Route
            path="dashboard"
            element={
              <AuthRoutes>
                <DashboardLayout />
              </AuthRoutes>
            }
          >
            {/* All authenticated users */}
            <Route index element={<NoticeBoard />} />
            <Route path={"notice/:id"} element={<Notice />} />

            {/* Thana-only pages */}
            <Route path={"thana-empty-answer/:id/:date"} element={<RoleRoute roles={["thana"]}><ThanaEmptyNotice /></RoleRoute>} />
            <Route path={"thana-edit-answer/:id/:answerId"} element={<RoleRoute roles={["thana"]}><EditQuestionAnswerByThana /></RoleRoute>} />
            <Route path={"thana-submission/:id"} element={<RoleRoute roles={["thana"]}><ThanaUserInterface /></RoleRoute>} />

            {/* Branch-only pages */}
            <Route path={"branch-interface/:dayId/:noticeId"} element={<RoleRoute roles={["branch"]}><BranchUserInterface /></RoleRoute>} />
            <Route path={"branch-edit-answer/:formId/:answerId"} element={<RoleRoute roles={["branch"]}><EditQuestionAnswer /></RoleRoute>} />
            <Route path={"branch-empty-answer/:firstId/:secondId"} element={<RoleRoute roles={["branch"]}><BranchEmptyNotice /></RoleRoute>} />
            <Route path={"branch-data-interface/:id"} element={<RoleRoute roles={["branch"]}><BranchDataInterface /></RoleRoute>} />

            {/* Zonal-only pages */}
            <Route path={"zonal-submission/:id"} element={<RoleRoute roles={["zonal"]}><ZonalSubmission /></RoleRoute>} />
            <Route path={"zonal-data-interface/:id"} element={<RoleRoute roles={["zonal"]}><ZonalDataInterface /></RoleRoute>} />
            <Route path={"zonal-data-perDayCount/:dayId/:branchId/:noticeId"} element={<RoleRoute roles={["zonal"]}><ZonalDataPerDayCount /></RoleRoute>} />
            <Route path={"zonal-interface/:dayId/:noticeId"} element={<RoleRoute roles={["zonal"]}><ZonalUserInterface /></RoleRoute>} />

            {/* Admin-only pages */}
            <Route path={"notice-edit/:id"} element={<RoleRoute roles={["admin"]}><NoticeEditor /></RoleRoute>} />
            <Route path={"notice-answer/:id"} element={<RoleRoute roles={["admin"]}><NoticeTable /></RoleRoute>} />
            <Route path={"upload-user-file"} element={<RoleRoute roles={["admin"]}><UploadUserFile /></RoleRoute>} />
            <Route path={"create-user"} element={<RoleRoute roles={["admin"]}><UnifiedCreateUser /></RoleRoute>} />
            <Route path={"users-list"} element={<RoleRoute roles={["admin"]}><UnifiedUsersList /></RoleRoute>} />
            <Route path={"update-admin/:id"} element={<RoleRoute roles={["admin"]}><AdminUsersUpdate /></RoleRoute>} />
            <Route path={"update-admin-password/:id"} element={<RoleRoute roles={["admin"]}><UpdateAdminPassword /></RoleRoute>} />
            <Route path={"branch-users"} element={<RoleRoute roles={["admin"]}><BranchUsers /></RoleRoute>} />
            <Route path={"branch-thana/:branchId"} element={<RoleRoute roles={["admin"]}><ThanaUsers /></RoleRoute>} />
            <Route path={"zonal-users"} element={<RoleRoute roles={["admin"]}><ZonalUsers /></RoleRoute>} />
            <Route path={"zonal-branch/:zonalId/branch-thana/:branchId"} element={<RoleRoute roles={["admin"]}><ZonalBranchThana /></RoleRoute>} />
            <Route path={"zonal-branch/:zonalId"} element={<RoleRoute roles={["admin"]}><ZonalBranchUsersTable /></RoleRoute>} />
            <Route path={"create-branch"} element={<RoleRoute roles={["admin"]}><BranchUserCreate /></RoleRoute>} />
            <Route path={"update-branch/:id"} element={<RoleRoute roles={["admin"]}><BranchUsersUpdate /></RoleRoute>} />
            <Route path={"update-branch-password/:id"} element={<RoleRoute roles={["admin"]}><UpdateBranchPassword /></RoleRoute>} />
            <Route path={"create-zonal"} element={<RoleRoute roles={["admin"]}><RegionalUserCreate /></RoleRoute>} />
            <Route path={"update-zonal/:id"} element={<RoleRoute roles={["admin"]}><RegionalUsersUpdate /></RoleRoute>} />
            <Route path={"update-zonal-password/:id"} element={<RoleRoute roles={["admin"]}><UpdateRegionalPassword /></RoleRoute>} />
            <Route path={"create-thana"} element={<RoleRoute roles={["admin"]}><ThanaUsersCreate /></RoleRoute>} />
            <Route path={"update-thana/:id"} element={<RoleRoute roles={["admin"]}><ThanaUsersUpdate /></RoleRoute>} />
            <Route path={"update-thana-password/:id"} element={<RoleRoute roles={["admin"]}><UpdateThanaPassword /></RoleRoute>} />
            <Route path={"admin-data-interface/:id"} element={<RoleRoute roles={["admin"]}><AdminDataInterface /></RoleRoute>} />
            <Route path={"admin-interface/:dayId/:noticeId"} element={<RoleRoute roles={["admin"]}><AdminUserInterface /></RoleRoute>} />
            <Route path={"admin-branch-interface/:dayId/:zonalId/:noticeId"} element={<RoleRoute roles={["admin"]}><AdminBranchUserInterface /></RoleRoute>} />
            <Route path={"admin-data-perDayCount/:dayId/:zonalId/:branchId/:noticeId"} element={<RoleRoute roles={["admin"]}><AdminDataPerDayCount /></RoleRoute>} />
            <Route path={"admin-submission"} element={<RoleRoute roles={["admin"]}><AdminReview /></RoleRoute>} />
            <Route path={"sums-all-zonal-data/:qId"} element={<RoleRoute roles={["admin"]}><SumsAllZonalData /></RoleRoute>} />
            <Route path={"sums-day-by-day-zonal-data/:qId/:zId"} element={<RoleRoute roles={["admin"]}><SumsDayByDayZonalData /></RoleRoute>} />
            <Route path="sums-zonal-data-by-branch/:qId/:zId" element={<RoleRoute roles={["admin"]}><SumsZonalDataByBranch /></RoleRoute>} />
            <Route path={"sums-all-branches-data/:qId"} element={<RoleRoute roles={["admin"]}><SumsAllBranchData /></RoleRoute>} />
            <Route path={"sums-all-thana-data/:qId"} element={<RoleRoute roles={["admin"]}><SumsAllThanaData /></RoleRoute>} />
            <Route path={"sums-Totol-day-thana-data/:qId/:zId/:bId/:tId"} element={<RoleRoute roles={["admin"]}><SumsTotalDayThanaData /></RoleRoute>} />
            <Route path={"sums-thana-by-branch/:qId/:bId"} element={<RoleRoute roles={["admin"]}><SumsThanaByBranches /></RoleRoute>} />
            <Route path={"sums-day-by-day-branch-data/:qId/:zId/:bId"} element={<RoleRoute roles={["admin"]}><SumsDayByDayBranchData /></RoleRoute>} />
          </Route>
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </HashRouter>
    </AuthContextProvider>
  );
}

export default App;
