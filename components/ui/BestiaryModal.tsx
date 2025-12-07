import React, { useState } from 'react';
import { BOSS_LORE_DATA, BOSS_POOL, getEnemyAsset } from '../../services/gameLogic';
import { Skull, X, Shield, Sword } from 'lucide-react';

interface BestiaryModalProps {
  onClose: () => void;
}

export const BestiaryModal: React.FC<BestiaryModalProps> = ({ onClose }) => {
  const [selectedId, setSelectedId] = useState<number>(1);
  const boss = BOSS_LORE_DATA[selectedId];
  const customAsset = getEnemyAsset(boss.name, true, selectedId * 5);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-pop-in p-4">
      <div className="w-full max-w-4xl h-[600px] border-4 border-[#333] bg-[#0f0f0f] flex flex-col md:flex-row shadow-2xl relative">
        <button 
            onClick={onClose} 
            className="absolute top-2 right-2 md:-top-4 md:-right-4 w-8 h-8 bg-red-900 text-white flex items-center justify-center border border-red-600 hover:bg-red-800 z-50 rounded-sm"
        >
            <X size={20} />
        </button>

        {/* 左侧列表 */}
        <div className="w-full md:w-1/3 bg-[#1a1a1a] border-r border-[#333] flex flex-col">
            <div className="p-4 border-b border-[#333] bg-[#222]">
                <h2 className="text-[#FFD700] font-bold text-lg flex items-center gap-2">
                    <Skull size={20} /> 恶魔图鉴
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                {Object.values(BOSS_LORE_DATA).map((item) => (
                    <button 
                        key={item.id}
                        onClick={() => setSelectedId(item.id)}
                        className={`w-full text-left p-3 border-l-4 transition-all flex justify-between items-center ${
                            selectedId === item.id 
                            ? 'bg-[#333] border-[#FFD700] text-white' 
                            : 'bg-transparent border-transparent text-gray-500 hover:bg-[#222] hover:text-gray-300'
                        }`}
                    >
                        <span className="font-bold text-sm">Tier {item.id}</span>
                        <span className="text-xs truncate ml-2">{item.name.replace('☠️ ', '')}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* 右侧详情 */}
        <div className="flex-1 p-6 flex flex-col relative overflow-hidden">
            {/* 背景装饰字 */}
            <div className="absolute top-10 right-10 text-[100px] font-black text-[#ffffff05] pointer-events-none select-none">
                TIER {boss.id}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                 {/* Boss 形象 */}
                 <div className="w-48 h-48 md:w-64 md:h-64 mb-6 relative group">
                     <div className="absolute inset-0 bg-[#FFD700]/10 rounded-full blur-[50px] animate-pulse"></div>
                     {customAsset ? (
                         <img src={customAsset} alt={boss.name} className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] animate-float-up" />
                     ) : (
                         <div className="w-full h-full flex items-center justify-center">
                             <Skull size={120} className="text-[#F44336] opacity-80 drop-shadow-[0_0_10px_#000]" />
                         </div>
                     )}
                 </div>
                 
                 <div className="text-center space-y-2">
                     <div className="text-[#F44336] text-xs font-bold tracking-[0.2em] uppercase">{boss.title}</div>
                     <h1 className="text-3xl font-black text-white drop-shadow-[2px_2px_0_#000]">{boss.name.replace('☠️ ', '')}</h1>
                 </div>

                 {/* 难度星级 */}
                 <div className="flex gap-1 mt-4">
                     {Array.from({ length: 10 }).map((_, i) => (
                         <div key={i} className={`w-2 h-2 rounded-full ${i < boss.difficulty ? 'bg-[#FFD700] shadow-[0_0_5px_#FFD700]' : 'bg-[#333]'}`}></div>
                     ))}
                 </div>
            </div>

            {/* 描述文本 */}
            <div className="mt-8 bg-[#0a0a0a] border border-[#333] p-4 relative">
                 <div className="absolute -top-3 left-4 bg-[#0a0a0a] px-2 text-[#444] text-xs">ARCHIVE_DATA</div>
                 <p className="text-gray-400 text-sm leading-relaxed italic">
                     "{boss.description}"
                 </p>
                 
                 <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#222]">
                     <div className="flex items-center gap-2 text-xs text-gray-500">
                         <Sword size={14} />
                         <span>推荐战力: {Math.pow(10, boss.id).toLocaleString()}</span>
                     </div>
                     <div className="flex items-center gap-2 text-xs text-gray-500">
                         <Shield size={14} />
                         <span>元素弱点: 无</span>
                     </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};