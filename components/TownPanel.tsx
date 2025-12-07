
import React, { useState } from 'react';
import { Player, ItemType, Equipment, ItemRarity } from '../types';
import { RetroCard } from './ui/RetroCard';
import { Hammer, ShoppingBag, Anvil, ArrowUpCircle, AlertTriangle, Sword, Shirt, Footprints, Gem } from 'lucide-react';
import { UPGRADE_RATES } from '../services/gameLogic';
import { Tooltip } from './ui/Tooltip';

interface TownPanelProps {
  player: Player;
  onUpgrade: (slot: ItemType) => void;
}

export const TownPanel: React.FC<TownPanelProps> = ({ player, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState<'BLACKSMITH' | 'MARKET'>('BLACKSMITH');

  const upgradeCost = (level: number) => {
    // 消耗 = (等级+1) * 100
    return (level + 1) * 100;
  };

  const getSuccessRate = (level: number) => {
    return UPGRADE_RATES[level] !== undefined ? UPGRADE_RATES[level] : 0;
  };

  const getRarityColor = (rarity: ItemRarity) => {
    switch(rarity) {
      case ItemRarity.COMMON: return 'text-[#4CAF50] border-[#4CAF50]';
      case ItemRarity.RARE: return 'text-[#2196F3] border-[#2196F3]';
      case ItemRarity.LEGENDARY: return 'text-[#FFD700] border-[#FFD700]';
      case ItemRarity.MYTHIC: return 'text-[#F44336] border-[#F44336] animate-pulse';
      default: return 'text-gray-400 border-gray-700';
    }
  };

  const getItemIcon = (type: ItemType) => {
    switch(type) {
        case ItemType.WEAPON: return Sword;
        case ItemType.ARMOR: return Shirt;
        case ItemType.BOOTS: return Footprints;
        case ItemType.ACCESSORY: return Gem;
        default: return Sword;
    }
  };

  const getStatImprovementPreview = (item: Equipment) => {
      // 每一级提升基础属性的 10%
      return (
          <div className="text-left space-y-1">
              <div className="font-bold border-b border-gray-600 pb-1 mb-1 text-[#FFD700]">强化预览 +{item.upgradeLevel + 1}</div>
              <div className="flex justify-between gap-4 text-gray-300">
                  <span>成功率:</span>
                  <span className={getSuccessRate(item.upgradeLevel) < 0.5 ? 'text-[#F44336]' : 'text-[#4CAF50]'}>
                      {(getSuccessRate(item.upgradeLevel) * 100).toFixed(0)}%
                  </span>
              </div>
              <div className="text-[10px] text-gray-500 mt-1">属性提升:</div>
              {item.baseStats.atk && <div className="text-red-300 flex justify-between"><span>ATK</span> <span>+{Math.floor(item.baseStats.atk * 0.1) || 1}</span></div>}
              {item.baseStats.def && <div className="text-blue-300 flex justify-between"><span>DEF</span> <span>+{Math.floor(item.baseStats.def * 0.1) || 1}</span></div>}
              {item.baseStats.maxHp && <div className="text-green-300 flex justify-between"><span>HP</span> <span>+{Math.floor(item.baseStats.maxHp * 0.1) || 1}</span></div>}
              {item.baseStats.speed && <div className="text-yellow-300 flex justify-between"><span>SPD</span> <span>+{Math.floor(item.baseStats.speed * 0.1) || 1}</span></div>}
          </div>
      );
  };

  const getItemTooltip = (item: Equipment) => {
      return (
          <div className="text-left font-sans min-w-[150px]">
              <div className={`font-bold border-b border-gray-600 pb-1 mb-1 whitespace-nowrap ${getRarityColor(item.rarity).split(' ')[0]}`}>
                  {item.name} {item.upgradeLevel > 0 && <span className="text-[#FFD700]">+{item.upgradeLevel}</span>}
              </div>
              <div className="text-[10px] text-gray-400 mb-1">
                  当前属性 (Lv.{item.levelReq})
              </div>
              <div className="space-y-0.5 text-[10px]">
                  {item.baseStats.atk && <div className="text-red-300">攻击: {item.baseStats.atk}</div>}
                  {item.baseStats.def && <div className="text-blue-300">防御: {item.baseStats.def}</div>}
                  {item.baseStats.maxHp && <div className="text-green-300">生命: {item.baseStats.maxHp}</div>}
                  {item.affixes.length > 0 && <div className="text-purple-300 mt-1">{item.affixes.length} 条词缀</div>}
              </div>
          </div>
      );
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* 城镇导航 */}
      <div className="flex gap-2">
        <button 
          onClick={() => setActiveTab('BLACKSMITH')}
          className={`flex-1 p-3 border-b-4 font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'BLACKSMITH' ? 'border-[#F44336] text-[#F44336] bg-[#1e1e1e]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          <Hammer size={16} /> 铁匠铺
        </button>
        <button 
          onClick={() => setActiveTab('MARKET')}
          className={`flex-1 p-3 border-b-4 font-bold text-xs flex items-center justify-center gap-2 transition-all ${activeTab === 'MARKET' ? 'border-[#FFD700] text-[#FFD700] bg-[#1e1e1e]' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          <ShoppingBag size={16} /> 集市
        </button>
      </div>

      {activeTab === 'BLACKSMITH' && (
        <div className="space-y-4 animate-pop-in">
          <RetroCard title="装备强化">
            <div className="p-2 text-xs text-gray-400 mb-4 text-center">
              消耗金币和精华提升装备。满级 <span className="text-[#FFD700]">+10</span> 将随机获得 <span className="text-purple-400 font-bold">史诗特效</span>。
            </div>
            
            <div className="space-y-3">
              {[ItemType.WEAPON, ItemType.ARMOR, ItemType.BOOTS, ItemType.ACCESSORY].map((type) => {
                const item = player.equipment[type];
                if (!item) return null;
                
                const isMaxed = item.upgradeLevel >= 10;
                const cost = isMaxed ? 0 : upgradeCost(item.upgradeLevel);
                const essenceCost = isMaxed ? 0 : item.upgradeLevel + 1;
                const canAfford = player.gold >= cost && player.essence >= essenceCost;
                const rate = getSuccessRate(item.upgradeLevel);
                const Icon = getItemIcon(type);

                return (
                  <div key={type} className="flex items-center justify-between bg-[#1e1e1e] p-2 border border-[#333]">
                    <div className="flex items-center gap-3">
                       {/* 装备图标 - 带 Tooltip */}
                       <Tooltip content={getItemTooltip(item)} position="right">
                           <div className={`w-10 h-10 border bg-[#111] flex items-center justify-center rounded cursor-help ${getRarityColor(item.rarity)}`}>
                               <Icon size={20} className={getRarityColor(item.rarity).split(' ')[0]} />
                           </div>
                       </Tooltip>
                       
                       <div className="flex flex-col">
                          <span className={`font-bold text-xs ${item.upgradeLevel >= 10 ? 'text-[#FFD700] drop-shadow-[0_0_5px_rgba(234,179,8,0.8)]' : 'text-white'}`}>
                            {item.name} <span className="text-[#FFD700]">+{item.upgradeLevel}</span>
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                              {!isMaxed && (
                                  <span className={`text-[10px] font-mono ${rate < 0.3 ? 'text-[#F44336] font-bold' : rate < 0.6 ? 'text-[#FFD700]' : 'text-[#4CAF50]'}`}>
                                      成功率: {(rate * 100).toFixed(0)}%
                                  </span>
                              )}
                              {isMaxed && <span className="text-[10px] text-purple-400 font-bold">已满级</span>}
                          </div>
                       </div>
                    </div>
                    
                    {isMaxed ? (
                        <div className="px-3 py-1 bg-[#2a2a2a] border border-[#444] text-gray-500 text-xs cursor-default">
                            已满
                        </div>
                    ) : (
                        <Tooltip content={getStatImprovementPreview(item)} position="left">
                            <button 
                                onClick={() => onUpgrade(type)}
                                disabled={!canAfford}
                                className={`flex items-center gap-2 px-3 py-1 border-b-2 active:border-b-0 active:translate-y-0.5 transition-all text-xs animate-click-bounce ${
                                    canAfford 
                                    ? 'border-orange-700 bg-orange-600 text-white hover:bg-orange-500' 
                                    : 'border-[#333] bg-[#222] text-gray-600 cursor-not-allowed'
                                }`}
                            >
                                <ArrowUpCircle size={14} />
                                <div className="flex flex-col items-start leading-none">
                                    <span>强化</span>
                                    <span className="text-[9px] scale-90 origin-left mt-0.5 opacity-90">
                                    💰{cost} 🔮{essenceCost}
                                    </span>
                                </div>
                            </button>
                        </Tooltip>
                    )}
                  </div>
                );
              })}
              
              {!player.equipment[ItemType.WEAPON] && !player.equipment[ItemType.ARMOR] && (
                 <div className="text-center text-gray-600 py-4">请先装备物品</div>
              )}
            </div>
          </RetroCard>

          <div className="bg-[#1e1e1e] p-2 border border-[#333] text-xs flex justify-between rounded shadow-inner">
            <span className="text-gray-400">当前持有:</span>
            <div className="space-x-4 font-mono">
              <span className="text-[#FFD700] font-bold">💰 {player.gold}</span>
              <span className="text-purple-400 font-bold">🔮 {player.essence}</span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'MARKET' && (
        <div className="flex-1 flex items-center justify-center text-gray-500">
           <div className="text-center">
             <ShoppingBag size={48} className="mx-auto mb-2 opacity-20" />
             <p>集市正在装修中...</p>
             <p className="text-xs mt-2">在这里你可以买到药水和材料。</p>
           </div>
        </div>
      )}
    </div>
  );
};
