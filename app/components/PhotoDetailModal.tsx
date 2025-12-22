'use client';

import { X, Info, Calendar, File, Link as LinkIcon, Hash } from 'lucide-react';
import { Photo } from '@/app/types';
import { formatDate, formatFileSize } from '@/app/lib/utils';

interface PhotoDetailModalProps {
    photo: Photo | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function PhotoDetailModal({ photo, isOpen, onClose }: PhotoDetailModalProps) {
    if (!photo || !isOpen) return null;

    return (
        <>
            {/* 遮罩层 */}
            <div
                className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* 右侧抽屉 */}
            <div
                className={`fixed top-0 right-0 z-50 h-full w-full max-w-md transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="h-full bg-white dark:bg-gray-900 shadow-xl flex flex-col">
                    {/* 抽屉头部 */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                照片详情
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="关闭"
                        >
                            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </button>
                    </div>

                    {/* 抽屉内容 */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {/* 照片标题 */}
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                {photo.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                点击照片可查看大图
                            </p>
                        </div>

                        {/* 照片预览 */}
                        <div className="mb-6">
                            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                <img
                                    src={photo.imageUrl}
                                    alt={photo.title}
                                    className="w-full h-full object-cover"
                                />
                                <a
                                    href={photo.imageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors"
                                    title="查看原图"
                                >
                                    <div className="opacity-0 hover:opacity-100 transition-opacity">
                                        <div className="p-3 rounded-full bg-white/90 dark:bg-gray-800/90">
                                            <LinkIcon className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>

                        {/* 详细信息 */}
                        <div className="space-y-6">
                            {/* 上传时间 */}
                            <div>
                                <div className="flex items-center space-x-2 mb-3">
                                    <Calendar className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        上传时间
                                    </h4>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 pl-7">
                                    {formatDate(photo.uploadedAt)}
                                </p>
                            </div>

                            {/* 文件信息 */}
                            <div>
                                <div className="flex items-center space-x-2 mb-3">
                                    <File className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        文件信息
                                    </h4>
                                </div>
                                <div className="space-y-2 pl-7">
                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">文件名:</span>{' '}
                                        {photo.originalFilename || '未命名文件'}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">文件大小:</span>{' '}
                                        {formatFileSize(photo.size)}
                                    </p>
                                    <p className="text-gray-700 dark:text-gray-300">
                                        <span className="font-medium">格式:</span>{' '}
                                        {photo.contentType || 'image/jpeg'}
                                    </p>
                                </div>
                            </div>

                            {/* 图片链接 */}
                            <div>
                                <div className="flex items-center space-x-2 mb-3">
                                    <LinkIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        图片链接
                                    </h4>
                                </div>
                                <div className="pl-7">
                                    <a
                                        href={photo.imageUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 dark:text-blue-400 hover:underline break-all text-sm"
                                    >
                                        {photo.imageUrl}
                                    </a>
                                </div>
                            </div>

                            {/* 唯一标识 */}
                            <div>
                                <div className="flex items-center space-x-2 mb-3">
                                    <Hash className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        唯一标识
                                    </h4>
                                </div>
                                <div className="pl-7">
                                    <p className="text-gray-700 dark:text-gray-300 font-mono text-sm break-all bg-gray-100 dark:bg-gray-800 p-2 rounded">
                                        {photo.id}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
