import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage, RegisterPage } from './features/auth';
import { BooksPage } from './pages/BooksPage';
import { ProtectedRoute } from './components';

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route
          path="/books"
          element={
            <ProtectedRoute>
              <BooksPage />
            </ProtectedRoute>
          }
        />
        
        {/* 404 - catch all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
