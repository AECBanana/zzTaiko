import { Photo, Pagination, PhotoFetchParams } from '@/app/types';

/**
 * 获取照片数据
 * @param params 获取参数
 * @returns 照片数据和分页信息
 */
export async function fetchPhotos(params: PhotoFetchParams = {}): Promise<{
    photos: Photo[];
    pagination: Pagination;
}> {
    const {
        page = 1,
        limit = 20,
        search = '',
        sort = 'newest'
    } = params;

    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            sort,
            ...(search && { search }),
        });

        const response = await fetch(`/api/photos?${queryParams}`);
        const data = await response.json();

        if (data.success) {
            return {
                photos: data.data.photos,
                pagination: data.data.pagination,
            };
        } else {
            throw new Error(data.error || '获取照片失败');
        }
    } catch (error) {
        console.error('Error fetching photos:', error);
        throw error;
    }
}

/**
 * 获取所有照片（不分页）
 * @returns 所有照片数组
 */
export async function fetchAllPhotos(): Promise<Photo[]> {
    try {
        const response = await fetch('/api/photos?limit=1000');
        const data = await response.json();

        if (data.success) {
            return data.data.photos;
        } else {
            throw new Error(data.error || '获取照片失败');
        }
    } catch (error) {
        console.error('Error fetching all photos:', error);
        throw error;
    }
}
