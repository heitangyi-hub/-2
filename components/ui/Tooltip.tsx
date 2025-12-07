
import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, className = '', position = 'top' }) => {
  const [isVisible, setIsVisible] = useState(false);
  // 使用 ref 来存储坐标，避免不必要的重渲染，但在需要强制更新时使用 state
  const [baseCoords, setBaseCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const calculatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    
    // 基础定位点
    let top = 0;
    let left = 0;
    const gap = 8;

    switch (position) {
        case 'top':
            top = rect.top - gap;
            left = rect.left + rect.width / 2;
            break;
        case 'bottom':
            top = rect.bottom + gap;
            left = rect.left + rect.width / 2;
            break;
        case 'left':
            top = rect.top + rect.height / 2;
            left = rect.left - gap;
            break;
        case 'right':
            top = rect.top + rect.height / 2;
            left = rect.right + gap;
            break;
    }
    setBaseCoords({ top, left });
  };

  const handleMouseEnter = () => {
      calculatePosition();
      setIsVisible(true);
  };

  // 监听滚动和调整大小，实时更新基础位置
  useEffect(() => {
      if (isVisible) {
          window.addEventListener('scroll', calculatePosition, true);
          window.addEventListener('resize', calculatePosition);
          return () => {
              window.removeEventListener('scroll', calculatePosition, true);
              window.removeEventListener('resize', calculatePosition);
          };
      }
  }, [isVisible]);

  // 边界检测与修正 (Rendering Loop 之后执行)
  useLayoutEffect(() => {
      if (isVisible && tooltipRef.current) {
          const tooltip = tooltipRef.current;
          const rect = tooltip.getBoundingClientRect();
          const padding = 10; // 距离屏幕边缘的安全距离
          
          let translateX = -50; // 默认为居中
          let translateY = position === 'top' ? -100 : position === 'bottom' ? 0 : -50;
          let finalLeft = baseCoords.left;
          let finalTop = baseCoords.top;

          // 1. 水平边界检测 (X-Axis)
          // 实际上我们不改变 left，而是改变 transform 的 translate 比例或者像素值
          // 更好的做法是直接计算偏移量
          
          // 如果超出左边界
          if (rect.left < padding) {
              const overflow = padding - rect.left;
              tooltip.style.transform = `translate(calc(${translateX}% + ${overflow}px), ${translateY}%)`;
          }
          // 如果超出右边界
          else if (rect.right > window.innerWidth - padding) {
              const overflow = rect.right - (window.innerWidth - padding);
              tooltip.style.transform = `translate(calc(${translateX}% - ${overflow}px), ${translateY}%)`;
          } 
          else {
              // 默认
              if (position === 'left') {
                  tooltip.style.transform = `translate(-100%, -50%)`;
              } else if (position === 'right') {
                  tooltip.style.transform = `translate(0, -50%)`;
              } else {
                  tooltip.style.transform = `translate(-50%, ${translateY}%)`;
              }
          }

          // 2. 垂直边界检测 (Y-Axis) - 主要处理顶部溢出
          // 重新获取 rect 因为 transform 可能改变了布局
          const newRect = tooltip.getBoundingClientRect();
          
          // 如果顶部溢出 (常发生于第一排物品)
          if (newRect.top < padding && position === 'top') {
              // 翻转到底部: 需要重新设置 top 为 trigger 的 bottom
              if (triggerRef.current) {
                  const triggerRect = triggerRef.current.getBoundingClientRect();
                  tooltip.style.top = `${triggerRect.bottom + 8}px`;
                  // 重置 Y transform 为 0 (向下生长)
                  // 保持 X 轴的修正
                  const currentTransform = tooltip.style.transform;
                  // 简单的正则替换或重新构建
                  if (currentTransform.includes('calc')) {
                      // 保留 X 轴的 calc 计算，只改 Y
                      tooltip.style.transform = currentTransform.replace(/, -100%\)/, ', 0%)');
                  } else {
                       tooltip.style.transform = `translate(-50%, 0%)`; 
                  }
              }
          }
      }
  }, [isVisible, baseCoords, position]);

  return (
    <>
      <div 
        ref={triggerRef}
        className={`inline-block select-none ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && createPortal(
        <div 
            ref={tooltipRef}
            className="fixed z-[9999] pointer-events-none transition-opacity duration-150"
            style={{ 
                top: baseCoords.top, 
                left: baseCoords.left, 
                // 初始 Transform，稍后会被 useLayoutEffect 修正
                transform: position === 'top' ? 'translate(-50%, -100%)' : 
                           position === 'bottom' ? 'translate(-50%, 0)' :
                           position === 'left' ? 'translate(-100%, -50%)' :
                           'translate(0, -50%)',
                width: 'max-content',
                maxWidth: '280px'
            }}
        >
            <div className="bg-[#1e1e1e] border-2 border-[#555] text-white text-xs p-3 shadow-[0_4px_20px_rgba(0,0,0,0.8)] whitespace-normal break-words leading-relaxed relative rounded-sm">
                {content}
            </div>
        </div>,
        document.body
      )}
    </>
  );
};
