
import React, { useState } from 'react';
import { Player, Equipment, ItemType, ItemRarity, Stats } from '../types';
import { RetroCard } from './ui/RetroCard';
import { Tooltip } from './ui/Tooltip';
import { Shirt, Sword, Footprints, Gem, Trash2, Shield, Heart, Zap, Crosshair, Wind, Droplets, Recycle, AlertTriangle, X, Grip } from 'lucide-react';
import { ItemDetailModal } from './ui/ItemDetailModal';
import { ASSET_CONFIG } from '../services/gameLogic';

interface InventoryPanelProps {
  player: Player;
  onEquip: (item: Equipment) => void;
  onSell: (id: string) => void; // 这里实际上是分解
  onUnequip: (slot: ItemType) => void;
  onBatchSell: (rarities: ItemRarity[]) => void;
}

// 辅助函数移到组件外部，保证引用稳定
const getRarityColor = (rarity: ItemRarity) => {
  switch(rarity) {
    case ItemRarity.COMMON: return 'text-[#4CAF50] border-[#4CAF50] bg-[#1b5e20]/20';
    case ItemRarity.RARE: return 'text-[#2196F3] border-[#2196F3] bg-[#0d47a1]/20';
    case ItemRarity.LEGENDARY: return 'text-[#FFD700] border-[#FFD700] bg-[#ff6f00]/20';
    case ItemRarity.MYTHIC: return 'text-[#F44336] border-[#F44336] bg-[#b71c1c]/20 animate-pulse';
    default: return 'text-gray-400 border-gray-700 bg-[#2a2a2a]';
  }
};

const getItemIcon = (type: ItemType) => {
    // 检查是否有自定义图标
    if (ASSET_CONFIG.items[type]) {
        return { type: 'image', src: ASSET_CONFIG.items[type] };
    }
    
    // 默认 Lucide 图标
    switch(type) {
        case ItemType.WEAPON: return { type: 'component', Component: Sword };
        case ItemType.ARMOR: return { type: 'component', Component: Shirt };
        case ItemType.BOOTS: return { type: 'component', Component: Footprints };
        case ItemType.ACCESSORY: return { type: 'component', Component: Gem };
        default: return { type: 'component', Component: Sword };
    }
};

// EquipSlot 组件
const EquipSlot = ({ type, item, onUnequipSlot, onClick }: { type: ItemType; item?: Equipment; onUnequipSlot?: (type: ItemType) => void; onClick: (item: Equipment) => void }) => {
  const iconData = getItemIcon(type);

  return (
    <Tooltip position="bottom" content={item ? <div className="text-left min-w-[120px]"><p className="font-bold border-b border-gray-600 pb-1 mb-1">{item.name}</p><p className="text-gray-400 text-[10px]">点击查看详情</p></div> : '空槽位'}>
      <div 
        className={`relative flex flex-col items-center justify-center p-2 w-20 h-24 border-2 transition-colors cursor-pointer group ${item ? getRarityColor(item.rarity).split(' ')[1] + ' bg-[#1e1e1e]' : 'border-neutral-800 bg-[#121212] border-dashed'}`}
        onClick={() => item && onClick(item)}
      >
        {/* Render Icon or Image */}
        {iconData.type === 'image' ? (
             <img 
               src={iconData.src} 
               className={`w-8 h-8 object-contain ${item ? '' : 'opacity-20 grayscale'}`} 
               alt=""
             />
        ) : (
             // @ts-ignore
             <iconData.Component size={24} fill="currentColor" fillOpacity={0.2} className={item ? getRarityColor(item.rarity).split(' ')[0] : 'text-neutral-700'} />
        )}

        <span className="text-[9px] text-gray-500 mt-1 uppercase text-center w-full truncate">
          {type === ItemType.WEAPON ? '武器' : type === ItemType.ARMOR ? '衣服' : type === ItemType.BOOTS ? '鞋子' : '首饰'}
        </span>
        {item ? (
           <>
             <div className="text-[10px] text-center w-full truncate px-1">{item.name}</div>
             {item.upgradeLevel > 0 && <div className="absolute top-0 right-0 bg-[#FFD700] text-black text-[9px] px-1 font-bold">+{item.upgradeLevel}</div>}
             {onUnequipSlot && (
                <button 
                  className="absolute -top-2 -right-2 bg-red-900 border border-red-500 rounded-full w-5 h-5 flex items-center justify-center text-white z-20 hover:scale-110 hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                      e.stopPropagation();
                      onUnequipSlot(type);
                  }}
                  title="卸下"
                >
                  <X size={12} strokeWidth={3} />
                </button>
             )}
           </>
        ) : (
           <span className="text-[9px] text-gray-600">空</span>
        )}
      </div>
    </Tooltip>
  );
};

