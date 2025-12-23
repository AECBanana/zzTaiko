'use client';

import { MonthlyChallengeData, Challenge } from '@/app/types';
import { Music, Star, Target, Gift, Calendar, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface MonthlyChallengeTableProps {
    monthlyData: MonthlyChallengeData;
    darkMode?: boolean;
    showHeader?: boolean;
    expandable?: boolean;
}

export default function MonthlyChallengeTable({
    monthlyData,
    darkMode = false,
    showHeader = true,
    expandable = true
}: MonthlyChallengeTableProps) {
    const [isExpanded, setIsExpanded] = useState(!expandable); // 如果不可展开，默认展开

    const { yearMonth, fileName, data } = monthlyData;
    const { challenges, generatedAt, totalChallenges } = data;

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

    // 格式化奖励显示
    const formatReward = (challenge: Challenge) => {
        if (challenge.reward === '其他奖励' && challenge.customReward) {
            return challenge.customReward;
        }
        return challenge.reward;
    };

    // 格式化分数显示
    const formatScore = (score: number) => {
        return `${score}万`;
    };

    // 切换展开/收起
    const toggleExpand = () => {
        if (expandable) {
            setIsExpanded(!isExpanded);
        }
    };

    return (
        <div className={`border rounded-xl overflow-hidden ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
            {/* 表格头部 */}
            {showHeader && (
                <div
                    className={`p-4 ${expandable ? 'cursor-pointer hover:bg-opacity-50' : ''} ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                    onClick={toggleExpand}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${darkMode ? 'bg-[#EA580C]/10' : 'bg-[#EA580C]/10'}`}>
                                <Calendar className={`w-5 h-5 ${darkMode ? 'text-[#EA580C]' : 'text-[#EA580C]'}`} />
                            </div>
                            <div>
                                <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {yearMonth}课题
                                </h3>
                                <div className="flex items-center gap-4 mt-1">
                                    <span className={`text-sm flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <Music className="w-3 h-3" />
                                        {totalChallenges}首
                                    </span>
                                </div>
                            </div>
                        </div>

                        {expandable && (
                            <div className="flex items-center gap-2">
                                {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 表格内容 */}
            {(isExpanded || !expandable) && (
                <div className={`px-4 ${showHeader ? 'pb-4' : 'py-4'}`}>
                    {/* 课题列表 */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium whitespace-nowrap`}>
                                        歌曲
                                    </th>
                                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium whitespace-nowrap`}>
                                        难度
                                    </th>
                                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium whitespace-nowrap`}>
                                        星数
                                    </th>
                                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium whitespace-nowrap`}>
                                        过关分数
                                    </th>
                                    <th className={`text-left py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-medium whitespace-nowrap`}>
                                        奖励
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {challenges.map((challenge, index) => (
                                    <tr
                                        key={challenge.id}
                                        className={`border-b ${darkMode ? 'border-gray-800 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'} transition-colors`}
                                    >
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <div>
                                                <div className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {challenge.songTitleCn}
                                                </div>
                                                {challenge.songTitleCn && (
                                                    <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                        {challenge.songTitle}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={`/level_${challenge.difficulty}.png`}
                                                    alt={`难度 ${challenge.difficulty}`}
                                                    className="w-6 h-6 sm:w-5 sm:h-5"
                                                    title={`难度 ${challenge.difficulty}`}
                                                />
                                            </div>
                                        </td>
                                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-500" />
                                                <span className="text-sm sm:text-base">{challenge.stars.toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                                            <div className="flex items-center gap-1">
                                                <Target className="w-3 h-3 text-red-500" />
                                                <span className="text-sm sm:text-base">{formatScore(challenge.requiredScore)}</span>
                                            </div>
                                        </td>
                                        <td className={`py-3 px-4 ${darkMode ? 'text-gray-300' : 'text-gray-700'} whitespace-nowrap`}>
                                            <div className="flex items-center gap-1">
                                                <Gift className="w-3 h-3 text-green-500" />
                                                <span className="text-sm sm:text-base">{formatReward(challenge)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            )}
        </div>
    );
}
