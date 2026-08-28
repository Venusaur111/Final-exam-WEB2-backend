import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { BrowserRouter, Navigate, Route, Routes} from "react-router-dom";

import Login from "./pages/login/Login";
import Dashboard from "./pages/admin/Dashboard";
import StudentPage from "./pages/admin/StudentPage";
import CoursePage from "./pages/admin/CoursePage";
import ExamPage from "./pages/admin/ExamPage";
import EditionQuestion from "./pages/admin/EditionQuestion";

import ExamList from "./pages/student/ExamList";
import ResultList from "./pages/student/ResultList";
import ExamStudent from "./pages/student/ExamStudent";




const HomeRedirect = ()=>{
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={user?.role === "admin" ? "/admin" : "/student"}
      replace
    />
  );
};

const App = ()=> {
  return(
    <>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />}/>
            <Route path="*" element={<HomeRedirect />}/>

            <Route element={<ProtectedRoute role="admin" />}>
              <Route element={<Layout />}>
                <Route path="/admin" element={<Dashboard/>}/>
                <Route path="/admin/students" element={<StudentPage/>}/>
                <Route path="/admin/courses" element={<CoursePage/>}/>
                <Route path="/admin/exams" element={<ExamPage/>}/> {/**route for exam lists */}
                <Route path="/admin/exams/:id/questions" element={<EditionQuestion/>}/> {/**route for seing a specific exam */}
                <Route path="/admin/exams/:id/results"/> 
              </Route>
            </Route>

            <Route element={<ProtectedRoute role="student"/>}>
              <Route element={<Layout />}>
                <Route path="/student" element={<ExamList/>}/>
                <Route path="/student/results" element={<ResultList/>}/>
                <Route path="/student/exams/:id" element={<ExamStudent/>}/> {/**route when the student want to pass an exam */}
                <Route path="/student/exams/:id/result" element={<></>}/> 
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </>
  );
  
}

export default App;