// 背包格子组件 (Empty or Filled)
const InventoryGridSlot: React.FC<{ item?: Equipment, onClick: (item: Equipment) => void }> = ({ item, onClick }) => {
    // 空格子渲染
    if (!item) {
        return (
            <div className="aspect-square bg-[#0e0e0e] border border-[#222] border-dashed rounded-sm flex items-center justify-center opacity-50">
                <div className="w-1 h-1 rounded-full bg-[#333]"></div>
            </div>
        );
    }

    const iconData = getItemIcon(item.type);
    
    // Tooltip 内容
    const tooltipContent = (
        <div className="text-left font-sans">
            <div className={`font-bold border-b border-gray-600 pb-1 mb-1 whitespace-nowrap ${getRarityColor(item.rarity).split(' ')[0]}`}>
                {item.name} {item.upgradeLevel > 0 && <span className="text-[#FFD700]">+{item.upgradeLevel}</span>}
            </div>
            <div className="text-[10px] text-gray-400 mb-1">
                {item.type === ItemType.WEAPON ? '武器' : item.type === ItemType.ARMOR ? '衣服' : item.type === ItemType.BOOTS ? '鞋子' : '首饰'}
                    {' '}| Lv.{item.levelReq}
            </div>
            <div className="space-y-0.5 text-[10px]">
                {item.baseStats.atk && <div className="text-red-300">攻击: {item.baseStats.atk}</div>}
                {item.baseStats.def && <div className="text-blue-300">防御: {item.baseStats.def}</div>}
                {item.baseStats.maxHp && <div className="text-green-300">生命: {item.baseStats.maxHp}</div>}
                {item.affixes.length > 0 && <div className="text-purple-300 mt-1">{item.affixes.length} 条词缀</div>}
            </div>
        </div>
    );

    return (
        <Tooltip content={tooltipContent} position="left">
            <div 
                className={`aspect-square relative flex flex-col items-center justify-center border-2 cursor-pointer transition-colors bg-[#1e1e1e] hover:brightness-125 hover:scale-105 active:scale-95 ${getRarityColor(item.rarity)}`}
                onClick={() => onClick(item)}
            >
                {iconData.type === 'image' ? (
                     <img src={iconData.src} className="w-full h-full object-contain p-1" alt="" />
                ) : (
                     // @ts-ignore
                     <iconData.Component size={20} fill="currentColor" fillOpacity={0.2} className={getRarityColor(item.rarity).split(' ')[0]} />
                )}
                {item.upgradeLevel > 0 && <span className="text-[8px] bg-[#FFD700] text-black px-1 absolute top-0 right-0 font-bold">+{item.upgradeLevel}</span>}
            </div>
        </Tooltip>
    );
};

