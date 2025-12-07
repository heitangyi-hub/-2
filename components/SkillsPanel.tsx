
import React, { useState } from 'react';
import { Player, SkillTreeType, Skill } from '../types';
import { Tooltip } from './ui/Tooltip';
import { 
    Sword, Shield, Zap, Heart, Snowflake, Activity, Clock, Flame, Target, Plus, Check, Star, Skull, Wind, Sparkles, Lock, 
    Axe, Tornado, Swords, Sun, Gavel, Timer, ArrowUpCircle
} from 'lucide-react';
import { ASSET_CONFIG } from '../services/gameLogic';

interface SkillsPanelProps {
  player: Player;
  onLearn: (skillId: string) => void;
  onEquip?: (skillId: string) => void;
  onUnequip?: (skillId: string) => void;
}

export const SkillsPanel: React.FC<SkillsPanelProps> = ({ player, onLearn, onEquip, onUnequip }) => {
  const [activeTab, setActiveTab] = useState<SkillTreeType>(SkillTreeType.COMBAT);

  const tabs = [
    { type: SkillTreeType.COMBAT, label: '狂战系', color: 'text-red-500', bg: 'bg-red-950', border: 'border-red-500', icon: Sword },
    { type: SkillTreeType.SUSTAIN, label: '神佑系', color: 'text-green-500', bg: 'bg-green-950', border: 'border-green-500', icon: Shield },
    { type: SkillTreeType.CONTROL, label: '秘术系', color: 'text-blue-500', bg: 'bg-blue-950', border: 'border-blue-500', icon: Zap },
  ];

  const getSkillIcon = (id: string, tree: SkillTreeType) => {
    // 检查自定义资源
    if (ASSET_CONFIG.skills[id]) {
        return { type: 'image', src: ASSET_CONFIG.skills[id] };
    }

    // 默认 Lucide
    let Icon = Sword;
    if (id === 'c_t1_1') Icon = Axe;       
    else if (id === 'c_t2_1') Icon = Tornado;   
    else if (id === 'c_t2_2') Icon = Swords;    
    else if (id === 'c_t3_1') Icon = Skull;     
    else if (id === 'c_t4_1') Icon = Target;    
    else if (id === 's_t1_1') Icon = Sun;       
    else if (id === 's_t2_1') Icon = Gavel;     
    else if (id === 's_t3_1') Icon = Shield;    
    else if (id === 's_t4_1') Icon = Sparkles;  
    else if (id === 'm_t1_1') Icon = Snowflake; 
    else if (id === 'm_t2_1') Icon = Zap;       
    else if (id === 'm_t2_3') Icon = Star;      
    else if (id === 'm_t3_1') Icon = Wind;      
    else if (id === 'm_t4_1') Icon = Timer;     
    else if (tree === SkillTreeType.COMBAT) Icon = Sword;
    else if (tree === SkillTreeType.SUSTAIN) Icon = Shield;
    else Icon = Zap;

    return { type: 'component', Component: Icon };
  };

  // Tier 视觉配置 (统一使用深色背景)
  const tierConfig: Record<number, { borderColor: string, bgColor: string, labelColor: string }> = {
      1: { borderColor: 'border-neutral-600', bgColor: 'bg-[#1e1e1e]', labelColor: 'text-neutral-400' },
      2: { borderColor: 'border-blue-800', bgColor: 'bg-[#1e1e1e]', labelColor: 'text-blue-400' },
      3: { borderColor: 'border-yellow-700', bgColor: 'bg-[#2a200a]', labelColor: 'text-yellow-500' },
      4: { borderColor: 'border-red-800', bgColor: 'bg-[#2a0a0a]', labelColor: 'text-red-500' },
  };

  // 获取已装备技能对象
  const equippedSkillsList = player.equippedSkills.map(id => player.skills.find(s => s.id === id)).filter(Boolean) as Skill[];
  
  // 当前选中的技能树
  const currentSkills = player.skills.filter(s => s.tree === activeTab);
  
  // 计算该系已投入的总技能点数
  const spentPointsInTree = currentSkills.reduce((sum, skill) => sum + skill.level, 0);

  // 解锁条件逻辑
  const checkPrerequisites = (tier: number): { unlocked: boolean, reason?: string } => {
      // T1: 总是解锁
      if (tier === 1) return { unlocked: true };
      
      // T2: 角色 Lv.10 + 本系投入 5 点
      if (tier === 2) {
          if (player.level < 10) return { unlocked: false, reason: '需角色等级 10' };
          if (spentPointsInTree < 5) return { unlocked: false, reason: '需本系投入 5 点' };
          return { unlocked: true };
      }
      // T3: 角色 Lv.25 + 本系投入 10 点
      if (tier === 3) {
           if (player.level < 25) return { unlocked: false, reason: '需角色等级 25' };
           if (spentPointsInTree < 10) return { unlocked: false, reason: '需本系投入 10 点' };
           return { unlocked: true };
      }
      // T4: 角色 Lv.50 + 本系投入 20 点
      if (tier === 4) {
           if (player.level < 50) return { unlocked: false, reason: '需角色等级 50' };
           if (spentPointsInTree < 20) return { unlocked: false, reason: '需本系投入 20 点' };
           return { unlocked: true };
      }
      return { unlocked: false, reason: '未知阶层' };
  };

  const skillsByTier = {
      1: currentSkills.filter(s => s.tier === 1),
      2: currentSkills.filter(s => s.tier === 2),
      3: currentSkills.filter(s => s.tier === 3),
      4: currentSkills.filter(s => s.tier === 4),
  };

  const activeTabConfig = tabs.find(t => t.type === activeTab) || tabs[0];

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* 头部状态 */}
      <div className="flex justify-between items-center bg-[#1e1e1e] p-2 border-b-2 border-[#333] shrink-0">
        <span className="text-white font-bold text-xs">可用技能点: <span className="text-yellow-400 text-lg animate-pulse">{player.skillPoints}</span></span>
        <span className="text-[10px] text-gray-400">已在该系投入: {spentPointsInTree} 点</span>
      </div>

      {/* 已装备技能栏 */}
      <div className="bg-[#1e1e1e] p-2 border border-[#333] shrink-0">
          <h3 className="text-[10px] text-gray-400 mb-2 uppercase text-center">已装备技能 ({player.equippedSkills.length}/9)</h3>
          <div className="grid grid-cols-9 gap-1 justify-center">
             {Array.from({ length: 9 }).map((_, idx) => {
                 const skill = equippedSkillsList[idx];
                 if (skill) {
                    const iconData = getSkillIcon(skill.id, skill.tree);
                    let borderColor = 'border-neutral-500';
                    if (skill.tree === SkillTreeType.COMBAT) borderColor = 'border-red-500';
                    if (skill.tree === SkillTreeType.SUSTAIN) borderColor = 'border-green-500';
                    if (skill.tree === SkillTreeType.CONTROL) borderColor = 'border-blue-500';

                    return (
                        <Tooltip key={idx} position="bottom" content={<div className="text-center min-w-[100px]"><span className="text-red-300 font-bold block mb-1">点击卸下</span>{skill.name}</div>}>
                            <div 
                                onClick={() => onUnequip && onUnequip(skill.id)}
                                className={`w-8 h-8 md:w-10 md:h-10 border-2 ${borderColor} bg-[#2a2a2a] flex flex-col items-center justify-center cursor-pointer hover:bg-red-900/30 transition-all relative group shadow-[0_0_8px_rgba(234,179,8,0.4)] overflow-hidden`}
                            >
                                {iconData.type === 'image' ? (
                                    <img 
                                        src={iconData.src} 
                                        alt={skill.name}
                                        className="w-full h-full object-contain p-0.5"
                                    />
                                ) : (
                                    // @ts-ignore
                                    <iconData.Component size={16} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                                )}
                            </div>
                        </Tooltip>
                    );
                 } else {
                     return (
                        <div key={idx} className="w-8 h-8 md:w-10 md:h-10 border-2 border-dashed border-[#444] bg-[#121212] flex items-center justify-center rounded">
                            <span className="text-gray-700 text-[8px]">空</span>
                        </div>
                     );
                 }
             })}
          </div>
      </div>

      {/* 技能树 Tabs */}
      <div className="flex gap-1 border-b border-[#333] shrink-0">
          {tabs.map(tab => (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1 transition-all ${activeTab === tab.type ? `${tab.bg} ${tab.color} border-t-2 ${tab.border}` : 'bg-[#1e1e1e] text-gray-500 hover:text-gray-300'}`}
              >
                  <tab.icon size={14} /> {tab.label}
              </button>
          ))}
      </div>

      {/* 技能树内容 */}
      <div className={`flex-1 overflow-y-auto p-2 space-y-4 bg-[#121212] ${activeTabConfig.border} border-t-0 border-x border-b`}>
         {[1, 2, 3, 4].map(tier => {
             const tierSkills = skillsByTier[tier as keyof typeof skillsByTier];
             if (!tierSkills || tierSkills.length === 0) return null;

             const { unlocked, reason } = checkPrerequisites(tier);
             const style = tierConfig[tier];

             return (
                 <div key={tier} className={`relative p-2 rounded border ${unlocked ? `${style.borderColor} ${style.bgColor}` : 'border-[#333] bg-[#111] opacity-60'}`}>
                     {/* Tier 标题与状态 */}
                     <div className="absolute -top-3 left-2 bg-[#1e1e1e] px-2 text-[10px] font-bold border border-[#444] flex items-center gap-2 rounded">
                        <span className={unlocked ? style.labelColor : 'text-gray-500'}>
                             第 {tier} 阶层
                        </span>
                        {!unlocked && (
                             <span className="text-red-400 flex items-center gap-1">
                                 <Lock size={8} /> {reason}
                             </span>
                        )}
                     </div>

                     <div className="grid grid-cols-1 gap-2 mt-2">
                         {tierSkills.map(skill => {
                             const canLearn = unlocked && player.skillPoints > 0 && skill.level < skill.maxLevel;
                             const isMaxed = skill.level >= skill.maxLevel;
                             const isEquipped = player.equippedSkills.includes(skill.id);
                             const iconData = getSkillIcon(skill.id, skill.tree);

                             // Tooltip 内容
                             const tooltipContent = (
                                 <div className="text-left space-y-2">
                                     <div className={`font-bold border-b pb-1 ${activeTabConfig.color}`}>{skill.name} <span className="text-white text-[10px]">Lv.{skill.level}/{skill.maxLevel}</span></div>
                                     <div className="text-gray-300">{skill.description}</div>
                                     
                                     {/* 技能数值面板 */}
                                     <div className="grid grid-cols-2 gap-1 text-[10px] bg-black/30 p-1 rounded">
                                         <div className="text-gray-400">类型: <span className="text-white">{skill.isPassive ? '被动' : '主动'}</span></div>
                                         <div className="text-gray-400">CD: <span className="text-white">{skill.isPassive ? '-' : `${skill.cooldown}秒`}</span></div>
                                         <div className="text-gray-400 col-span-2">
                                             效果: {skill.damageMult > 0 && <span className="text-red-300">{Math.round(skill.damageMult * 100)}% 伤害</span>}
                                             {skill.damageMult > 0 && skill.healMult && <span className="text-gray-500 mx-1">/</span>}
                                             {skill.healMult && <span className="text-green-300">{Math.round(skill.healMult * 100)}% 治疗</span>}
                                             {skill.isPassive && skill.effectValue && <span className="text-purple-300">效果: +{skill.id === 's_t2_2' ? skill.effectValue : Math.round(skill.effectValue * 100) + '%'}</span>}
                                         </div>
                                     </div>

                                     {!isMaxed && (
                                         <div className="text-green-400 text-[10px] pt-1 border-t border-gray-700">
                                             <div className="flex items-center gap-1 mb-1 font-bold"><ArrowUpCircle size={10}/> 下一级预览 (Lv.{skill.level + 1}):</div>
                                             <div className="pl-3 text-gray-400">
                                                 {skill.growth.damage > 0 && <div>伤害: <span className="text-green-300">+{Math.round(skill.growth.damage * 100)}%</span></div>}
                                                 {skill.growth.heal && skill.growth.heal > 0 && <div>治疗: <span className="text-green-300">+{Math.round(skill.growth.heal * 100)}%</span></div>}
                                                 {/* 修复：使用 growth.effect 显示被动提升 */}
                                                 {skill.growth.effect && skill.growth.effect > 0 && <div>效果: <span className="text-green-300">+{skill.id === 's_t2_2' ? skill.growth.effect : Math.round(skill.growth.effect * 100) + '%'}</span></div>}
                                                 {skill.growth.cooldown && skill.growth.cooldown < 0 && <div>冷却: <span className="text-green-300">{skill.growth.cooldown}秒</span></div>}
                                             </div>
                                         </div>
                                     )}
                                     {isMaxed && <div className="text-yellow-500 text-[10px] text-center font-bold">已达到最大等级</div>}
                                 </div>
                             );

                             return (
                                 <div key={skill.id} className={`p-2 flex items-center gap-3 transition-colors ${isMaxed ? 'bg-yellow-900/10' : ''}`}>
                                     {/* 图标 */}
                                     <Tooltip content={tooltipContent} position="left">
                                        <div className={`w-12 h-12 shrink-0 flex items-center justify-center border-2 rounded-lg cursor-help overflow-hidden ${isMaxed ? 'border-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.3)]' : `${style.borderColor} bg-[#1a1a1a]`}`}>
                                            {iconData.type === 'image' ? (
                                                <img 
                                                    src={iconData.src} 
                                                    alt={skill.name}
                                                    className="w-full h-full object-contain p-0.5"
                                                />
                                            ) : (
                                                // @ts-ignore
                                                <iconData.Component size={24} />
                                            )}
                                        </div>
                                     </Tooltip>

                                     {/* 信息简略 */}
                                     <div className="flex-1 min-w-0">
                                         <div className="flex items-center gap-2">
                                             <span className={`text-xs font-bold ${skill.level > 0 ? 'text-white' : 'text-gray-500'}`}>{skill.name}</span>
                                             {isMaxed && <span className="text-[8px] bg-yellow-600 text-black font-bold px-1 rounded">MAX</span>}
                                         </div>
                                         
                                         {/* 进度条 */}
                                         <div className="flex items-center gap-2 mt-2">
                                             <div className="flex-1 h-2 bg-black rounded-full overflow-hidden border border-[#333]">
                                                 <div 
                                                    className={`h-full transition-all ${isMaxed ? 'bg-yellow-500' : 'bg-blue-600'}`} 
                                                    style={{ width: `${(skill.level / skill.maxLevel) * 100}%` }}
                                                 ></div>
                                             </div>
                                             <div className="text-[9px] text-gray-500 min-w-[30px] text-right">
                                                 Lv.{skill.level}
                                             </div>
                                         </div>
                                     </div>

                                     {/* 按钮 */}
                                     <div className="flex flex-col gap-1 shrink-0">
                                         {!isMaxed && (
                                            <button
                                                onClick={() => onLearn(skill.id)}
                                                disabled={!canLearn}
                                                className={`w-8 h-8 flex items-center justify-center border rounded transition-all ${
                                                    canLearn 
                                                    ? 'border-green-500 bg-green-900 text-green-400 hover:bg-green-800 hover:scale-105 shadow-[0_2px_0_rgb(20,83,45)] active:translate-y-0.5 active:shadow-none'
                                                    : 'border-[#333] bg-[#222] text-gray-600 cursor-not-allowed'
                                                }`}
                                            >
                                                <Plus size={16} />
                                            </button>
                                         )}
                                         
                                         {skill.level > 0 && !skill.isPassive && (
                                             isEquipped ? (
                                                <button 
                                                    onClick={() => onUnequip && onUnequip(skill.id)}
                                                    className="w-8 h-8 flex items-center justify-center border border-red-500 bg-red-900/50 text-red-400 hover:bg-red-900 rounded"
                                                    title="卸下"
                                                >
                                                    <Check size={16} />
                                                </button>
                                             ) : (
                                                <button 
                                                    onClick={() => onEquip && onEquip(skill.id)}
                                                    className="w-8 h-8 flex items-center justify-center border border-blue-500 bg-blue-900/50 text-blue-400 hover:bg-blue-900 rounded"
                                                    title="装备"
                                                >
                                                    <Sword size={14} />
                                                </button>
                                             )
                                         )}
                                     </div>
                                 </div>
                             );
                         })}
                     </div>
                 </div>
             );
         })}
      </div>
    </div>
  );
};
