import React, { Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

const ToolLayout = ({ children }) => {
  const navigate = useNavigate();

  return (
    <>
      <button onClick={() => navigate('/')} className="back-button">
        ← 返回首页
      </button>
      <Suspense fallback={<p>加载中...</p>}>{children}</Suspense>
    </>
  );
};

export default ToolLayout;
