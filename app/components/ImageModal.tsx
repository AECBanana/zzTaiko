'use client';

import { X, Info, ZoomIn, ZoomOut, RotateCw, Download, Maximize2, Minimize2 } from 'lucide-react';
import { Photo } from '@/app/types';
import { useState, useEffect } from 'react';

interface ImageModalProps {
    photo: Photo | null;
    isOpen: boolean;
    onClose: () => void;
    onInfoClick: () => void;
}

export default function ImageModal({ photo, isOpen, onClose, onInfoClick }: ImageModalProps) {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // 检测移动端
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!photo || !isOpen) return null;

    const handleZoomIn = () => {
        setScale(prev => Math.min(prev + 0.25, 3));
    };

    const handleZoomOut = () => {
        setScale(prev => Math.max(prev - 0.25, 0.5));
    };

    const handleRotate = () => {
        setRotation(prev => (prev + 90) % 360);
    };

    const handleReset = () => {
        setScale(1);
        setRotation(0);
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = photo.imageUrl;
        link.download = photo.originalFilename || photo.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // 移动端全屏样式
    const modalStyle = isMobile && isFullscreen ? {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: '#000',
    } : {};

    return (
        <>
            {/* 遮罩层 */}
            <div
                className="fixed inset-0 z-50 bg-black/90 transition-opacity duration-300"
                onClick={onClose}
            />

            {/* 图片模态框 */}
            <div
                className={`fixed inset-0 z-50 flex items-center justify-center ${isMobile && isFullscreen ? 'p-0' : 'p-4'}`}
                style={modalStyle}
            >
                <div className={`relative ${isMobile && isFullscreen ? 'w-full h-full' : 'w-full h-full max-w-7xl max-h-[110vh]'}`}>
                    {/* 顶部工具栏 - 移动端全屏时隐藏 */}
                    {(!isMobile || !isFullscreen) && (
                        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                            <button
                                onClick={handleZoomOut}
                                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                                aria-label="缩小"
                                disabled={scale <= 0.5}
                            >
                                <ZoomOut className="w-5 h-5" />
                            </button>

                            <button
                                onClick={handleReset}
                                className="px-3 py-1 text-white text-sm hover:bg-white/20 rounded-full transition-colors"
                            >
                                {Math.round(scale * 100)}%
                            </button>

                            <button
                                onClick={handleZoomIn}
                                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                                aria-label="放大"
                                disabled={scale >= 3}
                            >
                                <ZoomIn className="w-5 h-5" />
                            </button>

                            <div className="w-px h-6 bg-white/30" />

                            <button
                                onClick={handleRotate}
                                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                                aria-label="旋转"
                            >
                                <RotateCw className="w-5 h-5" />
                            </button>

                            <button
                                onClick={handleDownload}
                                className="p-2 text-white hover:bg-white/20 rounded-full transition-colors"
                                aria-label="下载"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                        </div>
                    )}

                    {/* 右上角按钮 */}
                    <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
                        {/* 移动端全屏切换按钮 */}
                        {isMobile && (
                            <button
                                onClick={toggleFullscreen}
                                className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                                aria-label={isFullscreen ? "退出全屏" : "全屏"}
                                title={isFullscreen ? "退出全屏" : "全屏"}
                            >
                                {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6" />}
                            </button>
                        )}

                        <button
                            onClick={onInfoClick}
                            className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                            aria-label="查看详情"
                            title="查看照片详情"
                        >
                            <Info className="w-6 h-6" />
                        </button>

                        <button
                            onClick={onClose}
                            className="p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
                            aria-label="关闭"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* 图片容器 */}
                    <div className="relative w-full h-full flex items-center justify-center">
                        <div className={`${isMobile && isFullscreen ? 'w-full h-full' : 'relative overflow-hidden rounded-lg bg-black'}`}>
                            <img
                                src={photo.imageUrl}
                                alt={photo.title}
                                className={`${isMobile && isFullscreen ? 'w-full h-full object-contain' : 'max-w-full max-h-[80vh] object-contain'} transition-transform duration-200`}
                                style={{
                                    transform: `scale(${scale}) rotate(${rotation}deg)`,
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // 移动端点击图片切换全屏
                                    if (isMobile) {
                                        toggleFullscreen();
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* 底部信息栏 - 移动端全屏时隐藏 */}
                    {(!isMobile || !isFullscreen) && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
                            <div className="text-white text-center">
                                <h3 className="font-semibold text-lg">{photo.title}</h3>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
