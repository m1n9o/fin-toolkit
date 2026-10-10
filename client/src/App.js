import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import ToolLayout from './components/ToolLayout';
import tools from './tools';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        {tools.map(({ path, component: Tool }) => (
          <Route
            key={path}
            path={`/${path}`}
            element={<ToolLayout><Tool /></ToolLayout>}
          />
        ))}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
