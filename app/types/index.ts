// 照片类型定义
export interface Photo {
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
export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// 照片获取参数类型
export interface PhotoFetchParams {
    page?: number;
    limit?: number;
    search?: string;
    sort?: 'newest' | 'oldest' | 'title';
}
