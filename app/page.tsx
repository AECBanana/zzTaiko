'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Search, Loader2, Moon, Sun, Calendar, Image as ImageIcon } from 'lucide-react';

// 照片类型定义
interface Photo {
  id: string;
  url: string;
  title: string;
  uploadedAt: string;
  size: number;
  contentType: string;
  originalFilename?: string;
  imageUrl: string;
}

// 分页信息类型
interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function Home() {
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

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 获取照片数据
  const fetchPhotos = useCallback(async (page = 1, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sort: sortBy,
        ...(searchQuery && { search: searchQuery }),
      });

      const response = await fetch(`/api/photos?${params}`);
      const data = await response.json();

      if (data.success) {
        if (isLoadMore) {
          setPhotos(prev => [...prev, ...data.data.photos]);
        } else {
          setPhotos(data.data.photos);
        }
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching photos:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [searchQuery, sortBy]);

  // 初始加载和搜索/排序变化时重新加载
  useEffect(() => {
    fetchPhotos(1, false);
  }, [fetchPhotos]);

  // 无限滚动加载
  useEffect(() => {
    if (!pagination.hasNextPage || loadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPhotos(pagination.page + 1, true);
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
  }, [pagination, loadingMore, fetchPhotos]);

  // 处理搜索
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    fetchPhotos(1, false);
  }, [fetchPhotos]);

  // 处理排序变化
  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  }, []);

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 切换暗色模式
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 计算瀑布流列数
  const getColumnCount = () => {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
  };

  // 将照片分配到瀑布流列中
  const distributeToColumns = (photos: Photo[], columnCount: number): Photo[][] => {
    const columns: Photo[][] = Array.from({ length: columnCount }, () => []);
    photos.forEach((photo, index) => {
      columns[index % columnCount].push(photo);
    });
    return columns;
  };

  const columnCount = getColumnCount();
  const columns = distributeToColumns(photos, columnCount);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-md dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                照片展示系统
              </h1>
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={darkMode ? '切换到亮色模式' : '切换到暗色模式'}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  搜索
                </button>
              </form>

              <select
                value={sortBy}
                onChange={handleSortChange}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">最新上传</option>
                <option value="oldest">最早上传</option>
                <option value="title">按标题排序</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* 加载状态 */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">加载照片中...</span>
          </div>
        )}

        {/* 照片网格 */}
        {!loading && photos.length > 0 && (
          <>
            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-300">
                共 {pagination.total} 张照片 • 第 {pagination.page}/{pagination.totalPages} 页
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {columns.map((column, columnIndex) => (
                <div key={columnIndex} className="flex flex-col gap-4">
                  {column.map((photo) => (
                    <div
                      key={photo.id}
                      className="group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedPhoto(photo)}
                    >
                      {/* 图片容器 */}
                      <div className="relative aspect-square overflow-hidden">
                        <Image
                          src={photo.imageUrl}
                          alt={photo.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          unoptimized // 因为图片来自外部 URL
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* 图片信息 */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 mb-2">
                          {photo.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(photo.uploadedAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ImageIcon className="w-4 h-4" />
                            <span>{(photo.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
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
          </>
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
              {searchQuery ? '没有找到匹配的照片，请尝试其他搜索词。' : '还没有上传任何照片。'}
            </p>
          </div>
        )}
      </main>

      {/* 照片详情模态框 */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="relative max-w-4xl max-h-[90vh] w-full bg-white dark:bg-gray-900 rounded-2xl overflow-hidden">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              ✕
            </button>

            <div className="grid md:grid-cols-2 gap-0">
              {/* 图片区域 */}
              <div className="relative aspect-square md:aspect-auto md:h-[70vh]">
                <Image
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.title}
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* 信息区域 */}
              <div className="p-6 md:p-8 overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {selectedPhoto.title}
                </h2>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      上传时间
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(selectedPhoto.uploadedAt)}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      文件信息
                    </h4>
                    <p className="text-gray-900 dark:text-white">
                      {selectedPhoto.originalFilename || '未命名文件'} • {(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      图片链接
                    </h4>
                    <a
                      href={selectedPhoto.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {selectedPhoto.imageUrl}
                    </a>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      唯一标识
                    </h4>
                    <p className="text-gray-900 dark:text-white font-mono text-sm break-all">
                      {selectedPhoto.id}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
