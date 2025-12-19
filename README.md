# 照片展示系统

基于 Next.js 和 Vercel Blob 的照片展示系统，支持瀑布流布局、无限滚动、搜索过滤和暗色/亮色主题切换。

## 功能特性

- 📸 **瀑布流照片展示** - 响应式网格布局，自动适配不同屏幕尺寸
- 🔍 **智能搜索** - 按标题、日期和文件名搜索照片
- 📱 **无限滚动** - 滚动到底部自动加载更多照片
- 🌓 **主题切换** - 支持暗色/亮色模式
- 🖼️ **照片详情** - 点击照片查看大图和详细信息
- ⬆️ **API 上传** - 通过 API 上传照片（支持 Discord bot 集成）
- 📊 **分页排序** - 支持按时间、标题等多种排序方式

## 技术栈

- **前端**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **存储**: Vercel Blob (对象存储)
- **图标**: Lucide React
- **部署**: Vercel (推荐)

## 快速开始

### 1. 环境配置

复制环境变量模板并配置您的 Vercel Blob 凭证：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local` 文件：

```env
# Vercel Blob Configuration
BLOB_READ_WRITE_TOKEN=your_blob_read_write_token_here

# Upload API Authentication
UPLOAD_API_KEY=your_secure_api_key_here_for_discord_bot
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## API 文档

### 上传照片

**端点**: `POST /api/upload`

**鉴权**: 需要在请求头中提供 `X-API-Key`

**请求格式**: `multipart/form-data`

**参数**:
- `file`: 图片文件 (JPEG, PNG, GIF, WebP, 最大 10MB)
- `title`: 照片标题

**示例请求**:
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "X-API-Key: your_api_key" \
  -F "title=美丽的风景" \
  -F "file=@/path/to/photo.jpg"
```

**成功响应**:
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "photo": {
    "id": "photos/1702961234567-abc123.jpg",
    "url": "https://xxx.public.blob.vercel-storage.com/photos/1702961234567-abc123.jpg",
    "title": "美丽的风景",
    "uploadedAt": "2025-12-19T11:47:04.123Z",
    "size": 2048576,
    "contentType": "image/jpeg",
    "originalFilename": "photo.jpg",
    "imageUrl": "https://xxx.public.blob.vercel-storage.com/photos/1702961234567-abc123.jpg"
  }
}
```

### 获取照片列表

**端点**: `GET /api/photos`

**查询参数**:
- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20)
- `search`: 搜索关键词 (标题、日期、文件名)
- `sort`: 排序方式 (`newest`, `oldest`, `title`)

**示例请求**:
```bash
curl "http://localhost:3000/api/photos?page=1&limit=20&search=风景&sort=newest"
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "photos": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## 与 Discord Bot 集成

### 设置 Discord Bot

1. 在 Discord Developer Portal 创建新的应用和 bot
2. 获取 bot token
3. 启用必要的权限

### 发送照片到 API

在 Discord bot 代码中，使用以下示例上传照片：

```javascript
// 示例：使用 Discord.js 上传照片
const formData = new FormData();
formData.append('title', '来自 Discord 的照片');
formData.append('file', attachmentBuffer, 'discord-photo.jpg');

const response = await fetch('https://your-domain.com/api/upload', {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.UPLOAD_API_KEY,
  },
  body: formData,
});

const result = await response.json();
console.log('上传结果:', result);
```

## 部署到 Vercel

1. 将代码推送到 GitHub 仓库
2. 在 Vercel 中导入项目
3. 配置环境变量：
   - `BLOB_READ_WRITE_TOKEN`: Vercel Blob 访问令牌
   - `UPLOAD_API_KEY`: 上传 API 密钥
4. 部署！

## 项目结构

```
app/
├── api/
│   ├── upload/
│   │   └── route.ts          # 照片上传 API
│   └── photos/
│       └── route.ts          # 照片获取 API
├── components/               # React 组件
├── layout.tsx               # 根布局
├── page.tsx                 # 主页面 (照片展示)
└── globals.css              # 全局样式
```

## 开发说明

### 添加新功能

1. **添加新的 API 端点**: 在 `app/api/` 下创建新的路由文件
2. **添加 UI 组件**: 在 `app/components/` 下创建 React 组件
3. **修改样式**: 使用 Tailwind CSS 类名，或编辑 `globals.css`

### 测试

1. **开发服务器**: `npm run dev`
2. **代码检查**: `npm run lint`
3. **构建测试**: `npm run build`

## 故障排除

### 常见问题

1. **图片无法加载**
   - 检查 Next.js 图片配置中的远程域名
   - 确认 Vercel Blob 文件是公开可访问的

2. **上传 API 返回 401 错误**
   - 检查 `X-API-Key` 请求头是否正确
   - 确认 `.env.local` 中的 `UPLOAD_API_KEY` 配置

3. **无限滚动不工作**
   - 检查 Intersection Observer 是否正确配置
   - 确认 API 返回正确的分页信息

### 环境变量

- `BLOB_READ_WRITE_TOKEN`: 从 Vercel Blob 设置中获取
- `UPLOAD_API_KEY`: 自定义的 API 密钥，用于保护上传端点

## 许可证

MIT
