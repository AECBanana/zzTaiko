import TaikoStatus from '@/app/components/TaikoStatus';
import { TaikoStatusConfig } from '@/app/types';
import fs from 'fs';
import path from 'path';

async function getStatusConfigs(): Promise<TaikoStatusConfig[]> {
  try {
    const dataDir = path.join(process.cwd(), 'app/status/data');

    const files = fs.readdirSync(dataDir).filter(file => file.endsWith('.json'));

    const configs: TaikoStatusConfig[] = [];

    for (const file of files) {
      try {
        const filePath = path.join(dataDir, file);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const config = JSON.parse(fileContent) as TaikoStatusConfig;

        // 验证配置格式
        if (config.title && Array.isArray(config.player1Texts) && Array.isArray(config.player2Texts)) {
          configs.push(config);
        } else {
          console.warn(`配置文件 ${file} 格式不正确，已跳过`);
        }
      } catch (error) {
        console.error(`读取配置文件 ${file} 时出错:`, error);
      }
    }

    // 按文件名排序
    configs.sort((a, b) => {
      const indexA = files.findIndex(f => f.includes(a.title) || a.title.includes(f.replace('.json', '')));
      const indexB = files.findIndex(f => f.includes(b.title) || b.title.includes(f.replace('.json', '')));
      return indexA - indexB;
    });

    return configs;
  } catch (error) {
    console.error('读取配置文件目录时出错:', error);
    return [];
  }
}

export default async function Page() {
  const configs = await getStatusConfigs();

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          鼓况
        </h1>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">使用说明</h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-400">
                <ul className="list-disc pl-5 space-y-1">
                  <li>鼓况由群友提供，更新情况可能不及时，有需要请加群了解。</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {configs.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 text-gray-400 dark:text-gray-600 mb-4">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">未找到配置文件</h3>
        </div>
      ) : (
        <div>

          <div className="space-y-8 object-center">
            {configs.map((config, index) => (
              <div key={index}>
                <TaikoStatus config={config} />
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}