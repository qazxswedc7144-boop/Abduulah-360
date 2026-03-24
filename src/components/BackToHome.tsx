import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BackToHome: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on home page to avoid redundancy if needed, 
  // but the user said "Ensure no page exists without this button".
  // So I will keep it even on /home, or maybe just hide it on /home to be sensible?
  // "Ensure no page exists without this button" is a very strong requirement.
  // I'll keep it on all pages.

  return (
    <button
      onClick={() => navigate('/home')}
      className="fixed top-4 left-4 z-[9999] flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full font-black text-xs shadow-lg hover:bg-blue-100 transition-all border border-blue-200 active:scale-95"
      dir="rtl"
    >
      ← الرجوع للرئيسية
    </button>
  );
};

export default BackToHome;
