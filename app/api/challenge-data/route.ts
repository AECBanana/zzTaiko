import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
    try {
        // 获取查询参数
        const { searchParams } = new URL(request.url);
        const latestOnly = searchParams.get('latest') === 'true';

        // 定义challenge-data目录的路径
        const dataDir = path.join(process.cwd(), 'app', 'challenge-data');

        // 读取目录中的所有文件
        const files = await fs.readdir(dataDir);

        // 过滤出JSON文件并按文件名排序（最新的在前）
        const jsonFiles = files
            .filter(file => file.endsWith('.json'))
            .sort((a, b) => b.localeCompare(a)); // 按文件名降序排序

        // 如果只需要最新月份的数据，只处理第一个文件
        const filesToProcess = latestOnly ? jsonFiles.slice(0, 1) : jsonFiles;

        // 读取并解析每个JSON文件
        const fileData = await Promise.all(
            filesToProcess.map(async (fileName) => {
                try {
                    const filePath = path.join(dataDir, fileName);
                    const fileContent = await fs.readFile(filePath, 'utf-8');
                    const data = JSON.parse(fileContent);

                    // 从文件名提取年月信息（格式：YYYY-MM.json）
                    const yearMonth = fileName.replace('.json', '');

                    return {
                        fileName,
                        yearMonth,
                        data
                    };
                } catch (error) {
                    console.error(`读取文件 ${fileName} 失败:`, error);
                    return null;
                }
            })
        );

        // 过滤掉读取失败的文件
        const validFileData = fileData.filter(item => item !== null);

        // 如果只需要最新数据，直接返回数据对象而不是数组
        if (latestOnly && validFileData.length > 0) {
            return NextResponse.json({
                success: true,
                latest: validFileData[0].data,
                fileName: validFileData[0].fileName,
                yearMonth: validFileData[0].yearMonth,
                generatedAt: validFileData[0].data.generatedAt
            });
        }

        // 返回所有数据
        return NextResponse.json({
            success: true,
            count: validFileData.length,
            files: validFileData
        });

    } catch (error) {
        console.error('读取challenge-data目录失败:', error);

        return NextResponse.json(
            {
                success: false,
                error: '读取数据失败',
                message: error instanceof Error ? error.message : '未知错误'
            },
            { status: 500 }
        );
    }
}
