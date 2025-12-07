
import React from 'react';
import { Player, Attributes, AutoAllocation } from '../types';
import { RetroCard } from './ui/RetroCard';
import { Tooltip } from './ui/Tooltip';
import { Shield, Zap, Crosshair, Heart, User, Settings, Sword, Wind, Droplets, Activity } from 'lucide-react';
import { ASSET_CONFIG } from '../services/gameLogic';

interface CharacterPanelProps {
  player: Player;
  onAttributeUp: (attr: keyof Attributes) => void;
  onUpdateAutoAllocation?: (settings: AutoAllocation) => void;
}

// 动态图标辅助
const StatIcon = ({ type, fallbackIcon: Icon, color, size = 16 }: { type: keyof typeof ASSET_CONFIG.stats, fallbackIcon: any, color: string, size?: number }) => {
    const custom = ASSET_CONFIG.stats[type];
    if (custom) {
        return <img src={custom} className="object-contain" style={{ width: size, height: size }} alt={type} />;
    }
    return <Icon size={size} className={color} />;
};

// 详细数值项组件
const StatItem = ({ label, value, type, fallbackIcon, color, subLabel }: { label: string, value: string | number, type: keyof typeof ASSET_CONFIG.stats, fallbackIcon: any, color: string, subLabel?: string }) => (
    <div className="flex items-center gap-3 p-2 bg-[#1e1e1e] border border-[#333] hover:bg-[#2a2a2a] transition-colors group">
        <div className={`w-8 h-8 flex items-center justify-center rounded bg-black/40 border border-[#333] group-hover:border-opacity-50 ${color.replace('text-', 'border-')}`}>
            <StatIcon type={type} fallbackIcon={fallbackIcon} color={color} />
        </div>
        <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 font-bold uppercase">{label}</span>
            <div className="flex items-baseline gap-1">
               <span className={`text-sm font-mono font-bold text-gray-200`}>{value}</span>
               {subLabel && <span className="text-[9px] text-gray-600">{subLabel}</span>}
            </div>
        </div>
    </div>
);

