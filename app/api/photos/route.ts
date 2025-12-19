import { list } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

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

// 辅助函数：从 URL 获取 JSON 数据
async function fetchJsonFromUrl(url: string): Promise<any> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching JSON from ${url}:`, error);
        return null;
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const searchQuery = searchParams.get('search') || '';
        const sortBy = searchParams.get('sort') || 'newest';

        // 计算分页
        const skip = (page - 1) * limit;

        // 获取所有 Blob 文件
        const { blobs } = await list({
            prefix: 'photos/',
            limit: 1000, // 获取足够多的文件以便过滤和排序
        });

        // 过滤出 metadata.json 文件
        const metadataBlobs = blobs.filter(blob => blob.pathname.endsWith('.metadata.json'));

        // 并行获取所有 metadata 数据
        const metadataPromises = metadataBlobs.map(async (blob) => {
            const metadata = await fetchJsonFromUrl(blob.url);
            if (metadata) {
                return {
                    ...metadata,
                    // 确保有必要的字段
                    id: metadata.id || blob.pathname.replace('.metadata.json', ''),
                    url: metadata.imageUrl || metadata.url,
                    imageUrl: metadata.imageUrl || metadata.url,
                } as Photo;
            }
            return null;
        });

        const metadataResults = await Promise.all(metadataPromises);
        let photos: Photo[] = metadataResults.filter((photo): photo is Photo => photo !== null);

        // 应用搜索过滤
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            photos = photos.filter(photo =>
                photo.title.toLowerCase().includes(query) ||
                photo.uploadedAt.toLowerCase().includes(query) ||
                (photo.originalFilename && photo.originalFilename.toLowerCase().includes(query))
            );
        }

        // 应用排序
        photos.sort((a, b) => {
            if (sortBy === 'newest') {
                return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
            } else if (sortBy === 'oldest') {
                return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
            } else if (sortBy === 'title') {
                return a.title.localeCompare(b.title);
            }
            return 0;
        });

        // 应用分页
        const total = photos.length;
        const totalPages = Math.ceil(total / limit);
        const paginatedPhotos = photos.slice(skip, skip + limit);

        return NextResponse.json({
            success: true,
            data: {
                photos: paginatedPhotos,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            },
        });

    } catch (error) {
        console.error('Get photos error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// 添加 OPTIONS 方法处理 CORS 预检请求
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
