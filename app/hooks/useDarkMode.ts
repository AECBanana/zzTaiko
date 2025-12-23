'use client';

import { useState, useEffect } from 'react';

export function useDarkMode() {
    // 使用函数初始化state，避免服务器端渲染问题
    const [darkMode, setDarkMode] = useState<boolean | null>(() => {
        // 只在客户端执行
        if (typeof window === 'undefined') return null;

        const savedPreference = localStorage.getItem('darkMode');
        if (savedPreference !== null) {
            return savedPreference === 'true';
        }
        return null;
    });

    const [isSystemDark, setIsSystemDark] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    // 初始化时立即设置文档类
    useEffect(() => {
        const initialDarkMode = darkMode === null ? isSystemDark : darkMode;
        updateDocumentClass(initialDarkMode);
    }, []);

    // 检测系统暗色模式变化
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            setIsSystemDark(e.matches);
            // 如果用户没有覆盖系统设置，则跟随系统变化
            if (darkMode === null) {
                updateDocumentClass(e.matches);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [darkMode]);

    // 当darkMode或isSystemDark变化时更新文档类
    useEffect(() => {
        if (darkMode === null) {
            updateDocumentClass(isSystemDark);
        } else {
            updateDocumentClass(darkMode);
        }
    }, [darkMode, isSystemDark]);

    // 更新文档类
    const updateDocumentClass = (isDark: boolean) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // 切换暗色模式
    const toggleDarkMode = () => {
        setDarkMode(prev => {
            let newValue: boolean | null;

            if (prev === null) {
                // 当前是系统模式，切换到与系统相反的模式
                newValue = !isSystemDark;
            } else {
                // 当前是用户模式，切换回系统模式
                newValue = null;
            }

            // 保存到localStorage
            if (newValue === null) {
                localStorage.removeItem('darkMode');
                updateDocumentClass(isSystemDark);
            } else {
                localStorage.setItem('darkMode', newValue.toString());
                updateDocumentClass(newValue);
            }

            return newValue;
        });
    };

    // 获取当前显示模式
    const getCurrentMode = () => {
        if (darkMode === null) {
            return isSystemDark ? 'dark' : 'light';
        }
        return darkMode ? 'dark' : 'light';
    };

    // 获取当前是否是暗色模式（用于样式）
    const isDark = darkMode === null ? isSystemDark : darkMode;

    // 获取当前模式描述
    const getModeDescription = () => {
        if (darkMode === null) {
            return `系统模式 (${isSystemDark ? '暗色' : '亮色'})`;
        }
        return darkMode ? '暗色模式' : '亮色模式';
    };

    // 获取切换按钮的aria-label
    const getToggleLabel = () => {
        if (darkMode === null) {
            return isSystemDark ? '切换到亮色模式（覆盖系统设置）' : '切换到暗色模式（覆盖系统设置）';
        }
        return darkMode ? '切换到系统模式' : '切换到系统模式';
    };

    // 获取切换按钮的显示文本
    const getToggleText = () => {
        if (darkMode === null) {
            return isSystemDark ? '切换到亮色' : '切换到暗色';
        }
        return '使用系统设置';
    };

    return {
        darkMode: isDark,
        isUsingSystem: darkMode === null,
        toggleDarkMode,
        getCurrentMode,
        getModeDescription,
        getToggleLabel,
        getToggleText
    };
}
