'use client';

import { Search, Moon, Sun, Calendar, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Pagination } from '@/app/types';

interface SidebarProps {
    darkMode: boolean;
    sidebarCollapsed: boolean;
    searchQuery: string;
    sortBy: string;
    pagination: Pagination;
    loading: boolean;
    onToggleDarkMode: () => void;
    onToggleSidebar: () => void;
    onSearchChange: (query: string) => void;
    onSortChange: (sortBy: string) => void;
    onSearchSubmit: (e: React.FormEvent) => void;
}

export default function Sidebar({
    darkMode,
    sidebarCollapsed,
    searchQuery,
    sortBy,
    pagination,
    loading,
    onToggleDarkMode,
    onToggleSidebar,
    onSearchChange,
    onSortChange,
    onSearchSubmit,
}: SidebarProps) {
    const sidebarContent = (
        <>
            {/* 搜索表单 */}
            <form onSubmit={onSearchSubmit} className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder={sidebarCollapsed ? "搜索..." : "搜索标题或日期..."}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
                {!sidebarCollapsed && (
                    <button
                        type="submit"
                        className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        搜索
                    </button>
                )}
            </form>

            {/* 排序选项 */}
            <div className="mb-6">
                {!sidebarCollapsed && (
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        排序方式
                    </label>
                )}
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value="newest">最新上传</option>
                    <option value="oldest">最早上传</option>
                    <option value="title">按标题排序</option>
                </select>
            </div>

        </>
    );

    return (
        <>
            {/* 桌面端侧边栏 */}
            <aside className={`
        hidden lg:flex flex-col
        h-screen sticky top-0
        transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        overflow-y-auto
      `}>
                <div className="p-4 flex-1">
                    {sidebarContent}
                </div>

                {/* 侧边栏收缩按钮 */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onToggleSidebar}
                        className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label={sidebarCollapsed ? '展开侧边栏' : '收缩侧边栏'}
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        ) : (
                            <>
                                <ChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">收缩</span>
                            </>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
}
