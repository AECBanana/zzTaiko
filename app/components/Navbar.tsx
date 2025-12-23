'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Moon, Sun, Home, Images, FileText } from 'lucide-react';

interface NavbarProps {
    darkMode: boolean;
    onToggleDarkMode: () => void;
    isUsingSystem?: boolean;
    toggleLabel?: string;
    toggleText?: string;
}

export default function Navbar({
    darkMode,
    onToggleDarkMode,
    isUsingSystem = false,
    toggleLabel = darkMode ? '切换到亮色模式' : '切换到暗色模式',
    toggleText = darkMode ? '亮色模式' : '暗色模式'
}: NavbarProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const navigation = [
        { name: '每月课题', href: '/', icon: Home },
        { name: '群相册', href: '/photos', icon: Images },
        { name: '课题生成器', href: '/challenge-generator', icon: FileText },
    ];

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    return (
        <>
            {/* 桌面端导航栏 */}
            <nav className="hidden lg:block">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center space-x-2">
                                <h1
                                    className="text-3xl"
                                    style={{
                                        color: darkMode ? 'white' : '#FB923C'
                                    }}
                                >
                                    漳州太鼓
                                </h1>
                            </Link>
                        </div>

                        {/* 导航链接 */}
                        <div className="flex items-center space-x-4">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${isActive
                                            ? darkMode
                                                ? 'bg-[#FFEDD5]/60 text-[#EA580C]'
                                                : 'bg-[#FFEDD5]/60 text-[#EA580C]'
                                            : darkMode
                                                ? 'text-gray-300 hover:text-white hover:bg-[#EA580C]/80'
                                                : 'text-gray-700 hover:text-white hover:bg-[#EA580C]/80'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}


                        </div>
                    </div>
                </div>
            </nav>

            {/* 移动端顶部栏 */}
            <header className="lg:hidden sticky top-0 z-50 bg-white/10 dark:bg-gray-900/10 dark:border-gray-700/50">
                <div className="px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleMobileMenu}
                                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                aria-label="打开菜单"
                            >
                                {mobileMenuOpen ? (
                                    <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                ) : (
                                    <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                                )}
                            </button>
                            <Link href="/" className="flex items-center space-x-2">
                                <h1
                                    className="text-2xl"
                                    style={{
                                        color: darkMode ? 'white' : '#FB923C'
                                    }}
                                >
                                    漳州太鼓
                                </h1>
                            </Link>
                        </div>

                    </div>
                </div>
            </header>

            {/* 移动端菜单遮罩 */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-40 bg-black/50"
                    onClick={closeMobileMenu}
                />
            )}

            {/* 移动端侧边栏菜单 */}
            <div className={`
        lg:hidden fixed top-0 left-0 z-50 h-full w-64
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        overflow-y-auto
      `}>
                <div className="p-4">
                    <div className="flex items-center justify-between mb-8">
                        <button
                            onClick={closeMobileMenu}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="关闭菜单"
                        >
                            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>

                    {/* 移动端导航链接 */}
                    <nav className="space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={closeMobileMenu}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? darkMode
                                            ? 'bg-[#FFEDD5]/60 text-[#EA580C]'
                                            : 'bg-[#FFEDD5]/60 text-[#EA580C]'
                                        : darkMode
                                            ? 'text-gray-300 hover:text-white hover:bg-[#EA580C]/80'
                                            : 'text-gray-700 hover:text-white hover:bg-[#EA580C]/80'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                </div>
            </div>
        </>
    );
}
