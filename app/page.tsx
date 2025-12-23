'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import MonthlyChallengeTable from '@/app/components/MonthlyChallengeTable';
import { MonthlyChallengeData } from '@/app/types';
import { Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { useDarkMode } from '@/app/hooks/useDarkMode';

export default function HomePage() {
  const { darkMode, toggleDarkMode, isUsingSystem, getToggleLabel, getToggleText } = useDarkMode();
  const [monthlyData, setMonthlyData] = useState<MonthlyChallengeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载数据
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/challenge-data');

      if (!response.ok) {
        throw new Error(`加载数据失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.files) {
        const formattedData: MonthlyChallengeData[] = data.files.map((file: any) => ({
          yearMonth: file.yearMonth,
          fileName: file.fileName,
          data: file.data
        }));
        setMonthlyData(formattedData);
      } else {
        throw new Error(data.error || '数据格式错误');
      }
    } catch (error) {
      console.error('加载课题数据失败:', error);
      setError(error instanceof Error ? error.message : '未知错误');
    } finally {
      setIsLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-200">
      {/* 导航栏 */}
      <Navbar
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        isUsingSystem={isUsingSystem}
        toggleLabel={getToggleLabel()}
        toggleText={getToggleText()}
      />

      {/* 主内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和刷新按钮 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            最新课题
          </h1>
        </div>

        {/* 加载状态 */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mb-4 text-[#EA580C]" />
            <p className="text-gray-600 dark:text-gray-400">正在加载课题数据...</p>
          </div>
        )}

        {/* 错误状态 */}
        {error && !isLoading && (
          <div className="rounded-xl p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 mt-0.5 text-red-500 dark:text-red-400" />
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-red-800 dark:text-red-300">
                  加载数据失败
                </h3>
                <p className="text-sm mb-4 text-red-600 dark:text-red-400">
                  {error}
                </p>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 text-red-800 dark:text-white rounded-lg flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  重新加载
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!isLoading && !error && monthlyData.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              暂无课题
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              challenge-data目录中没有找到JSON文件
            </p>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              重新检查
            </button>
          </div>
        )}

        {/* 表格展示 */}
        {!isLoading && !error && monthlyData.length > 0 && (
          <div className="space-y-8">
            {monthlyData.map((monthData, index) => {
              // 第一个（最新）月份：showHeader={false} expandable={false}
              // 剩下的旧月份：showHeader={true} expandable={true}
              const isLatest = index === 0;
              const showHeader = !isLatest;
              const expandable = !isLatest;

              return (
                <div key={monthData.yearMonth}>
                  {showHeader && (
                    <div className="flex items-center gap-2 mb-4">
                      <Calendar className="w-5 h-5 text-[#EA580C]" />
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {monthData.yearMonth}
                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                          ({monthData.data.totalChallenges}首)
                        </span>
                      </h2>
                    </div>
                  )}
                  <MonthlyChallengeTable
                    monthlyData={monthData}
                    darkMode={darkMode}
                    showHeader={showHeader}
                    expandable={expandable}
                  />
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
