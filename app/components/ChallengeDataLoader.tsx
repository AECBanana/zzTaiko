'use client';

import { useState, useEffect } from 'react';
import { MonthlyChallengeData, DataLoadState } from '@/app/types';
import { FileText, AlertCircle, RefreshCw, Calendar } from 'lucide-react';

interface ChallengeDataLoaderProps {
    onDataLoaded?: (data: MonthlyChallengeData[]) => void;
    darkMode?: boolean;
}

export default function ChallengeDataLoader({
    onDataLoaded,
    darkMode = false
}: ChallengeDataLoaderProps) {
    const [loadState, setLoadState] = useState<DataLoadState>({
        isLoading: true,
        error: null,
        data: []
    });

    // 加载数据
    const loadChallengeData = async () => {
        setLoadState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // 获取challenge-data目录下的所有JSON文件
            const response = await fetch('/api/challenge-data');

            if (!response.ok) {
                throw new Error(`加载数据失败: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();

            // 转换数据格式
            const monthlyData: MonthlyChallengeData[] = data.files.map((file: any) => ({
                yearMonth: file.yearMonth,
                fileName: file.fileName,
                data: file.data
            }));

            setLoadState({
                isLoading: false,
                error: null,
                data: monthlyData
            });

            // 通知父组件数据已加载
            if (onDataLoaded) {
                onDataLoaded(monthlyData);
            }

        } catch (error) {
            console.error('加载课题数据失败:', error);
            setLoadState({
                isLoading: false,
                error: error instanceof Error ? error.message : '未知错误',
                data: []
            });
        }
    };

    // 组件挂载时加载数据
    useEffect(() => {
        loadChallengeData();
    }, []);

    // 重新加载数据
    const handleReload = () => {
        loadChallengeData();
    };

    // 格式化日期
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 渲染加载状态
    if (loadState.isLoading) {
        return (
            <div className={`flex flex-col items-center justify-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <RefreshCw className="w-8 h-8 animate-spin mb-4" />
                <p>正在加载课题数据...</p>
            </div>
        );
    }

    // 渲染错误状态
    if (loadState.error) {
        return (
            <div className={`rounded-xl p-6 ${darkMode ? 'bg-red-900/20 border border-red-800' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start gap-3">
                    <AlertCircle className={`w-6 h-6 mt-0.5 ${darkMode ? 'text-red-400' : 'text-red-500'}`} />
                    <div className="flex-1">
                        <h3 className={`font-semibold mb-2 ${darkMode ? 'text-red-300' : 'text-red-800'}`}>
                            加载数据失败
                        </h3>
                        <p className={`text-sm mb-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                            {loadState.error}
                        </p>
                        <button
                            onClick={handleReload}
                            className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-red-800 hover:bg-red-700 text-white' : 'bg-red-100 hover:bg-red-200 text-red-800'}`}
                        >
                            <RefreshCw className="w-4 h-4" />
                            重新加载
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 渲染空状态
    if (loadState.data.length === 0) {
        return (
            <div className={`text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">暂无课题数据</h3>
                <p className="mb-6">challenge-data目录中没有找到JSON文件</p>
                <button
                    onClick={handleReload}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 mx-auto ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                >
                    <RefreshCw className="w-4 h-4" />
                    重新检查
                </button>
            </div>
        );
    }

    // 渲染数据统计
    return (
        <div className="space-y-6">
            {/* 数据统计 */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-sm opacity-75">月份数量</p>
                            <p className="text-2xl font-bold">{loadState.data.length}</p>
                        </div>
                    </div>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-green-500" />
                        <div>
                            <p className="text-sm opacity-75">总课题数</p>
                            <p className="text-2xl font-bold">
                                {loadState.data.reduce((sum, month) => sum + month.data.totalChallenges, 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className={`p-4 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                        <RefreshCw className="w-5 h-5 text-purple-500" />
                        <div>
                            <p className="text-sm opacity-75">最近更新</p>
                            <p className="text-sm font-medium">
                                {formatDate(loadState.data[0].data.generatedAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 月份列表 */}
            <div>
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                    数据文件 ({loadState.data.length}个)
                </h3>
                <div className="space-y-3">
                    {loadState.data.map((monthData) => (
                        <div
                            key={monthData.yearMonth}
                            className={`p-4 rounded-xl border ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-blue-900' : 'bg-blue-100'}`}>
                                        <Calendar className={`w-5 h-5 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} />
                                    </div>
                                    <div>
                                        <h4 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {monthData.yearMonth}
                                        </h4>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {monthData.fileName} • {monthData.data.totalChallenges}个课题
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        生成时间
                                    </p>
                                    <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>
                                        {formatDate(monthData.data.generatedAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex justify-end">
                <button
                    onClick={handleReload}
                    className={`px-4 py-2 rounded-lg flex items-center gap-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
                >
                    <RefreshCw className="w-4 h-4" />
                    刷新数据
                </button>
            </div>
        </div>
    );
}
