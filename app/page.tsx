'use client';

import { useState } from 'react';
import Navbar from '@/app/components/Navbar';
import { BookOpen, Users, Calendar, BarChart, FileText, Settings, ChevronRight, Plus, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);

  // 切换暗色模式
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };


  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* 导航栏 */}
      <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      </main>
    </div>
  );
}
