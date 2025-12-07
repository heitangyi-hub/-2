
import React, { useEffect, useState } from 'react';
import { Sword, BookOpen, Save, ChevronRight } from 'lucide-react';
import { ASSET_CONFIG } from '../services/gameLogic';

interface MainMenuProps {
  onStartGame: () => void;
  onLoadGame: () => void;
  onOpenBestiary: () => void;
  hasSave: boolean;
}

// --- 像素组件库 (Texture & Detail Upgrade) ---

// 1. 动态篝火组件 (保持原版优秀设计，微调光照适配新地面)
const RetroCampfire = () => (
    <div className="relative w-12 h-16 flex justify-center items-end group z-30">
        {/* 核心光晕 */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-64 h-32 bg-orange-500/10 rounded-full blur-[30px] animate-fire-breath pointer-events-none mix-blend-screen"></div>
        
        {/* 柴火 */}
        <div className="absolute bottom-1 w-12 h-3 bg-[#3e2723] rounded-sm border border-black z-10 shadow-sm"></div>
        <div className="absolute bottom-1 w-12 h-3 bg-[#4e342e] rotate-[20deg] rounded-sm border border-black z-10"></div>
        <div className="absolute bottom-1 w-12 h-3 bg-[#3e2723] -rotate-[20deg] rounded-sm border border-black z-10"></div>

        {/* 像素火焰 */}
        <div className="absolute bottom-3 w-6 h-6 bg-[#ffeb3b] animate-fire-core z-20 shadow-[0_0_10px_#ffeb3b]"></div>
        <div className="absolute bottom-4 w-4 h-8 bg-[#ff9800] animate-fire-mid left-3 z-20 opacity-90"></div>
        <div className="absolute bottom-5 w-3 h-5 bg-[#f44336] animate-fire-tip right-4 z-20 opacity-80"></div>
        
        {/* 飞溅火星 */}
        <div className="absolute bottom-6 left-1/2 w-1 h-1 bg-yellow-200 animate-spark-1 z-20"></div>
        <div className="absolute bottom-6 left-1/2 w-1 h-1 bg-orange-300 animate-spark-2 z-20"></div>
    </div>
);

// 2. 英雄背影
const RetroHero = () => (
    <div className="relative w-14 h-20 flex flex-col items-center z-30">
        {/* 头部 */}
        <div className="w-6 h-6 bg-[#1a1a1a] z-20 border-2 border-black relative shadow-sm">
            <div className="absolute top-1 right-0 w-1 h-3 bg-[#666]"></div> 
        </div>
        
        {/* 身体 */}
        <div className="w-10 h-10 bg-[#333] -mt-1 z-10 border-2 border-black flex justify-center overflow-hidden relative">
            <div className="w-2 h-full bg-[#222]"></div>
        </div>

        {/* 飘动的红色披风 */}
        <div className="absolute top-5 left-1 w-12 h-14 bg-[#b71c1c] z-0 origin-top-right animate-cape-wave border border-black/50">
             <div className="absolute bottom-0 w-full h-3 bg-[#7f0000]"></div>
        </div>

        {/* 腿部 */}
        <div className="flex gap-2 -mt-1 z-10">
            <div className="w-3 h-5 bg-[#111] border border-black"></div>
            <div className="w-3 h-5 bg-[#111] border border-black"></div>
        </div>
        
        {/* 巨剑 */}
        <div className="absolute top-4 -right-8 w-4 h-20 bg-[#555] rotate-[15deg] border-2 border-black flex flex-col items-center origin-bottom shadow-lg">
             <div className="w-8 h-2 bg-[#888] absolute top-4 border border-black"></div>
             <div className="w-2 h-4 bg-[#3e2723] absolute -top-4 border border-black"></div>
        </div>
    </div>
);

// 3. 远景尖塔 (材质升级版)
const RetroSpire = () => (
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-56 h-[70%] pointer-events-none z-10 flex flex-col items-center justify-end">
        
        {/* 塔顶 (Crown/Battlements) */}
        <div className="w-32 h-12 bg-[#1a1a1a] border-x-2 border-t-2 border-[#000] relative z-20 flex justify-between items-start px-1"
             style={{ 
                 background: 'linear-gradient(to right, #0f0f0f, #2a2a2a, #0f0f0f)',
             }}>
             {/* 垛口 */}
             <div className="w-4 h-6 bg-[#0f0f0f] -mt-4 border-2 border-[#000]"></div>
             <div className="w-4 h-6 bg-[#0f0f0f] -mt-4 border-2 border-[#000]"></div>
             <div className="w-4 h-6 bg-[#0f0f0f] -mt-4 border-2 border-[#000]"></div>
             <div className="w-4 h-6 bg-[#0f0f0f] -mt-4 border-2 border-[#000]"></div>
        </div>

        {/* 塔身 (Main Shaft with Texture) */}
        <div className="w-48 h-full relative" 
             style={{ 
                 clipPath: 'polygon(15% 0, 85% 0, 100% 100%, 0% 100%)',
                 filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))' // 外部阴影
             }}>
            <div className="w-full h-full relative border-x-2 border-[#000]" 
                 style={{ 
                     // 基础色
                     backgroundColor: '#151515',
                     // 纹理合成：
                     // 1. 左右立体渐变
                     // 2. 砖块横线 (每20px)
                     backgroundImage: `
                        linear-gradient(to right, rgba(0,0,0,0.8), transparent 20%, transparent 80%, rgba(0,0,0,0.8)),
                        repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(0,0,0,0.5) 20px)
                     `,
                 }}>
                 
                 {/* 窗户 (Candle light inside) */}
                 {/* 随机分布的窗户，带闪烁 */}
                 <div className="w-2 h-3 bg-[#ffb300] absolute top-[10%] left-[48%] animate-window-flicker shadow-[0_0_5px_#ff6f00]"></div>
                 <div className="w-1 h-2 bg-[#ff6f00] absolute top-[25%] left-[40%] animate-window-flicker" style={{ animationDelay: '1s' }}></div>
                 <div className="w-1 h-2 bg-[#ff6f00] absolute top-[28%] left-[55%] animate-window-flicker" style={{ animationDelay: '2.5s' }}></div>
                 
                 <div className="w-2 h-4 bg-[#ffb300] absolute top-[45%] left-[49%] animate-window-flicker shadow-[0_0_8px_#ff6f00]" style={{ animationDelay: '0.5s' }}></div>
                 
                 <div className="w-1 h-2 bg-[#ff6f00] absolute top-[60%] left-[35%] opacity-50"></div>
                 <div className="w-1 h-2 bg-[#ff6f00] absolute top-[65%] left-[60%] opacity-50"></div>

                 {/* 纵向裂纹细节 */}
                 <div className="absolute top-[35%] left-[30%] w-[1px] h-8 bg-black opacity-30"></div>
                 <div className="absolute top-[70%] right-[30%] w-[1px] h-12 bg-black opacity-30"></div>
            </div>
        </div>
    </div>
);

