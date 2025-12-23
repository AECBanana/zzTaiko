'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/app/components/Navbar';
import PhotoGallery from '@/app/components/PhotoGallery';
import PhotoDetailModal from '@/app/components/PhotoDetailModal';
import ImageModal from '@/app/components/ImageModal';
import { Photo, Pagination } from '@/app/types';
import { fetchPhotos } from '@/app/lib/api';
import { Search } from 'lucide-react';

export default function PhotosPage() {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [darkMode, setDarkMode] = useState(false);
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
        <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark' : ''}`}>
            {/* 导航栏 */}
            <Navbar
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
            />

            {/* 主内容区域 */}
            <main className="pt-4 px-4">
                {/* 顶部控制栏 */}
                <div className="mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* 搜索表单 */}
                            <form onSubmit={handleSearch} className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="搜索标题或日期..."
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="mt-2 lg:hidden w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    搜索
                                </button>
                            </form>

                            {/* 排序选项 */}
                            <div className="lg:w-48">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 lg:mb-0 lg:sr-only">
                                    排序方式
                                </label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="newest">最新上传</option>
                                    <option value="oldest">最早上传</option>
                                    <option value="title">按标题排序</option>
                                </select>
                            </div>

                            {/* 桌面端搜索按钮 */}
                            <button
                                type="submit"
                                onClick={handleSearch}
                                className="hidden lg:block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                            >
                                搜索
                            </button>
                        </div>
                    </div>
                </div>

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
