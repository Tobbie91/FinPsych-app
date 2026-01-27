import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Questionnaire from './pages/Questionnaire';
import Submitted from './pages/Submitted';
import TestSubmission from './pages/TestSubmission';
import DiagnosticTest from './pages/DiagnosticTest';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/questionnaire" element={<Questionnaire />} />
      <Route path="/test-submission" element={<TestSubmission />} />
      <Route path="/diagnostic" element={<DiagnosticTest />} />
      <Route path="/submitted" element={<Submitted />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
