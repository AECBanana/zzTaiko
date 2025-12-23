'use client';

import Image from 'next/image';
import { Loader2, Calendar, Image as ImageIcon, Info } from 'lucide-react';
import { Photo, Pagination } from '@/app/types';
import { formatDate, distributeToColumns, getColumnCount } from '@/app/lib/utils';

interface PhotoGalleryProps {
    photos: Photo[];
    loading: boolean;
    loadingMore: boolean;
    pagination: Pagination;
    selectedPhoto: Photo | null;
    onPhotoClick: (photo: Photo) => void;
    loadMoreRef: React.RefObject<HTMLDivElement | null>;
}

export default function PhotoGallery({
    photos,
    loading,
    loadingMore,
    pagination,
    selectedPhoto,
    onPhotoClick,
    loadMoreRef,
}: PhotoGalleryProps) {
    // 计算瀑布流列数
    const columnCount = getColumnCount();
    const columns = distributeToColumns(photos, columnCount);

    return (
        <div className="p-4 lg:p-8">
            {/* 加载状态 */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-3 text-gray-600 dark:text-gray-300">加载照片中...</span>
                </div>
            )}

            {/* 照片网格 */}
            {!loading && photos.length > 0 && (
                <div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {columns.map((column, columnIndex) => (
                            <div key={columnIndex} className="flex flex-col gap-4">
                                {column.map((photo) => (
                                    <div
                                        key={photo.id}
                                        className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300"
                                    >
                                        {/* 图片容器 */}
                                        <div
                                            className="relative aspect-square overflow-hidden cursor-pointer"
                                            onClick={() => onPhotoClick(photo)}
                                            onTouchEnd={(e) => {
                                                // 防止触摸事件触发多次点击
                                                e.preventDefault();
                                                onPhotoClick(photo);
                                            }}
                                        >
                                            <Image
                                                src={photo.imageUrl}
                                                alt={photo.title}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                                unoptimized // 因为图片来自外部 URL
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            {/* 移除右上角信息按钮，现在在大图模态框中显示 */}
                                        </div>

                                        {/* 简化的图片信息 - 只在hover时显示 */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <h3 className="font-semibold text-white line-clamp-1 text-sm">
                                                {photo.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-white/80 mt-1">
                                                <Calendar className="w-3 h-3" />
                                                <span>{formatDate(photo.uploadedAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* 加载更多指示器 */}
                    {pagination.hasNextPage && (
                        <div ref={loadMoreRef} className="py-8 text-center">
                            {loadingMore ? (
                                <div className="flex justify-center items-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                    <span className="ml-3 text-gray-600 dark:text-gray-300">加载更多照片...</span>
                                </div>
                            ) : (
                                <p className="text-gray-500 dark:text-gray-400">滚动加载更多</p>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 空状态 */}
            {!loading && photos.length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        暂无照片
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                        还没有上传任何照片。
                    </p>
                </div>
            )}
        </div>
    );
}
