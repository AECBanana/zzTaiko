/**
 * 格式化日期
 * @param dateString ISO日期字符串
 * @returns 格式化的日期字符串
 */
export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * 将照片分配到瀑布流列中
 * @param photos 照片数组
 * @param columnCount 列数
 * @returns 分配到各列的照片数组
 */
export function distributeToColumns<T>(items: T[], columnCount: number): T[][] {
    const columns: T[][] = Array.from({ length: columnCount }, () => []);
    items.forEach((item, index) => {
        columns[index % columnCount].push(item);
    });
    return columns;
}

/**
 * 根据窗口宽度计算瀑布流列数
 * @returns 列数
 */
export function getColumnCount(): number {
    if (typeof window === 'undefined') return 4;
    if (window.innerWidth < 640) return 2;
    if (window.innerWidth < 1024) return 3;
    return 4;
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化的文件大小字符串
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 验证课题数据
 * @param challenge 课题数据
 * @returns 验证结果和错误信息
 */
export function validateChallenge(challenge: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!challenge.songId || typeof challenge.songId !== 'number') {
        errors.push('歌曲ID无效');
    }

    if (!challenge.difficulty || typeof challenge.difficulty !== 'string') {
        errors.push('难度无效');
    }

    if (!challenge.stars || typeof challenge.stars !== 'number' || challenge.stars <= 0) {
        errors.push('星数无效');
    }

    if (!challenge.requiredScore || typeof challenge.requiredScore !== 'number' || challenge.requiredScore <= 0) {
        errors.push('过关分数无效');
    }

    if (!challenge.reward || !['15币', '30币', '45币', '其他奖励'].includes(challenge.reward)) {
        errors.push('奖励类型无效');
    }

    if (challenge.reward === '其他奖励' && (!challenge.customReward || challenge.customReward.trim() === '')) {
        errors.push('其他奖励内容不能为空');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * 格式化分数显示（单位：万）
 * @param score 分数
 * @returns 格式化后的字符串
 */
export function formatScore(score: number): string {
    return `${score}万`;
}

/**
 * 生成课题JSON文件名
 * @returns 文件名
 */
export function generateChallengeFilename(): string {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    return `课题生成_${dateStr}_${timeStr}.json`;
}

/**
 * 导出课题数据为JSON
 * @param challenges 课题数组
 * @returns JSON字符串
 */
export function exportChallengesToJSON(challenges: any[]): string {
    const data = {
        challenges: challenges,
        generatedAt: new Date().toISOString(),
        totalChallenges: challenges.length,
        version: '1.0.0'
    };

    return JSON.stringify(data, null, 2);
}

/**
 * 下载JSON文件
 * @param jsonString JSON字符串
 * @param filename 文件名
 */
export function downloadJSON(jsonString: string, filename: string): void {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * 从歌曲数据生成歌曲选项
 * @param songs 歌曲数组
 * @returns 歌曲选项数组
 */
export function generateSongOptions(songs: any[]): any[] {
    return songs.map(song => ({
        id: song.id,
        title: song.title,
        title_cn: song.title_cn,
        levels: Object.keys(song.level)
    }));
}
