import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Shell from './components/Shell';
import ToolLayout from './components/ToolLayout';
import tools from './tools';

function App() {
  return (
    <Router>
      <Shell>
        <Routes>
          <Route path="/" element={<Home />} />
          {tools.map((tool) => (
            <Route
              key={tool.path}
              path={`/${tool.path}`}
              element={<ToolLayout tool={tool}><tool.component /></ToolLayout>}
            />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </Router>
  );
}

export default App;
