
import React from 'react';
import { Equipment, ItemType, ItemRarity, Player } from '../../types';
import { Sword, Shirt, Footprints, Gem, Trash2, Shield, Heart, Wind, Crosshair, Zap, Droplets } from 'lucide-react';

interface ItemDetailModalProps {
  item: Equipment;
  onClose: () => void;
  player: Player;
  onEquip?: (item: Equipment) => void;
  onSell?: (id: string) => void;
  onUnequip?: (slot: ItemType) => void;
  readonly?: boolean; // If true, hide actions
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, player, onEquip, onSell, onUnequip, readonly }) => {
  const getRarityColor = (rarity: ItemRarity) => {
    switch(rarity) {
      case ItemRarity.COMMON: return 'text-[#4CAF50] border-[#4CAF50] bg-[#1b5e20]/20';
      case ItemRarity.RARE: return 'text-[#2196F3] border-[#2196F3] bg-[#0d47a1]/20';
      case ItemRarity.LEGENDARY: return 'text-[#FFD700] border-[#FFD700] bg-[#ff6f00]/20';
      case ItemRarity.MYTHIC: return 'text-[#F44336] border-[#F44336] bg-[#b71c1c]/20 animate-pulse';
      default: return 'text-gray-400 border-gray-700 bg-slate-900';
    }
  };

  const StatRow = ({ label, baseValue, upgradeLevel, icon: Icon, color, isPercent = false }: { label: string, baseValue: number, upgradeLevel: number, icon: any, color: string, isPercent?: boolean }) => {
      // 强化加成 (每级 10% 基础值)
      const upgradeBonusMulti = upgradeLevel * 0.1;
      const boostValue = isPercent ? 0 : Math.floor(baseValue * upgradeBonusMulti);
      const totalValue = isPercent ? baseValue : baseValue + boostValue;

      const displayValue = isPercent ? `${(totalValue * 100).toFixed(1)}%` : `+${totalValue}`;

      return (
          <div className="flex items-center justify-between p-1 bg-black/20 rounded px-2">
              <div className="flex items-center gap-2">
                  <Icon size={12} className={color} />
                  <span className="text-gray-400 text-[10px] uppercase">{label}</span>
              </div>
              <div className="flex items-center gap-1">
                  <span className={`text-xs font-mono font-bold ${color}`}>{displayValue}</span>
                  {upgradeLevel > 0 && !isPercent && boostValue > 0 && (
                      <span className="text-[9px] text-gray-500 font-mono">
                          ({baseValue} <span className="text-[#FFD700]">+{boostValue}</span>)
                      </span>
                  )}
              </div>
          </div>
      );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-pop-in" onClick={onClose}>
      <div className={`w-full max-w-sm border-2 bg-[#1e1e1e] p-4 shadow-2xl relative ${getRarityColor(item.rarity).split(' ')[1]}`} onClick={e => e.stopPropagation()}>
        
        {/* 标题头 */}
        <div className="flex justify-between items-start border-b border-[#333] pb-2 mb-2">
            <div>
                <h3 className={`text-lg font-bold leading-tight ${getRarityColor(item.rarity).split(' ')[0]}`}>
                {item.name} {item.upgradeLevel > 0 && <span className="text-[#FFD700]">+{item.upgradeLevel}</span>}
                </h3>
                <div className="text-[10px] text-gray-400 mt-1 uppercase">
                  {item.rarity === ItemRarity.COMMON ? '普通' : item.rarity === ItemRarity.RARE ? '稀有' : item.rarity === ItemRarity.LEGENDARY ? '传说' : '神话'}
                  {' '}
                  {item.type === ItemType.WEAPON ? '武器' : item.type === ItemType.ARMOR ? '衣服' : item.type === ItemType.BOOTS ? '鞋子' : '首饰'}
                </div>
            </div>
            <div className="flex flex-col items-end">
                 <span className="text-[10px] text-gray-500">评分</span>
                 <span className="text-[#FFD700] font-mono text-lg">{item.score}</span>
            </div>
        </div>
        
        {/* 属性区 */}
        <div className="space-y-2 mb-4">
            <div className="grid grid-cols-1 gap-1.5">
                {item.baseStats.atk ? <StatRow label="攻击力" baseValue={item.baseStats.atk} upgradeLevel={item.upgradeLevel} icon={Sword} color="text-red-400" /> : null}
                {item.baseStats.def ? <StatRow label="防御力" baseValue={item.baseStats.def} upgradeLevel={item.upgradeLevel} icon={Shield} color="text-blue-400" /> : null}
                {item.baseStats.maxHp ? <StatRow label="生命值" baseValue={item.baseStats.maxHp} upgradeLevel={item.upgradeLevel} icon={Heart} color="text-green-400" /> : null}
                {item.baseStats.hpRegen ? <StatRow label="生命回复" baseValue={item.baseStats.hpRegen} upgradeLevel={item.upgradeLevel} icon={Heart} color="text-green-600" /> : null}
                {item.baseStats.speed ? <StatRow label="速度" baseValue={item.baseStats.speed} upgradeLevel={item.upgradeLevel} icon={Wind} color="text-yellow-400" /> : null}
                
                {/* 百分比属性通常不随强化提升基础值，或者提升很小，这里保持原样显示 */}
                {item.baseStats.critRate ? <StatRow label="暴击率" baseValue={item.baseStats.critRate} upgradeLevel={0} icon={Crosshair} color="text-purple-400" isPercent /> : null}
                {item.baseStats.critDmg ? <StatRow label="暴击伤害" baseValue={item.baseStats.critDmg} upgradeLevel={0} icon={Crosshair} color="text-purple-400" isPercent /> : null}
                {item.baseStats.dodge ? <StatRow label="闪避率" baseValue={item.baseStats.dodge} upgradeLevel={0} icon={Zap} color="text-white" isPercent /> : null}
                {item.baseStats.lifesteal ? <StatRow label="吸血" baseValue={item.baseStats.lifesteal} upgradeLevel={0} icon={Droplets} color="text-red-600" isPercent /> : null}
            </div>

            {item.affixes.length > 0 && (
                <>
                    <div className="h-px bg-[#333] my-2" />
                    <div className="space-y-1">
                        {item.affixes.map((affix, i) => (
                            <div key={i} className={`text-xs italic flex items-start gap-1 ${affix.includes('神话') ? 'text-red-400 font-bold' : 'text-[#2196F3]'}`}>
                                <span className="opacity-50">◇</span> {affix}
                            </div>
                        ))}
                    </div>
                </>
            )}
             <div className="text-[10px] text-gray-500 mt-2 text-right">需要等级 Lv.{item.levelReq}</div>
        </div>

        {/* 操作按钮区 */}
        {!readonly && onEquip && onSell && onUnequip && (
            <div className="grid grid-cols-2 gap-2 mt-4 pt-2 border-t border-[#333]">
              {player.inventory.find(i => i.id === item.id) ? (
                 <>
                  <button onClick={() => { onEquip(item); onClose(); }} className="bg-green-700 text-white p-3 text-xs font-bold border-b-2 border-green-500 hover:bg-green-600 active:translate-y-0.5 transition-all">
                    装备
                  </button>
                  <button onClick={() => { onSell(item.id); onClose(); }} className="bg-red-900 text-white p-3 text-xs font-bold border-b-2 border-red-500 hover:bg-red-700 flex items-center justify-center gap-1 active:translate-y-0.5 transition-all">
                    <Trash2 size={14}/> 分解
                  </button>
                 </>
              ) : (
                <button onClick={() => { onUnequip(item.type); onClose(); }} className="col-span-2 bg-[#2a2a2a] text-white p-3 text-xs font-bold border-b-2 border-[#555] hover:bg-[#333] active:translate-y-0.5 transition-all">
                  卸下
                </button>
              )}
            </div>
        )}
        
        {readonly && (
             <div className="mt-4 pt-2 border-t border-[#333] text-center">
                 <button onClick={onClose} className="bg-[#2a2a2a] text-white px-4 py-2 text-xs font-bold border-b-2 border-[#555] hover:bg-[#333]">关闭</button>
             </div>
        )}
      </div>
    </div>
  );
};
