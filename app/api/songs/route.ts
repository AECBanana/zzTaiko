import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Song, SongFetchParams } from '@/app/types';

// 歌曲数据缓存
let songsCache: Song[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 读取歌曲数据
async function readSongsData(): Promise<Song[]> {
    const now = Date.now();

    // 使用缓存
    if (songsCache && (now - cacheTimestamp) < CACHE_DURATION) {
        return songsCache;
    }

    try {
        const filePath = path.join(process.cwd(), 'app/lib/songs/songs.json');
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const songs = JSON.parse(fileContent) as Song[];

        // 更新缓存
        songsCache = songs;
        cacheTimestamp = now;

        return songs;
    } catch (error) {
        console.error('Error reading songs data:', error);
        throw new Error('Failed to read songs data');
    }
}

// 过滤歌曲数据
function filterSongs(songs: Song[], params: SongFetchParams): Song[] {
    let filtered = [...songs];

    // 按ID过滤
    if (params.id !== undefined) {
        filtered = filtered.filter(song => song.id === params.id);
    }

    // 按标题过滤（支持模糊匹配）
    if (params.title) {
        const searchTerm = params.title.toLowerCase();
        filtered = filtered.filter(song =>
            song.title.toLowerCase().includes(searchTerm)
        );
    }

    // 按中文标题过滤（支持模糊匹配）
    if (params.title_cn) {
        const searchTerm = params.title_cn.toLowerCase();
        filtered = filtered.filter(song =>
            song.title_cn.toLowerCase().includes(searchTerm)
        );
    }

    // 按等级过滤
    if (params.level) {
        filtered = filtered.filter(song =>
            Object.keys(song.level).includes(params.level!)
        );
    }

    return filtered;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // 解析查询参数
        const params: SongFetchParams = {
            id: searchParams.has('id') ? parseInt(searchParams.get('id')!) : undefined,
            title: searchParams.get('title') || undefined,
            title_cn: searchParams.get('title_cn') || undefined,
            level: searchParams.get('level') || undefined,
            page: searchParams.has('page') ? parseInt(searchParams.get('page')!) : 1,
            limit: searchParams.has('limit') ? parseInt(searchParams.get('limit')!) : 20,
        };

        // 读取歌曲数据
        const allSongs = await readSongsData();

        // 过滤歌曲
        let filteredSongs = filterSongs(allSongs, params);

        // 计算分页
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const total = filteredSongs.length;
        const totalPages = Math.ceil(total / limit);

        // 应用分页
        const paginatedSongs = filteredSongs.slice(skip, skip + limit);

        // 构建响应
        const responseData = {
            success: true,
            data: {
                songs: paginatedSongs,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1,
                },
            },
        };

        // 如果是单个ID查询且未找到，返回404
        if (params.id !== undefined && filteredSongs.length === 0) {
            return NextResponse.json(
                { success: false, error: `Song with id ${params.id} not found` },
                { status: 404 }
            );
        }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Get songs error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal server error';
        return NextResponse.json(
            { success: false, error: errorMessage },
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
