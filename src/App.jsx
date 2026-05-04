// src/App.jsx
import React, { useEffect, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import RequireAuth from './components/common/RequireAuth';
import AppLayout from './components/common/AppLayout';
import { useDispatch, useSelector } from 'react-redux';
import { restoreSession } from './store/auth/authSlice';
import Home from './pages/Home/Home'; 
import Layout from './layout/Layout';
import AddCandidate from './pages/Addcandidate/AddCandidate';
import UploadPDF from './pages/Addcandidate/UploadPDF';
import UploadCSV from './pages/Addcandidate/UploadCSV';  
import GetCandidate from './pages/Addcandidate/GetCandidate';

const LoginPage = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
    </div>
  );
}

export default function App() {
  const dispatch = useDispatch();
  const { loading, initialized } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(restoreSession());
  }, [dispatch]);

  if (loading && !initialized) {
    return <Spinner />;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="login" element={<LoginPage />} />

        <Route element={<Layout type="public" />}>
          <Route index element={<Home />} />
        </Route>

        <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/candidates" element={<AddCandidate />} />
          <Route path="/candidate/upload-pdf" element={<UploadPDF />} />
          <Route path="/candidate/upload-csv" element={<UploadCSV />} />
          <Route path="/dashboard/get-candidates" element={<GetCandidate />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
