'use client';

import { useState } from 'react';
import { Challenge, SongOption } from '@/app/types';
import { Music, Star, Target, Gift, MessageSquare, Edit2, Trash2, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

interface ChallengeListProps {
    challenges: Challenge[];
    songOptions: SongOption[];
    onDelete: (id: string) => void;
    onUpdate: (challenge: Challenge) => void;
    darkMode: boolean;
}

export default function ChallengeList({
    challenges,
    songOptions,
    onDelete,
    onUpdate,
    darkMode
}: ChallengeListProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<Challenge>>({});

    // 开始编辑
    const startEdit = (challenge: Challenge) => {
        setEditingId(challenge.id);
        setEditForm({ ...challenge });
    };

    // 取消编辑
    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    // 保存编辑
    const saveEdit = () => {
        if (editingId && editForm) {
            const updatedChallenge = {
                ...challenges.find(c => c.id === editingId),
                ...editForm
            } as Challenge;
            onUpdate(updatedChallenge);
            setEditingId(null);
            setEditForm({});
        }
    };

    // 切换展开/收起
    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
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

    return (
        <div className="space-y-4">
            {challenges.map((challenge, index) => {
                const isEditing = editingId === challenge.id;
                const isExpanded = expandedId === challenge.id;

                return (
                    <div
                        key={challenge.id}
                        className={`border rounded-xl overflow-hidden transition-all duration-200 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                            } ${isExpanded ? 'shadow-lg' : 'shadow-sm'}`}
                    >
                        {/* 课题卡片头部 */}
                        <div
                            className={`p-4 cursor-pointer hover:bg-opacity-50 transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                }`}
                            onClick={() => toggleExpand(challenge.id)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'bg-blue-900' : 'bg-blue-100'
                                        }`}>
                                        <span className={`font-bold ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>
                                            {index + 1}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">
                                            {challenge.songTitle}
                                            {challenge.songTitleCn && (
                                                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                                    ({challenge.songTitleCn})
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Music className="w-3 h-3" />
                                                难度{challenge.difficulty}
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-500" />
                                                {challenge.stars.toFixed(1)}星
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Target className="w-3 h-3 text-red-500" />
                                                {formatScore(challenge.requiredScore)}
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                                <Gift className="w-3 h-3 text-green-500" />
                                                {formatReward(challenge)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* 展开的内容 */}
                        {isExpanded && (
                            <div className={`px-4 pb-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                                {isEditing ? (
                                    // 编辑模式
                                    <div className="space-y-4 pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* 过关分数编辑 */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    过关分数（万）
                                                </label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.1"
                                                    value={editForm.requiredScore || ''}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        requiredScore: e.target.value ? parseFloat(e.target.value) : 0
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                />
                                            </div>

                                            {/* 奖励编辑 */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    奖励
                                                </label>
                                                <select
                                                    value={editForm.reward}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        reward: e.target.value as any
                                                    }))}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                >
                                                    <option value="15币">15币</option>
                                                    <option value="30币">30币</option>
                                                    <option value="45币">45币</option>
                                                    <option value="其他奖励">其他奖励</option>
                                                </select>
                                            </div>

                                            {/* 其他奖励编辑 */}
                                            {editForm.reward === '其他奖励' && (
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                        其他奖励内容
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={editForm.customReward || ''}
                                                        onChange={(e) => setEditForm(prev => ({
                                                            ...prev,
                                                            customReward: e.target.value
                                                        }))}
                                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                                        placeholder="请输入奖励内容..."
                                                    />
                                                </div>
                                            )}

                                            {/* 注释编辑 */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    注释
                                                </label>
                                                <textarea
                                                    value={editForm.notes || ''}
                                                    onChange={(e) => setEditForm(prev => ({
                                                        ...prev,
                                                        notes: e.target.value
                                                    }))}
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none"
                                                    placeholder="添加备注..."
                                                />
                                            </div>
                                        </div>

                                        {/* 编辑操作按钮 */}
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button
                                                onClick={cancelEdit}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                取消
                                            </button>
                                            <button
                                                onClick={saveEdit}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                保存
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    // 查看模式
                                    <div className="space-y-3 pt-4">
                                        {/* 详细信息 */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">歌曲ID:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">{challenge.songId}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">难度:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">难度{challenge.difficulty}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">星数:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">{challenge.stars.toFixed(1)}</span>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">过关分数:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">{formatScore(challenge.requiredScore)}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">奖励:</span>
                                                    <span className="font-medium text-gray-900 dark:text-white">{formatReward(challenge)}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">创建时间:</span>
                                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                                        {new Date(challenge.createdAt).toLocaleString('zh-CN')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 注释 */}
                                        {challenge.notes && (
                                            <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MessageSquare className="w-4 h-4 text-gray-500" />
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">注释</span>
                                                </div>
                                                <p className="text-gray-700 dark:text-gray-300 text-sm">{challenge.notes}</p>
                                            </div>
                                        )}

                                        {/* 操作按钮 */}
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button
                                                onClick={() => startEdit(challenge)}
                                                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                编辑
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('确定要删除这个课题吗？')) {
                                                        onDelete(challenge.id);
                                                    }
                                                }}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                删除
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