export const CharacterPanel: React.FC<CharacterPanelProps> = ({ player, onAttributeUp, onUpdateAutoAllocation }) => {
  const attrMap: { key: keyof Attributes; label: string; iconKey: keyof typeof ASSET_CONFIG.stats; icon: any; desc: string; color: string; formula: string }[] = [
    { key: 'vit', label: '体质 (VIT)', iconKey: 'hp', icon: Heart, desc: '影响生命上限和生命恢复速度。', color: 'text-green-400', formula: '1点 = 10 HP + 0.1 回复/秒' },
    { key: 'str', label: '力量 (STR)', iconKey: 'atk', icon: Shield, desc: '增加物理攻击力和少量防御。', color: 'text-red-400', formula: '1点 = 2 ATK' },
    { key: 'agi', label: '敏捷 (AGI)', iconKey: 'speed', icon: Zap, desc: '提升攻击速度和闪避几率。', color: 'text-yellow-400', formula: '1点 = 0.2 速度' },
    { key: 'crt', label: '会心 (CRT)', iconKey: 'critRate', icon: Crosshair, desc: '增加暴击率和暴击伤害倍率。', color: 'text-purple-400', formula: '1点 = 0.05% 暴击率' },
  ];
  
  const attrNamesCN: Record<keyof Attributes, string> = {
      vit: '体质',
      str: '力量',
      agi: '敏捷',
      crt: '会心'
  };

  // 计算已分配权重总和
  const currentAllocationSum = (Object.values(player.autoAllocation.weights) as number[]).reduce((a, b) => a + b, 0);

  const handleWeightChange = (key: keyof Attributes, delta: number) => {
      if (!onUpdateAutoAllocation) return;
      
      const newWeights = { ...player.autoAllocation.weights };
      // 限制单个权重 0-5
      const newVal = Math.max(0, Math.min(5, newWeights[key] + delta));
      
      // 限制总权重 <= 5
      const otherSum = currentAllocationSum - newWeights[key];
      if (otherSum + newVal > 5) return;

      newWeights[key] = newVal;
      onUpdateAutoAllocation({
          ...player.autoAllocation,
          weights: newWeights
      });
  };

  const toggleAuto = () => {
      if (!onUpdateAutoAllocation) return;
      onUpdateAutoAllocation({
          ...player.autoAllocation,
          enabled: !player.autoAllocation.enabled
      });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {/* 头部信息 */}
      <div className="flex items-center justify-between bg-[#1e1e1e] p-4 border-b border-[#333]">
        <div>
          <h2 className="text-lg text-[#FFD700] font-bold">Lv.{player.level} 像素勇者</h2>
          <div className="text-xs text-gray-400 mt-1">
            经验值: {Math.floor(player.exp)} / {player.maxExp}
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-400 text-xs uppercase">剩余属性点</div>
          <div className="text-2xl font-bold text-white animate-pulse">{player.attributePoints}</div>
        </div>
      </div>

      {/* 角色形象与基础面板 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 角色立绘/形象 */}
        <div className="col-span-1 bg-[#121212] border-2 border-[#333] flex items-center justify-center relative overflow-hidden group min-h-[120px]">
            <div className="absolute inset-0 bg-[#0a0a0a] opacity-50" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>
            
            {/* 优先显示自定义大立绘 */}
            {ASSET_CONFIG.player.portrait ? (
                 <img src={ASSET_CONFIG.player.portrait} alt="Portrait" className="w-full h-full object-cover z-10" />
            ) : ASSET_CONFIG.player.idle ? (
                // 其次显示 idle 动画
                 <img src={ASSET_CONFIG.player.idle} alt="Idle" className="w-full h-full object-contain z-10 p-2 scale-150" />
            ) : (
                // 最后显示 CSS 像素人
                <div className="relative z-10 transform scale-150 group-hover:scale-125 transition-transform duration-300">
                    <div className="w-8 h-8 bg-pink-300 mx-auto rounded-sm mb-1"></div> {/* 头 */}
                    <div className="w-12 h-14 bg-blue-600 mx-auto rounded-sm flex justify-center"> {/* 身 */}
                        <div className="w-8 h-full bg-white/20"></div> {/* 铠甲纹路 */}
                    </div> 
                    <div className="flex justify-center gap-1 mt-1">
                        <div className="w-4 h-6 bg-[#222]"></div> {/* 腿 */}
                        <div className="w-4 h-6 bg-[#222]"></div> {/* 腿 */}
                    </div>
                    {/* 武器 */}
                    <div className="absolute top-8 -right-6 w-2 h-16 bg-gray-300 rotate-45 border border-gray-500 origin-bottom"></div>
                </div>
            )}
        </div>

        {/* 属性列表 */}
        <div className="col-span-2 space-y-2">
            {attrMap.map((attr) => (
              <div key={attr.key} className="flex items-center justify-between p-2 bg-[#1e1e1e] border border-[#333] hover:border-[#555] transition-colors">
                <Tooltip content={<div><p className="font-bold text-yellow-300 mb-1">{attr.desc}</p><p className="text-gray-400">{attr.formula}</p></div>}>
                  <div className="flex items-center gap-2 cursor-help">
                    <StatIcon type={attr.iconKey} fallbackIcon={attr.icon} color={attr.color} />
                    <div>
                      <div className={`text-xs font-bold ${attr.color}`}>{attr.label}</div>
                    </div>
                  </div>
                </Tooltip>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-white">{player.attributes[attr.key]}</span>
                  <button 
                    onClick={() => onAttributeUp(attr.key)}
                    disabled={player.attributePoints <= 0}
                    className={`w-6 h-6 flex items-center justify-center border ${
                      player.attributePoints > 0 
                        ? 'border-green-600 bg-green-900 text-green-300 hover:bg-green-800' 
                        : 'border-[#333] bg-[#2a2a2a] text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 自动加点设置 */}
      <RetroCard title="自动加点预设">
          <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center gap-2">
                      <Settings size={14} className="text-gray-400"/>
                      <span className="text-xs text-gray-300">升级时自动分配属性点</span>
                  </div>
                  <button 
                    onClick={toggleAuto}
                    className={`px-3 py-1 text-[10px] font-bold border ${player.autoAllocation.enabled ? 'border-green-500 bg-green-900 text-white' : 'border-[#333] bg-[#2a2a2a] text-gray-500'}`}
                  >
                      {player.autoAllocation.enabled ? '已开启' : '已关闭'}
                  </button>
              </div>
              
              <div className={`grid grid-cols-4 gap-2 p-2 bg-black/20 border border-[#333] ${!player.autoAllocation.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
                  {attrMap.map((attr) => (
                      <div key={attr.key} className="flex flex-col items-center">
                          <span className={`text-[10px] font-bold mb-1 ${attr.color}`}>{attrNamesCN[attr.key]}</span>
                          <div className="flex items-center gap-1">
                              <button onClick={() => handleWeightChange(attr.key, -1)} className="w-5 h-5 flex items-center justify-center bg-[#2a2a2a] border border-[#333] text-gray-400 hover:text-white">-</button>
                              <span className="text-xs w-4 text-center">{player.autoAllocation.weights[attr.key]}</span>
                              <button onClick={() => handleWeightChange(attr.key, 1)} className="w-5 h-5 flex items-center justify-center bg-[#2a2a2a] border border-[#333] text-gray-400 hover:text-white">+</button>
                          </div>
                      </div>
                  ))}
              </div>
              <div className="text-[10px] text-gray-500 text-right">已分配权重: <span className={currentAllocationSum > 5 ? 'text-red-500' : 'text-green-400'}>{currentAllocationSum}</span> / 5</div>
          </div>
      </RetroCard>

      <RetroCard title="详细数值">
           <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <StatItem 
                    label="生命值 (HP)" 
                    value={`${Math.floor(player.currentStats.hp)}/${Math.floor(player.currentStats.maxHp)}`} 
                    type="hp"
                    fallbackIcon={Heart} 
                    color="text-green-500" 
                />
                <StatItem 
                    label="生命回复 (Regen)" 
                    value={`+${player.currentStats.hpRegen.toFixed(1)}`} 
                    subLabel="/秒"
                    type="regen"
                    fallbackIcon={Activity} 
                    color="text-green-400" 
                />
                <StatItem 
                    label="攻击力 (ATK)" 
                    value={Math.floor(player.currentStats.atk)} 
                    type="atk"
                    fallbackIcon={Sword} 
                    color="text-red-500" 
                />
                <StatItem 
                    label="防御力 (DEF)" 
                    value={Math.floor(player.currentStats.def)} 
                    type="def"
                    fallbackIcon={Shield} 
                    color="text-blue-500" 
                />
                <StatItem 
                    label="速度 (SPD)" 
                    value={Math.floor(player.currentStats.speed)} 
                    type="speed"
                    fallbackIcon={Wind} 
                    color="text-yellow-400" 
                />
                <StatItem 
                    label="暴击率 (CRT)" 
                    value={`${(player.currentStats.critRate * 100).toFixed(1)}%`} 
                    type="critRate"
                    fallbackIcon={Crosshair} 
                    color="text-purple-400" 
                />
                <StatItem 
                    label="暴击伤害 (CDM)" 
                    value={`${(player.currentStats.critDmg * 100).toFixed(0)}%`} 
                    type="critDmg"
                    fallbackIcon={Crosshair} 
                    color="text-purple-300" 
                />
                <StatItem 
                    label="闪避率 (DGE)" 
                    value={`${(player.currentStats.dodge * 100).toFixed(1)}%`} 
                    type="dodge"
                    fallbackIcon={Zap} 
                    color="text-white" 
                />
                <StatItem 
                    label="吸血 (Lifesteal)" 
                    value={`${(player.currentStats.lifesteal * 100).toFixed(1)}%`} 
                    type="lifesteal"
                    fallbackIcon={Droplets} 
                    color="text-red-600" 
                />
           </div>
        </RetroCard>
    </div>
  );
};
