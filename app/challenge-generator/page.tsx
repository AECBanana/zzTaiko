'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import ChallengeForm from '@/app/components/ChallengeForm';
import ChallengeList from '@/app/components/ChallengeList';
import { Challenge, SongOption } from '@/app/types';
import { fetchSongs } from '@/app/lib/api';
import { Download, Trash2, Plus, FileText } from 'lucide-react';

export default function ChallengeGeneratorPage() {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [songOptions, setSongOptions] = useState<SongOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // 初始化：从localStorage加载已保存的课题，并加载歌曲选项
    useEffect(() => {
        // 从localStorage加载已保存的课题
        const savedChallenges = localStorage.getItem('taiko_challenges');
        if (savedChallenges) {
            try {
                const parsedChallenges = JSON.parse(savedChallenges);
                setChallenges(parsedChallenges);
            } catch (error) {
                console.error('加载已保存课题失败:', error);
                // 如果解析失败，清空localStorage中的数据
                localStorage.removeItem('taiko_challenges');
            }
        }

        loadSongOptions();
    }, []);

    // 加载歌曲选项
    const loadSongOptions = async () => {
        setLoading(true);
        try {
            const { songs } = await fetchSongs({ limit: 100 });
            const options: SongOption[] = songs.map(song => ({
                id: song.id,
                title: song.title,
                title_cn: song.title_cn,
                levels: Object.keys(song.level)
            }));
            setSongOptions(options);
        } catch (error) {
            console.error('加载歌曲选项失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 搜索歌曲
    const handleSearchSongs = async (query: string) => {
        setSearchQuery(query);
        if (!query.trim()) {
            loadSongOptions();
            return;
        }

        setLoading(true);
        try {
            // 同时搜索英文标题和中文标题
            const [englishResults, chineseResults] = await Promise.all([
                fetchSongs({ title: query, limit: 50 }),
                fetchSongs({ title_cn: query, limit: 50 })
            ]);

            // 合并结果，去重
            const allSongs = [...englishResults.songs, ...chineseResults.songs];
            const uniqueSongs = Array.from(new Map(allSongs.map(song => [song.id, song])).values());

            const options: SongOption[] = uniqueSongs.map(song => ({
                id: song.id,
                title: song.title,
                title_cn: song.title_cn,
                levels: Object.keys(song.level)
            }));
            setSongOptions(options);
        } catch (error) {
            console.error('搜索歌曲失败:', error);
        } finally {
            setLoading(false);
        }
    };

    // 保存课题到localStorage
    useEffect(() => {
        if (challenges.length > 0) {
            localStorage.setItem('taiko_challenges', JSON.stringify(challenges));
        } else {
            // 如果课题为空，从localStorage中移除数据
            localStorage.removeItem('taiko_challenges');
        }
    }, [challenges]);

    // 添加课题
    const handleAddChallenge = (challenge: Challenge) => {
        setChallenges(prev => [...prev, challenge]);
    };

    // 删除课题
    const handleDeleteChallenge = (id: string) => {
        setChallenges(prev => prev.filter(challenge => challenge.id !== id));
    };

    // 更新课题
    const handleUpdateChallenge = (updatedChallenge: Challenge) => {
        setChallenges(prev => prev.map(challenge =>
            challenge.id === updatedChallenge.id ? updatedChallenge : challenge
        ));
    };

    // 清空所有课题
    const handleClearAll = () => {
        if (challenges.length > 0 && window.confirm('确定要清空所有课题吗？')) {
            setChallenges([]);
        }
    };

    // 生成并下载JSON
    const handleGenerateJSON = () => {
        if (challenges.length === 0) {
            alert('请先添加至少一个课题');
            return;
        }

        const data = {
            challenges: challenges,
            generatedAt: new Date().toISOString(),
            totalChallenges: challenges.length
        };

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        // 生成年份-月份格式的文件名，例如：2025-12.json
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const fileName = `${year}-${month}.json`;

        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // 切换暗色模式
    const toggleDarkMode = () => {
        setDarkMode(prevDarkMode => {
            const newDarkMode = !prevDarkMode;
            if (newDarkMode) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
            return newDarkMode;
        });
    };

    return (
        <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
            {/* 导航栏 */}
            <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

            {/* 主内容 */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 页面标题 */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <FileText className="w-8 h-8" />
                        课题生成器
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        创建和管理课题
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 左侧：表单区域 */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    添加新课题
                                </h2>
                            </div>

                            <ChallengeForm
                                songOptions={songOptions}
                                loading={loading}
                                searchQuery={searchQuery}
                                onSearch={handleSearchSongs}
                                onSubmit={handleAddChallenge}
                                darkMode={darkMode}
                            />
                        </div>
                    </div>

                    {/* 右侧：课题列表和操作区域 */}
                    <div className="lg:col-span-2">
                        {/* 操作按钮 */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                            <div className="flex flex-wrap gap-4">
                                <button
                                    onClick={handleGenerateJSON}
                                    disabled={challenges.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    生成JSON并下载
                                </button>

                                <button
                                    onClick={handleClearAll}
                                    disabled={challenges.length === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    清空所有课题
                                </button>

                                <div className="ml-auto flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <span>已添加课题:</span>
                                    <span className="font-bold text-blue-600 dark:text-blue-400">
                                        {challenges.length} 个
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 课题列表 */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    课题列表
                                </h2>
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    点击课题可编辑
                                </span>
                            </div>

                            {challenges.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                        <FileText className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        暂无课题
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        请在左侧表单中添加第一个课题
                                    </p>
                                </div>
                            ) : (
                                <ChallengeList
                                    challenges={challenges}
                                    songOptions={songOptions}
                                    onDelete={handleDeleteChallenge}
                                    onUpdate={handleUpdateChallenge}
                                    darkMode={darkMode}
                                />
                            )}
                        </div>

                        {/* JSON预览（可选） */}
                        {challenges.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    JSON预览
                                </h3>
                                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto max-h-64">
                                    <pre className="text-sm text-gray-700 dark:text-gray-300">
                                        {JSON.stringify({ challenges }, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
