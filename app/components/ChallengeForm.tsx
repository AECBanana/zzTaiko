'use client';

import { useState, useEffect, useRef } from 'react';
import { Challenge, ChallengeFormData, ChallengeReward, SongOption } from '@/app/types';
import { fetchSongs } from '@/app/lib/api';
import { Search, Music, Star, Target, Gift, MessageSquare, ChevronDown, Loader2, Plus } from 'lucide-react';

interface ChallengeFormProps {
    songOptions: SongOption[];
    loading: boolean;
    searchQuery: string;
    onSearch: (query: string) => void;
    onSubmit: (challenge: Challenge) => void;
    darkMode: boolean;
}

export default function ChallengeForm({
    songOptions,
    loading,
    searchQuery,
    onSearch,
    onSubmit,
    darkMode
}: ChallengeFormProps) {
    const [formData, setFormData] = useState<ChallengeFormData>({
        reward: '15币'
    });

    const [selectedSong, setSelectedSong] = useState<SongOption | null>(null);
    const [availableDifficulties, setAvailableDifficulties] = useState<string[]>([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('');
    const [stars, setStars] = useState<number>(0);
    const [showSongDropdown, setShowSongDropdown] = useState(false);
    const [songDetails, setSongDetails] = useState<any>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // 奖励选项
    const rewardOptions: ChallengeReward[] = ['15币', '30币', '45币', '其他奖励'];

    // 当选择歌曲时，获取歌曲详情和可用难度
    useEffect(() => {
        if (formData.songId && songOptions.length > 0) {
            const song = songOptions.find(s => s.id === formData.songId);
            if (song) {
                setSelectedSong(song);
                setAvailableDifficulties(song.levels);

                // 获取歌曲详情以显示星数
                fetchSongDetails(song.id);
            }
        } else {
            setSelectedSong(null);
            setAvailableDifficulties([]);
            setSelectedDifficulty('');
            setStars(0);
        }
    }, [formData.songId, songOptions]);

    // 当选择难度时，更新星数
    useEffect(() => {
        if (selectedDifficulty && songDetails) {
            const levelData = songDetails.level[selectedDifficulty];
            if (levelData) {
                setStars(levelData.constant);
            }
        }
    }, [selectedDifficulty, songDetails]);

    // 点击外部关闭下拉框
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowSongDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    // 获取歌曲详情
    const fetchSongDetails = async (songId: number) => {
        try {
            const { songs } = await fetchSongs({ id: songId });
            if (songs.length > 0) {
                setSongDetails(songs[0]);
            }
        } catch (error) {
            console.error('获取歌曲详情失败:', error);
        }
    };

    // 处理表单提交
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const challenge: Challenge = {
            id: `challenge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            songId: formData.songId!,
            songTitle: selectedSong?.title || '',
            songTitleCn: selectedSong?.title_cn || '',
            difficulty: selectedDifficulty,
            stars: stars,
            requiredScore: formData.requiredScore || 0,
            reward: formData.reward,
            customReward: formData.reward === '其他奖励' ? formData.customReward : undefined,
            notes: formData.notes,
            createdAt: new Date().toISOString()
        };

        onSubmit(challenge);
        resetForm();
    };

    // 验证表单
    const validateForm = (): boolean => {
        if (!formData.songId) {
            alert('请选择歌曲');
            return false;
        }
        if (!selectedDifficulty) {
            alert('请选择难度');
            return false;
        }
        if (!formData.requiredScore || formData.requiredScore <= 0) {
            alert('请输入有效的过关分数');
            return false;
        }
        if (formData.reward === '其他奖励' && !formData.customReward?.trim()) {
            alert('请输入其他奖励内容');
            return false;
        }
        return true;
    };

    // 重置表单
    const resetForm = () => {
        setFormData({
            reward: '15币'
        });
        setSelectedSong(null);
        setSelectedDifficulty('');
        setStars(0);
        setSongDetails(null);
    };

    // 处理歌曲选择
    const handleSongSelect = (song: SongOption) => {
        setFormData(prev => ({ ...prev, songId: song.id }));
        setShowSongDropdown(false);
    };

    // 处理搜索框聚焦
    const handleSearchFocus = () => {
        // 只有当搜索框聚焦且有歌曲选项时，才打开下拉框
        if (songOptions.length > 0) {
            setShowSongDropdown(true);
        }
    };

    // 处理搜索框变化
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSearch(e.target.value);
        // 如果搜索框有内容且用户正在输入（搜索框聚焦状态），自动展开下拉框
        if (e.target.value.trim() !== '') {
            setShowSongDropdown(true);
        }
    };

    // 处理难度选择
    const handleDifficultySelect = (difficulty: string) => {
        setSelectedDifficulty(difficulty);
    };

    // 处理奖励选择
    const handleRewardSelect = (reward: ChallengeReward) => {
        setFormData(prev => ({ ...prev, reward }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* 歌曲选择 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                        <Music className="w-4 h-4" />
                        歌曲选择
                    </div>
                </label>

                <div className="relative">
                    {/* 搜索框 */}
                    <div className="flex gap-2 mb-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onFocus={handleSearchFocus}
                                placeholder="搜索歌曲..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        {loading && (
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                        )}
                    </div>

                    {/* 歌曲选择下拉框 */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setShowSongDropdown(!showSongDropdown)}
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-left flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                {selectedSong ? (
                                    <>
                                        <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                                            <Music className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {selectedSong.title_cn}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {selectedSong.title}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400">选择歌曲...</span>
                                )}
                            </div>
                            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${showSongDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showSongDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                                {songOptions.length === 0 ? (
                                    <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-center">
                                        {loading ? '加载中...' : '未找到歌曲'}
                                    </div>
                                ) : (
                                    songOptions.map(song => (
                                        <button
                                            key={song.id}
                                            type="button"
                                            onClick={() => handleSongSelect(song)}
                                            className="w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                        >
                                            <div className="font-medium text-gray-900 dark:text-white">
                                                {song.title_cn}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {song.title}
                                            </div>
                                            <div className="flex gap-1 mt-1">
                                                {song.levels.map(level => (
                                                    <span
                                                        key={level}
                                                        className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                                                    >
                                                        <img
                                                            src={`/level_${level}.png`}
                                                            alt={`难度 ${level}`}
                                                            className="w-6 h-6 sm:w-5 sm:h-5"
                                                            title={`难度 ${level}`}
                                                        />
                                                    </span>
                                                ))}
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 难度选择 */}
            {availableDifficulties.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        难度选择
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {availableDifficulties.map(difficulty => (
                            <button
                                key={difficulty}
                                type="button"
                                onClick={() => handleDifficultySelect(difficulty)}
                                className={`px-4 py-2 rounded-lg transition-colors ${selectedDifficulty === difficulty
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                <img
                                    src={`/level_${difficulty}.png`}
                                    alt={`难度 ${difficulty}`}
                                    className="w-6 h-6 sm:w-5 sm:h-5"
                                    title={`难度 ${difficulty}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* 星数显示 */}
            {stars > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Star className="w-5 h-5 text-yellow-500" />
                            <span className="font-medium text-gray-900 dark:text-white">星数</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {stars.toFixed(1)}
                        </div>
                    </div>
                </div>
            )}

            {/* 过关分数 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        需要过关的分数（单位：万）
                    </div>
                </label>
                <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.requiredScore || ''}
                    onChange={(e) => setFormData(prev => ({
                        ...prev,
                        requiredScore: e.target.value ? parseFloat(e.target.value) : undefined
                    }))}
                    placeholder="例如：10.5 表示 10.5万分"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {/* 奖励选择 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4" />
                        奖励
                    </div>
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {rewardOptions.map(reward => (
                        <button
                            key={reward}
                            type="button"
                            onClick={() => handleRewardSelect(reward)}
                            className={`px-4 py-3 rounded-lg transition-colors ${formData.reward === reward
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                        >
                            {reward}
                        </button>
                    ))}
                </div>

                {/* 其他奖励输入框 */}
                {formData.reward === '其他奖励' && (
                    <div className="mt-3">
                        <input
                            type="text"
                            value={formData.customReward || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, customReward: e.target.value }))}
                            placeholder="请输入其他奖励内容..."
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                )}
            </div>

            {/* 注释 */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        注释（可选）
                    </div>
                </label>
                <textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="添加备注..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
            </div>

            {/* 提交按钮 */}
            <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                添加课题
            </button>
        </form>
    );
}
