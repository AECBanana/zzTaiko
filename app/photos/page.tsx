'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/app/components/Navbar';
import PhotoGallery from '@/app/components/PhotoGallery';
import PhotoDetailModal from '@/app/components/PhotoDetailModal';
import ImageModal from '@/app/components/ImageModal';
import { Photo, Pagination } from '@/app/types';
import { fetchPhotos } from '@/app/lib/api';
import { Search, ChevronUp, X } from 'lucide-react';
import { useDarkMode } from '@/app/hooks/useDarkMode';

export default function PhotosPage() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [showControls, setShowControls] = useState(false); // 控制搜索栏显示/隐藏
    const { darkMode, toggleDarkMode, isUsingSystem, getToggleLabel, getToggleText } = useDarkMode();
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
        fetchPhotosData(1, false);
    }, [fetchPhotosData]);


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
        <div className="min-h-screen transition-colors duration-200">
            {/* 导航栏 */}
            <Navbar
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
                isUsingSystem={isUsingSystem}
                toggleLabel={getToggleLabel()}
                toggleText={getToggleText()}
            />

            {/* 主内容区域 */}
            <main className="pt-4 px-4 relative">
                {/* 浮动搜索按钮 */}
                <div className="fixed bottom-6 right-6 z-40">
                    <button
                        type="button"
                        onClick={() => setShowControls(!showControls)}
                        className="flex items-center justify-center w-14 h-14 bg-[#EA580C] hover:bg-[#EA580C] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
                        aria-label="打开搜索"
                        title="搜索照片"
                    >
                        {showControls ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Search className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* 搜索卡片 - 弹出式 */}
                {showControls && (
                    <div className="fixed inset-0 z-30 flex items-start justify-center pt-20 px-4">
                        {/* 遮罩层 */}
                        <div
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setShowControls(false)}
                        />

                        {/* 搜索卡片 */}
                        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    搜索照片
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setShowControls(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    aria-label="关闭"
                                >
                                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* 搜索表单 */}
                            <form onSubmit={handleSearch} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        搜索关键词
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="输入标题或日期..."
                                            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            autoFocus
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        排序方式
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => handleSortChange(e.target.value)}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="newest">最新上传</option>
                                        <option value="oldest">最早上传</option>
                                        <option value="title">按标题排序</option>
                                    </select>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowControls(false)}
                                        className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    >
                                        取消
                                    </button>
                                    <button
                                        type="submit"
                                        onClick={() => {
                                            handleSearch(new Event('submit') as any);
                                            setShowControls(false);
                                        }}
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        搜索
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

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
    );
}
