'use client';

import { TaikoStatusConfig, TextBoxConfig } from '@/app/types';
import { useState, useMemo } from 'react';
import { Wallpaper,Coins,Headphones,Drum } from 'lucide-react';
interface TaikoStatusProps {
  config: TaikoStatusConfig;
}


function calculateTextBoxPositions(textBoxes: TextBoxConfig[], minDistance: number = 60) {
  if (textBoxes.length === 0) return [];
  
  const positions = textBoxes.map(tb => ({ ...tb }));
  

  const minMoveDistance = 30;
  
  let hasOverlap = true;
  let iterations = 0;
  const maxIterations = 100;
  
  while (hasOverlap && iterations < maxIterations) {
    hasOverlap = false;
    
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const dx = positions[i].x - positions[j].x;
        const dy = positions[i].y - positions[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < minDistance) {
          hasOverlap = true;
          
          // 计算需要移动的距离，确保至少移动minMoveDistance
          const overlap = Math.max(minDistance - distance, minMoveDistance * 2);
          
          // 两个文本框都移动一点，但移动方向相反
          const moveX = (dx / (distance || 1)) * overlap * 0.5;
          const moveY = (dy / (distance || 1)) * overlap * 0.5;
          
          // 移动第一个文本框远离第二个
          positions[i].x += moveX;
          positions[i].y += moveY;
          
          // 移动第二个文本框远离第一个
          positions[j].x -= moveX;
          positions[j].y -= moveY;
        }
      }
    }
    
    iterations++;
  }
  
  // 确保文本框不会移出图片边界（图片大小为500x200）
  const imageWidth = 500;
  const imageHeight = 200;
  const padding = 30;
  const line = 20;
  
  positions.forEach(pos => {
    // 如果文本对齐方式是居中，则不移动位置
    if (pos.textAlign !== 'center') {
      // 根据x坐标位置调整：如果x小于250则向左移动line，如果x大于250则向右移动line
      if (pos.x < 250) {
        pos.x = Math.max(padding, pos.x - line);
      } else {
        pos.x = Math.min(imageWidth - padding, pos.x + line);
      }
    }
    // 限制Y坐标
    pos.y = Math.max(padding, Math.min(imageHeight - padding, pos.y));
  });
  
  return positions;
}

function ImageWithPointsAndTexts({ 
  imageSrc, 
  textBoxes, 
  title,
  imageIndex 
}: { 
  imageSrc: string;
  textBoxes: TextBoxConfig[];
  title: string;
  imageIndex: number;
}) {
  // 计算防重叠后的位置
  const adjustedTextBoxes = useMemo(() => 
    calculateTextBoxPositions(textBoxes, 40), 
    [textBoxes]
  );


  return (
    <div className="flex-1 min-w-[300px] max-w-full">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="font-medium text-gray-700 dark:text-gray-300">
          {title}
        </h4>
      </div>
      
      {/* 外层容器，限制宽度并启用滚动 */}
      <div className="relative overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent rounded-lg max-w-full">
        {/* 内层容器，保持图片原始尺寸 */}
        <div className="relative bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden w-[500px] min-w-[300px]">
          {/* 背景图片 */}
          <img
            src={imageSrc}
            alt={`${imageIndex + 1}`}
            className="w-[500px] h-[200px] object-contain"
          />

          {/* SVG画布用于点和连线 */}
          <svg className="absolute top-0 left-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            {/* 绘制所有点和连线 */}
            {adjustedTextBoxes.map((textBox, index) => {
              // 原始点位置
              const originalX = textBoxes[index].x;
              const originalY = textBoxes[index].y;
              
              // 调整后的文本框位置
              const adjustedX = textBox.x;
              const adjustedY = textBox.y;
              
              return (
                <g key={`line-${textBox.id}`}>
                  {/* 连接线：从原始点到调整后的文本框 */}
                  <line
                    x1={originalX}
                    y1={originalY}
                    x2={adjustedX}
                    y2={adjustedY}
                    stroke={textBox.color || '#000000'}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.6"
                  />
                  
                  {/* 原始点 */}
                  <circle
                    cx={originalX}
                    cy={originalY}
                    r="4"
                    fill={textBox.color || '#000000'}
                    stroke="#ffffff"
                    strokeWidth="1"
                  />
                  
                  {/* 调整后的点（文本框位置） */}
                  <circle
                    cx={adjustedX}
                    cy={adjustedY}
                    r="3"
                    fill={textBox.backgroundColor || '#ffffff'}
                    stroke={textBox.color || '#000000'}
                    strokeWidth="1"
                  />
                </g>
              );
            })}
          </svg>

          {/* 文本框叠加层 */}
          <div className="absolute top-0 left-0 w-full h-full">
            {adjustedTextBoxes.map((textBox, index) => {
              // 根据对齐方式计算样式
              let textAlignStyle = 'text-left';
              let transformStyle = 'translate(-0%, -50%)'; // 默认左对齐
              
              if (textBox.textAlign === 'center') {
                textAlignStyle = 'text-center';
                transformStyle = 'translate(-50%, -50%)';
              } else if (textBox.textAlign === 'right') {
                textAlignStyle = 'text-right';
                transformStyle = 'translate(-100%, -50%)';
              }
              
              return (
                <div
                  key={textBox.id}
                  className="absolute"
                  style={{
                    left: `${textBox.x}px`,
                    top: `${textBox.y}px`,
                    transform: transformStyle,
                    zIndex: 10,
                  }}
                >
                  <div
                    className={`px-2 py-1 rounded shadow-md whitespace-nowrap ${textAlignStyle}`}
                    style={{
                      color: textBox.color || '#000000',
                      fontSize: `${textBox.fontSize || 14}px`,
                      backgroundColor: textBox.backgroundColor || 'rgba(255, 255, 255, 0.9)',
                      maxWidth: '200px',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      border: `1px solid ${textBox.color || '#000000'}`,
                    }}
                    title={`ID: ${textBox.id}, 对齐: ${textBox.textAlign || 'left'}`}
                  >
                    {textBox.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}

export default function TaikoStatus({ config }: TaikoStatusProps) {
  const { title, player1Texts, player2Texts,screen,headset,coin,other,posUrl } = config;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
      <div className="mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">{title}</h3>
          <a href={posUrl} target="_blank" rel="noreferrer" className="text-sm text-gray-500 hover:text-gray-600 dark:text-gray-400">高德地图</a>
        </div>
      </div>

        <div className="flex flex-col lg:flex-row gap-6 justify-center items-center">
          <div className="flex flex-col items-center overflow-x-auto w-full max-w-full">
            <ImageWithPointsAndTexts
              imageSrc="/Base.png"
              textBoxes={player1Texts}
              title="1P"
              imageIndex={0}
            />
          </div>
          <div className="hidden lg:block self-center">
            <div className="w-px h-48 bg-gray-300 dark:bg-gray-700"></div>
          </div>
          <div className="flex flex-col items-center overflow-x-auto w-full max-w-full">
            <ImageWithPointsAndTexts
              imageSrc="/Base.png"
              textBoxes={player2Texts}
              title="2P"
              imageIndex={1}
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-6">
          <div className="flex flex-col gap-2 text-black dark:text-white">
            <p className='flex flex-row gap-4'><Wallpaper size={24} />{screen}</p>
            <p className='flex flex-row gap-4'><Headphones size={24} />{headset}</p>
            <p className='flex flex-row gap-4'><Coins size={24} />{coin}</p>
            <p className='flex flex-row gap-4'><Drum size={24} />{other}</p>
          </div>
        </div>


    </div>
  );
}