export const InventoryPanel: React.FC<InventoryPanelProps> = ({ player, onEquip, onSell, onUnequip, onBatchSell }) => {
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchRarities, setBatchRarities] = useState<ItemRarity[]>([ItemRarity.COMMON]);

  const totalSlots = 30; // 固定背包容量

  // 计算批量分解预览
  const calculateBatchValue = () => {
      const itemsToSell = player.inventory.filter(i => batchRarities.includes(i.rarity));
      let totalGold = 0;
      let totalEssence = 0;
      
      itemsToSell.forEach(item => {
        let baseEssence = 0;
        if (item.rarity === ItemRarity.COMMON) baseEssence = 1;
        if (item.rarity === ItemRarity.RARE) baseEssence = 5;
        if (item.rarity === ItemRarity.LEGENDARY) baseEssence = 15;
        // 神话不批量分解
        const upgradeBonus = item.upgradeLevel * 2;
        const affixBonus = item.affixes.length * 3;
        totalEssence += baseEssence + upgradeBonus + affixBonus;
        totalGold += item.score * 5;
      });
      return { count: itemsToSell.length, gold: totalGold, essence: totalEssence };
  };

  const batchPreview = calculateBatchValue();

  return (
    <div className="space-y-4 h-full flex flex-col relative">
      {/* 装备栏 */}
      <RetroCard title="已装备" className="shrink-0 bg-[#1e1e1e]">
        <div className="flex justify-around items-center gap-2">
          <EquipSlot type={ItemType.WEAPON} item={player.equipment[ItemType.WEAPON]} onUnequipSlot={onUnequip} onClick={setSelectedItem} />
          <EquipSlot type={ItemType.ARMOR} item={player.equipment[ItemType.ARMOR]} onUnequipSlot={onUnequip} onClick={setSelectedItem} />
          <EquipSlot type={ItemType.BOOTS} item={player.equipment[ItemType.BOOTS]} onUnequipSlot={onUnequip} onClick={setSelectedItem} />
          <EquipSlot type={ItemType.ACCESSORY} item={player.equipment[ItemType.ACCESSORY]} onUnequipSlot={onUnequip} onClick={setSelectedItem} />
        </div>
      </RetroCard>

      {/* 批量分解模态框 */}
      {showBatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-pop-in" onClick={() => setShowBatchModal(false)}>
              <div className="bg-[#1e1e1e] border-2 border-[#555] p-4 w-full max-w-sm shadow-2xl space-y-4" onClick={e => e.stopPropagation()}>
                  <h3 className="text-white font-bold text-center border-b border-[#333] pb-2 flex items-center justify-center gap-2">
                      <Recycle size={18} /> 批量分解
                  </h3>
                  
                  <div className="space-y-2">
                      <div className="text-xs text-gray-400 text-center mb-2">选择要分解的装备品质</div>
                      <div className="flex gap-2 justify-center">
                          {[ItemRarity.COMMON, ItemRarity.RARE, ItemRarity.LEGENDARY].map(rarity => (
                              <button 
                                key={rarity}
                                onClick={() => {
                                    if (batchRarities.includes(rarity)) {
                                        setBatchRarities(batchRarities.filter(r => r !== rarity));
                                    } else {
                                        setBatchRarities([...batchRarities, rarity]);
                                    }
                                }}
                                className={`px-3 py-2 border text-xs font-bold transition-all ${
                                    batchRarities.includes(rarity) 
                                    ? getRarityColor(rarity) 
                                    : 'border-[#333] text-gray-600 bg-[#2a2a2a]'
                                }`}
                              >
                                {rarity === ItemRarity.COMMON ? '普通' : rarity === ItemRarity.RARE ? '稀有' : '传说'}
                              </button>
                          ))}
                      </div>
                      <div className="text-[10px] text-[#F44336] text-center mt-1">* 神话装备为了安全起见，无法批量分解。</div>
                  </div>

                  <div className="bg-black/30 p-2 rounded border border-[#333]">
                      <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">预计分解数量:</span>
                          <span className="text-white font-bold">{batchPreview.count} 件</span>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">获得金币:</span>
                          <span className="text-[#FFD700] font-bold">+{batchPreview.gold}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                          <span className="text-gray-400">获得精华:</span>
                          <span className="text-purple-400 font-bold">+{batchPreview.essence}</span>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setShowBatchModal(false)} className="p-2 border border-[#444] text-gray-400 hover:bg-[#333] text-xs">取消</button>
                      <button 
                        onClick={() => {
                            if (batchPreview.count > 0) {
                                onBatchSell(batchRarities);
                                setShowBatchModal(false);
                            }
                        }}
                        disabled={batchPreview.count === 0}
                        className={`p-2 border text-xs font-bold ${
                            batchPreview.count > 0 
                            ? 'border-[#F44336] bg-red-900/50 text-white hover:bg-red-900' 
                            : 'border-[#333] bg-[#222] text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        确认分解
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* 物品详情弹窗 */}
      {selectedItem && (
        <ItemDetailModal 
            item={selectedItem}
            player={player}
            onClose={() => setSelectedItem(null)}
            onEquip={onEquip}
            onSell={onSell}
            onUnequip={onUnequip}
        />
      )}

      {/* 背包面板 - 自定义容器代替 RetroCard 以解决重叠问题并精确控制布局 */}
      <div className="flex-1 min-h-[340px] flex flex-col bg-[#1e1e1e] border-2 border-neutral-700 shadow-lg relative">
          
          {/* 自定义头部/工具栏 */}
          <div className="flex justify-between items-center bg-[#151515] px-3 py-2 border-b border-[#333] shrink-0 h-10 select-none">
             <div className="flex items-center gap-2">
                 <span className="text-[#FFD700] font-bold text-xs tracking-wider">背包</span>
                 <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${player.inventory.length >= totalSlots ? 'text-red-400 border-red-900 bg-red-950/30' : 'text-gray-400 border-[#333] bg-[#222]'}`}>
                     {player.inventory.length} / {totalSlots}
                 </span>
             </div>
             
             <button 
               onClick={() => setShowBatchModal(true)}
               className="text-[10px] bg-red-950/20 border border-red-900/50 text-red-400 hover:bg-red-900 hover:text-white px-2 py-1 flex items-center gap-1 transition-all rounded-sm active:translate-y-0.5"
             >
                <Recycle size={12} /> 一键分解
             </button>
          </div>

          {/* 背包网格区域 (带内部滚动条) */}
          <div className="flex-1 overflow-y-auto p-2 bg-[#121212] custom-scrollbar">
              <div className="grid grid-cols-5 gap-2 auto-rows-min pb-2">
                  {Array.from({ length: totalSlots }).map((_, i) => {
                      const item = player.inventory[i];
                      // 渲染真实物品或空插槽
                      return (
                          <InventoryGridSlot 
                             key={item ? item.id : `empty-${i}`} 
                             item={item} 
                             onClick={setSelectedItem} 
                          />
                      );
                  })}
              </div>
          </div>
          
          {/* 底部装饰条 */}
          <div className="h-1 bg-[#1e1e1e] border-t border-[#333]"></div>
      </div>
    </div>
  );
};