// 4. 月亮
const RetroMoon = () => (
    <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-40 h-40 rounded-full z-0 overflow-hidden"
         style={{ 
             background: 'linear-gradient(to bottom right, #cbd5e1, #64748b)',
             boxShadow: '0 0 60px rgba(200, 220, 255, 0.1)' 
         }}>
        {/* 陨石坑 */}
        <div className="absolute top-8 left-10 w-8 h-8 bg-[#475569] rounded-full opacity-20"></div>
        <div className="absolute bottom-10 right-8 w-10 h-10 bg-[#475569] rounded-full opacity-20"></div>
        <div className="absolute top-16 right-6 w-4 h-4 bg-[#475569] rounded-full opacity-30"></div>
        <div className="absolute bottom-12 left-8 w-3 h-3 bg-[#475569] rounded-full opacity-30"></div>
    </div>
);

// 5. 星空
const RetroStars = () => (
    <div className="absolute inset-0 z-0">
        {[...Array(40)].map((_, i) => (
            <div 
                key={i} 
                className="absolute bg-white rounded-[1px] animate-twinkle"
                style={{ 
                    top: `${Math.random() * 60}%`, 
                    left: `${Math.random() * 100}%`,
                    width: Math.random() > 0.9 ? '3px' : '2px', 
                    height: Math.random() > 0.9 ? '3px' : '2px',
                    opacity: Math.random() * 0.7 + 0.3,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${Math.random() * 2 + 1}s`
                }}
            ></div>
        ))}
    </div>
);

export const MainMenu: React.FC<MainMenuProps> = ({ onStartGame, onLoadGame, onOpenBestiary, hasSave }) => {
  const [activeItem, setActiveItem] = useState<number>(0);

  const menuItems = [
      { id: 0, label: '开始征程', icon: Sword, action: onStartGame, disabled: false, customImg: ASSET_CONFIG.mainMenu.btn_start },
      { id: 1, label: '继续冒险', icon: Save, action: onLoadGame, disabled: !hasSave, customImg: ASSET_CONFIG.mainMenu.btn_continue },
      { id: 2, label: '恶魔图鉴', icon: BookOpen, action: onOpenBestiary, disabled: false, customImg: ASSET_CONFIG.mainMenu.btn_wiki }
  ];

  // 键盘支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'ArrowUp') setActiveItem(p => Math.max(0, p - 1));
        if (e.key === 'ArrowDown') setActiveItem(p => Math.min(menuItems.length - 1, p + 1));
        if (e.key === 'Enter') {
            const item = menuItems[activeItem];
            if (!item.disabled) item.action();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeItem, hasSave]);

  return (
    <div className="w-full max-w-md h-[100vh] md:h-[800px] relative overflow-hidden bg-[#050505] font-mono select-none border-x-0 md:border-4 border-[#111] shadow-2xl flex flex-col items-center">
      
      {/* 动画定义 */}
      <style>{`
        @keyframes fire-core { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        @keyframes fire-mid { 0%, 100% { height: 16px; transform: skewX(0deg); } 50% { height: 20px; transform: skewX(-10deg); } }
        @keyframes fire-tip { 0%, 100% { transform: translateY(0) scale(1); opacity: 0.8; } 50% { transform: translateY(-8px) scale(0.6); opacity: 0.4; } }
        @keyframes fire-breath { 0%, 100% { opacity: 0.2; transform: translate(-50%, 0) scale(1); } 50% { opacity: 0.4; transform: translate(-50%, 0) scale(1.1); } }
        @keyframes cape-wave { 0%, 100% { transform: rotate(5deg) skewX(0deg); } 50% { transform: rotate(8deg) skewX(5deg); } }
        @keyframes title-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes shine { to { background-position: 200% center; } }
        @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
        @keyframes window-flicker { 0%, 100% { opacity: 1; } 90% { opacity: 0.5; } 95% { opacity: 0; } }
        @keyframes spark-rise { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-40px); opacity: 0; } }

        .animate-fire-core { animation: fire-core 0.4s steps(4) infinite; }
        .animate-fire-mid { animation: fire-mid 0.6s steps(4) infinite; }
        .animate-fire-tip { animation: fire-tip 0.5s linear infinite; }
        .animate-fire-breath { animation: fire-breath 2s ease-in-out infinite; }
        .animate-cape-wave { animation: cape-wave 2s ease-in-out infinite; }
        .animate-title-float { animation: title-float 3s ease-in-out infinite; }
        .animate-shine { animation: shine 3s linear infinite; }
        .animate-twinkle { animation: twinkle 2s ease-in-out infinite; }
        .animate-window-flicker { animation: window-flicker 4s steps(1) infinite; }
        .animate-spark-1 { animation: spark-rise 1.5s linear infinite; }
        .animate-spark-2 { animation: spark-rise 2.0s linear infinite 1s; }
      `}</style>

      {/* 支持自定义背景 */}
      {ASSET_CONFIG.mainMenu.background ? (
          <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${ASSET_CONFIG.mainMenu.background})` }}></div>
      ) : (
          <>
            {/* Layer 0: Sky Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#2e1065] z-0"></div>
            
            {/* Layer 1: Stars & Moon */}
            <RetroStars />
            <RetroMoon />

            {/* Layer 2: Spire (Texture Upgraded) */}
            <RetroSpire />

            {/* Layer 3: Ground (Texture Upgraded) */}
            <div className="absolute bottom-0 w-full h-[35%] z-20"
                style={{ 
                    clipPath: 'polygon(0 15%, 30% 5%, 60% 12%, 100% 0, 100% 100%, 0 100%)',
                    backgroundColor: '#1c1917', // Dark warm gray
                    // 噪点材质
                    backgroundImage: `
                        radial-gradient(circle at 50% 50%, rgba(255,255,255,0.05) 1px, transparent 1px),
                        radial-gradient(circle at 20% 30%, rgba(0,0,0,0.4) 2px, transparent 2px)
                    `,
                    backgroundSize: '12px 12px, 24px 24px'
                }}>
                {/* 顶部高光 (模拟月光边缘) */}
                <div className="absolute top-0 w-full h-2 bg-gradient-to-b from-blue-200/10 to-transparent"></div>
                {/* 渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            </div>

            {/* Layer 4: Actors */}
            <div className="absolute bottom-[20%] left-[25%] transform scale-125 z-30 drop-shadow-xl">
                <RetroHero />
            </div>
            <div className="absolute bottom-[20%] left-[45%] transform scale-125 z-30 drop-shadow-xl">
                <RetroCampfire />
            </div>
          </>
      )}

      {/* Layer 5: UI Overlay */}
      <div className="relative z-50 flex flex-col items-center justify-between w-full h-full pt-20 pb-12">
          
          {/* Logo Section */}
          <div className="flex flex-col items-center animate-title-float w-full px-4">
               {/* 支持自定义 LOGO */}
               {ASSET_CONFIG.mainMenu.logo ? (
                   <img src={ASSET_CONFIG.mainMenu.logo} alt="Logo" className="w-full max-w-[280px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
               ) : (
                   <>
                        <h1 className="text-3xl md:text-4xl font-black text-center tracking-wider leading-snug animate-shine w-full break-words"
                            style={{ 
                                fontFamily: "'Press Start 2P', monospace",
                                backgroundImage: 'linear-gradient(110deg, #b45309 20%, #ffd700 40%, #ffecb3 50%, #ffd700 60%, #b45309 80%)',
                                backgroundSize: '200% auto',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                filter: 'drop-shadow(3px 3px 0px #000000)'
                            }}>
                            PIXEL<br/>EXPEDITION
                        </h1>
                        
                        <div className="mt-2 text-[#FFD700] text-xs font-bold tracking-[0.5em] drop-shadow-[2px_2px_0_#000]">
                            像素远征
                        </div>
                   </>
               )}
          </div>

          {/* Lightweight Menu */}
          <div className="w-full max-w-[240px] flex flex-col gap-4">
               {menuItems.map((item, index) => (
                   <button
                       key={item.id}
                       onMouseEnter={() => setActiveItem(index)}
                       onClick={item.action}
                       disabled={item.disabled}
                       className={`
                           group relative w-full flex items-center justify-center
                           transition-all duration-100 bg-transparent border-none outline-none
                           ${item.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                       `}
                   >
                       {/* 优先检查是否有自定义图片按钮 */}
                       {item.customImg ? (
                           <div className={`relative transition-transform duration-200 ${activeItem === index ? 'scale-105 brightness-110' : 'scale-100'}`}>
                               <img src={item.customImg} alt={item.label} className="w-full h-auto object-contain" />
                               {/* 选中高光叠加 */}
                               {activeItem === index && (
                                   <div className="absolute inset-0 bg-white/20 mix-blend-overlay rounded pointer-events-none"></div>
                               )}
                           </div>
                       ) : (
                           // 默认像素按钮样式
                           <div className="py-1 px-2 flex items-center justify-center w-full relative">
                               {/* 指针图标 (左侧) */}
                               <div className={`absolute left-0 transition-opacity ${activeItem === index ? 'opacity-100' : 'opacity-0'}`}>
                                    {index === 0 ? <Sword size={16} className="text-[#FFD700] animate-pulse" /> : <ChevronRight size={18} className="text-[#FFD700] animate-pulse" />}
                               </div>

                               {/* 文字内容 */}
                               <span 
                                   className={`
                                       text-sm font-bold tracking-widest transition-all
                                       ${activeItem === index ? 'text-[#FFD700] scale-110 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]' : 'text-gray-500'}
                                   `}
                                   style={{ fontFamily: "'Press Start 2P', monospace" }}
                               >
                                   {item.label}
                               </span>

                               {/* 指针图标 (右侧平衡) - 也可以省略 */}
                               <div className={`absolute right-0 opacity-0`}>
                                   <ChevronRight size={18} />
                               </div>
                           </div>
                       )}
                   </button>
               ))}
          </div>

          {/* Footer */}
          <div className="text-[9px] text-gray-700 font-mono tracking-widest opacity-50">
              © 2024 PIXEL STUDIO
          </div>
      </div>

    </div>
  );
};
