'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/app/components/Navbar';
import Sidebar from '@/app/components/Sidebar';
import PhotoGallery from '@/app/components/PhotoGallery';
import PhotoDetailModal from '@/app/components/PhotoDetailModal';
import ImageModal from '@/app/components/ImageModal';
import { Photo, Pagination } from '@/app/types';
import { fetchPhotos } from '@/app/lib/api';

export default function PhotosPage() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [darkMode, setDarkMode] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [pagination, setPagination] = useState<Pagination>({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
    });
    const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
    const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
    const [imageModalOpen, setImageModalOpen] = useState(false);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // 获取照片数据
    const fetchPhotosData = useCallback(async (page = 1, isLoadMore = false) => {
        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const data = await fetchPhotos({
                page,
                limit: 20,
                search: searchQuery,
                sort: sortBy as 'newest' | 'oldest' | 'title',
            });

            if (isLoadMore) {
                setPhotos(prev => [...prev, ...data.photos]);
            } else {
                setPhotos(data.photos);
            }
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error fetching photos:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [searchQuery, sortBy]);

    // 初始加载和搜索/排序变化时重新加载
    useEffect(() => {
        fetchPhotosData(1, false);
    }, [fetchPhotosData]);

    // 无限滚动加载
    useEffect(() => {
        if (!pagination.hasNextPage || loadingMore) return;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchPhotosData(pagination.page + 1, true);
                }
            },
            { threshold: 0.5 }
        );

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [pagination, loadingMore, fetchPhotosData]);

    // 处理搜索
    const handleSearch = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        fetchPhotosData(1, false);
    }, [fetchPhotosData]);

    // 处理排序变化
    const handleSortChange = useCallback((value: string) => {
        setSortBy(value);
    }, []);

    // 切换暗色模式
    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        if (!darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // 切换侧边栏收缩状态
    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed);
    };

    // 切换移动端菜单
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // 关闭移动端菜单
    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    // 打开图片模态框（点击卡片时）
    const openImageModal = (photo: Photo) => {
        setSelectedPhoto(photo);
        setImageModalOpen(true);
    };

    // 关闭图片模态框
    const closeImageModal = () => {
        setImageModalOpen(false);
    };

    // 打开照片详情抽屉（从图片模态框的info按钮）
    const openDetailDrawer = () => {
        setDetailDrawerOpen(true);
        // 保持图片模态框打开状态
    };

    // 关闭照片详情抽屉
    const closePhotoDetail = () => {
        setDetailDrawerOpen(false);
        // 不清除选中的照片，以便图片模态框保持打开状态
    };

    // 完全关闭所有模态框和抽屉
    const closeAllModals = () => {
        setImageModalOpen(false);
        setDetailDrawerOpen(false);
        // 延迟清除选中的照片
        setTimeout(() => setSelectedPhoto(null), 300);
    };

    return (
        <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
            {/* 导航栏 */}
            <Navbar darkMode={darkMode} onToggleDarkMode={toggleDarkMode} />

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
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                            照片展示系统
                        </h1>
                        <button
                            onClick={closeMobileMenu}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="关闭菜单"
                        >
                            ✕
                        </button>
                    </div>
                    {/* 移动端侧边栏内容 */}
                    <Sidebar
                        darkMode={darkMode}
                        sidebarCollapsed={false}
                        searchQuery={searchQuery}
                        sortBy={sortBy}
                        pagination={pagination}
                        loading={loading}
                        onToggleDarkMode={toggleDarkMode}
                        onToggleSidebar={toggleSidebar}
                        onSearchChange={setSearchQuery}
                        onSortChange={handleSortChange}
                        onSearchSubmit={handleSearch}
                    />
                </div>
            </div>

            {/* 桌面端布局 */}
            <div className="flex">
                {/* 桌面端侧边栏 */}
                <Sidebar
                    darkMode={darkMode}
                    sidebarCollapsed={sidebarCollapsed}
                    searchQuery={searchQuery}
                    sortBy={sortBy}
                    pagination={pagination}
                    loading={loading}
                    onToggleDarkMode={toggleDarkMode}
                    onToggleSidebar={toggleSidebar}
                    onSearchChange={setSearchQuery}
                    onSortChange={handleSortChange}
                    onSearchSubmit={handleSearch}
                />

                {/* 主内容区域 */}
                <main className={`flex-1 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} transition-all duration-300 ease-in-out`}>
                    <PhotoGallery
                        photos={photos}
                        loading={loading}
                        loadingMore={loadingMore}
                        pagination={pagination}
                        selectedPhoto={selectedPhoto}
                        onPhotoClick={openImageModal}
                        loadMoreRef={loadMoreRef}
                    />
                </main>

                {/* 图片模态框 */}
                <ImageModal
                    photo={selectedPhoto}
                    isOpen={imageModalOpen}
                    onClose={closeAllModals}
                    onInfoClick={openDetailDrawer}
                />

                {/* 照片详情抽屉 */}
                <PhotoDetailModal
                    photo={selectedPhoto}
                    isOpen={detailDrawerOpen}
                    onClose={closePhotoDetail}
                />
            </div>
        </div>
    );
}
