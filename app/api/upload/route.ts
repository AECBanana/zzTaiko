import { put } from '@vercel/blob';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // 验证 API 密钥
        const apiKey = request.headers.get('x-api-key');
        const expectedApiKey = process.env.UPLOAD_API_KEY;

        if (!apiKey || apiKey !== expectedApiKey) {
            return NextResponse.json(
                { error: 'Unauthorized: Invalid API key' },
                { status: 401 }
            );
        }

        // 解析表单数据
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (!title || title.trim() === '') {
            return NextResponse.json(
                { error: 'Title is required' },
                { status: 400 }
            );
        }

        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed' },
                { status: 400 }
            );
        }

        // 验证文件大小 (最大 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'File too large. Maximum size is 10MB' },
                { status: 400 }
            );
        }

        // 生成唯一文件名
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const extension = file.name.split('.').pop() || 'jpg';
        const filename = `photos/${timestamp}-${randomString}.${extension}`;
        const metadataFilename = `photos/${timestamp}-${randomString}.metadata.json`;

        // 上传图片到 Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
            contentType: file.type,
            addRandomSuffix: false,
        });

        // 创建元数据对象
        const metadata = {
            id: blob.pathname,
            url: blob.url,
            title: title.trim(),
            uploadedAt: new Date().toISOString(),
            size: file.size,
            contentType: file.type,
            originalFilename: file.name,
            imageUrl: blob.url,
        };

        // 创建 metadata.json 文件内容
        const metadataContent = JSON.stringify(metadata, null, 2);
        const metadataBlob = new Blob([metadataContent], { type: 'application/json' });

        // 上传 metadata.json 到 Vercel Blob
        await put(metadataFilename, metadataBlob, {
            access: 'public',
            contentType: 'application/json',
            addRandomSuffix: false,
        });

        return NextResponse.json({
            success: true,
            message: 'Photo uploaded successfully',
            photo: metadata,
        }, { status: 201 });

    } catch (error) {
        console.error('Upload error:', error);
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
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-API-Key',
        },
    });
}
