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

// 歌曲等级类型定义
export interface SongLevel {
    constant: number;
    totalNotes: number;
    composite: number;
    avgDensity: number;
    instDensity: number;
    separation: number;
    bpmChange: number;
    hsChange: number;
}

// 歌曲类型定义
export interface Song {
    id: number;
    title: string;
    level: {
        [key: string]: SongLevel;
    };
    title_cn: string;
    is_cn: boolean;
}

// 歌曲获取参数类型
export interface SongFetchParams {
    id?: number;
    title?: string;
    title_cn?: string;
    level?: string;
    page?: number;
    limit?: number;
}

// 课题奖励类型
export type ChallengeReward = '15币' | '30币' | '45币' | '其他奖励';

// 课题类型定义
export interface Challenge {
    id: string; // 唯一标识符
    songId: number; // 歌曲ID
    songTitle: string; // 歌曲标题
    songTitleCn: string; // 歌曲中文标题
    difficulty: string; // 难度（如"4"、"5"等）
    stars: number; // 星数（对应constant值）
    requiredScore: number; // 需要过关的分数（单位：万）
    reward: ChallengeReward; // 奖励
    customReward?: string; // 其他奖励的文本（当reward为"其他奖励"时）
    notes?: string; // 注释
    createdAt: string; // 创建时间
}

// 课题表单数据类型
export interface ChallengeFormData {
    songId?: number; // 歌曲ID
    difficulty?: string; // 难度
    requiredScore?: number; // 需要过关的分数（单位：万）
    reward: ChallengeReward; // 奖励
    customReward?: string; // 其他奖励的文本
    notes?: string; // 注释
}

// 歌曲选择项类型
export interface SongOption {
    id: number;
    title: string;
    title_cn: string;
    levels: string[]; // 可用的难度等级
}
