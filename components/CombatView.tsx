
import React, { useRef, useEffect, useState } from 'react';
import { Enemy, Player, FloatingText, VisualEffect, LogEntry, Equipment, ItemRarity, Skill, SkillTreeType } from '../types';
import { RetroCard } from './ui/RetroCard';
import { 
    Sword, Skull, Heart, Zap, ChevronLeft, ChevronRight, Backpack, Shield, User, MapPin, Terminal, Trash, 
    Axe, Tornado, Sun, Snowflake, Flame, Moon, Target, Swords, Gavel, Timer, Sparkles, Star, Wind, Repeat, PlayCircle
} from 'lucide-react';
import { getStageKillReq, getEnemyPosition, getZoneInfo, ASSET_CONFIG, getEnemyAsset } from '../services/gameLogic';
import { Tooltip } from './ui/Tooltip';

interface CombatViewProps {
  player: Player;
  enemy: Enemy | null; 
  enemies: Enemy[]; 
  logs: LogEntry[];
  stage: number;
  maxStage: number;
  killCount: number;
  autoAdvance: boolean; 
  floatingTexts: FloatingText[];
  visualEffects: VisualEffect[];
  skillCooldowns: { [key: string]: number };
  shakeScreen: boolean;
  onChangeStage: (stage: number) => void;
  onToggleAutoAdvance: () => void; 
  lastPlayerAttackTime: number; 
  lastPlayerHitTime: number; 
  onViewItem: (item: Equipment) => void;
}

// 像素风格血条组件
const PixelBar = ({ current, max, colorStart, colorEnd, width = "w-full", height = "h-3", label = "", showValue = true }: { current: number; max: number; colorStart: string; colorEnd: string; width?: string; height?: string; label?: string; showValue?: boolean }) => {
  const percent = Math.min(100, Math.max(0, (current / max) * 100));
  
  return (
    <div className={`${width} flex flex-col`}>
        {label && <div className="text-[10px] text-gray-400 mb-0.5 font-bold uppercase tracking-wider">{label}</div>}
        <div className={`relative ${height} bg-[#111] border border-[#333]`}>
            {/* 背景 */}
            <div className="absolute inset-0 bg-[#0a0a0a]"></div>
            
            {/* 进度条 */}
            <div 
                className="h-full relative transition-all duration-300 ease-out"
                style={{ width: `${percent}%`, background: `linear-gradient(to right, ${colorStart}, ${colorEnd})` }}
            >
                {/* 光泽 */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30"></div>
            </div>

            {/* 数值 */}
            {showValue && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                     <span className="text-[8px] font-mono font-bold text-white drop-shadow-[1px_1px_0_#000] leading-none">
                         {Math.floor(current)} / {Math.floor(max)}
                     </span>
                </div>
            )}
        </div>
    </div>
  );
};

// 技能图标映射
const getSkillIcon = (id: string) => {
    // 优先检查是否有自定义图标
    const customIcon = ASSET_CONFIG.skills[id];
    if (customIcon) return { type: 'image', src: customIcon };

    // 默认 Lucide 图标
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
    else if (id.includes('_c_')) Icon = Sword;
    else if (id.includes('_s_')) Icon = Heart;
    else if (id.includes('_m_')) Icon = Zap;
    
    return { type: 'component', Component: Icon };
};

interface SkillSlotProps {
  skill?: Skill;
  cooldownEnd: number;
}

const SkillSlot: React.FC<SkillSlotProps> = ({ skill, cooldownEnd }) => {
    if (!skill) return (
        <div className="flex flex-col items-center gap-1 opacity-50">
            <div className="w-12 h-12 border-2 border-dashed border-[#333] bg-[#0a0a0a] flex items-center justify-center rounded-md shrink-0">
                <span className="text-gray-700 text-[10px]">.</span>
            </div>
            <div className="h-3 w-8 bg-[#1e1e1e] rounded animate-pulse opacity-20"></div>
        </div>
    );

    const maxCd = skill.cooldown * 1000;
    const now = Date.now();
    const remaining = Math.max(0, cooldownEnd - now);
    const isCooling = remaining > 0;
    const isJustTriggered = isCooling && (remaining > maxCd - 300);

    const iconData = getSkillIcon(skill.id);
    let borderColor = 'border-gray-500';
    let shadowColor = 'shadow-gray-900/30';
    let glowColor = 'bg-gray-500';

    if (skill.tree === SkillTreeType.COMBAT) {
        borderColor = 'border-red-600';
        shadowColor = 'shadow-red-900/40';
        glowColor = 'bg-red-500';
    } else if (skill.tree === SkillTreeType.SUSTAIN) {
        borderColor = 'border-green-600';
        shadowColor = 'shadow-green-900/40';
        glowColor = 'bg-green-500';
    } else if (skill.tree === SkillTreeType.CONTROL) {
        borderColor = 'border-blue-500';
        shadowColor = 'shadow-blue-900/40';
        glowColor = 'bg-blue-500';
    }

    const tooltipContent = (
        <div className="text-left min-w-[140px]">
            <div className={`font-bold border-b border-gray-600 pb-1 mb-1 text-sm ${
                 skill.tree === SkillTreeType.COMBAT ? 'text-red-400' :
                 skill.tree === SkillTreeType.SUSTAIN ? 'text-green-400' : 'text-blue-400'
            }`}>
                {skill.name}
            </div>
            <div className="text-gray-300 text-xs mb-2 leading-relaxed">{skill.description}</div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 bg-black/40 p-1.5 rounded">
                <span>CD: <span className="text-white">{skill.cooldown}s</span></span>
                <span>Type: <span className="text-white">{skill.targetType === 'AOE' ? '群体' : '单体'}</span></span>
                <span>Lv.<span className="text-white">{skill.level}</span></span>
                <span>Tier.<span className="text-white">{skill.tier}</span></span>
            </div>
        </div>
    );

    return (
        <Tooltip content={tooltipContent} position="top">
            <div className="flex flex-col items-center gap-1.5 group cursor-help select-none">
                <div 
                    className={`
                        relative w-12 h-12 border-2 ${borderColor} bg-[#1a1a1a] 
                        flex items-center justify-center shrink-0 
                        transition-all duration-200 rounded-md shadow-lg ${shadowColor}
                        ${isJustTriggered ? 'animate-skill-flash scale-110 z-10 brightness-150' : ''}
                        ${!isCooling ? 'hover:scale-105 hover:brightness-110 hover:-translate-y-1' : ''}
                        overflow-hidden
                    `} 
                >
                    <div className={`absolute inset-0 opacity-10 ${glowColor} rounded-md`}></div>

                    {iconData.type === 'image' ? (
                        <img 
                            src={iconData.src} 
                            alt={skill.name}
                            className={`w-full h-full object-contain p-1 z-10 transition-all duration-300 ${isCooling ? 'grayscale opacity-50 scale-90' : 'scale-100'}`}
                        />
                    ) : (
                        // @ts-ignore
                        <iconData.Component 
                            size={24} 
                            className={`
                                transition-all duration-300 z-10
                                ${isCooling ? 'text-gray-500 grayscale opacity-50 scale-90' : 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] scale-100'}
                                ${skill.tree === SkillTreeType.COMBAT && !isCooling ? 'text-red-100' : ''}
                                ${skill.tree === SkillTreeType.SUSTAIN && !isCooling ? 'text-green-100' : ''}
                                ${skill.tree === SkillTreeType.CONTROL && !isCooling ? 'text-blue-100' : ''}
                            `} 
                        />
                    )}
                    
                    {isCooling && (
                        <>
                            <div 
                                className="absolute bottom-0 left-0 right-0 bg-black/50 z-0 pointer-events-none rounded-b-sm border-t border-white/20"
                                style={{ height: `${(remaining / maxCd) * 100}%`, transition: 'height 0.1s linear' }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <span className="text-[10px] font-black text-white drop-shadow-[0_0_4px_#000] font-mono tracking-tighter bg-black/60 rounded px-1 backdrop-blur-[1px]">
                                    {(remaining / 1000).toFixed(1)}
                                </span>
                            </div>
                        </>
                    )}

                    {!isCooling && (
                        <div className="absolute inset-0 shadow-[inset_0_0_15px_rgba(255,255,255,0.1)] rounded-md pointer-events-none group-hover:shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]"></div>
                    )}
                    
                    {skill.targetType === 'AOE' && (
                        <div className="absolute -top-2 -right-2 text-[8px] bg-[#B71C1C] text-white px-1 rounded-full shadow border border-[#E53935] font-bold z-20 scale-90">
                            AOE
                        </div>
                    )}
                </div>
                
                <div className={`
                    text-[9px] font-bold px-1.5 py-0.5 rounded
                    transition-colors duration-200 truncate max-w-[60px] text-center
                    ${isCooling ? 'text-gray-500 bg-transparent' : 'text-gray-300 bg-[#222] group-hover:text-white group-hover:bg-[#333] border border-transparent group-hover:border-[#444]'}
                `}>
                    {skill.name}
                </div>
            </div>
        </Tooltip>
    );
};

export const CombatView: React.FC<CombatViewProps> = ({ 
    player, enemies, logs, stage, maxStage, killCount, autoAdvance, floatingTexts, visualEffects, skillCooldowns, shakeScreen, onChangeStage, onToggleAutoAdvance, lastPlayerAttackTime, lastPlayerHitTime, onViewItem
}) => {
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [showTransition, setShowTransition] = useState(false);
  const prevZoneRef = useRef<number>(1);

  const zone = getZoneInfo(stage);
  const isBossStage = stage % 5 === 0;
  const killReq = getStageKillReq(stage);
  const isAttacking = Date.now() - lastPlayerAttackTime < 300;
  const isPlayerHit = Date.now() - lastPlayerHitTime < 300;

  useEffect(() => {
    if (logsContainerRef.current) {
        logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
      if (prevZoneRef.current !== zone.id) {
          setShowTransition(true);
          const timer = setTimeout(() => setShowTransition(false), 3000); // 3s 动画
          prevZoneRef.current = zone.id;
          return () => clearTimeout(timer);
      }
  }, [zone.id]);

  const renderLogEntry = (log: LogEntry) => {
      let colorClass = 'text-gray-400';
      switch(log.type) {
          case 'success': colorClass = 'text-[#4CAF50]'; break;
          case 'danger': colorClass = 'text-[#F44336]'; break;
          case 'warning': colorClass = 'text-[#FFD700]'; break;
          case 'level': colorClass = 'text-[#FFD700] font-bold'; break;
          case 'stage': colorClass = 'text-[#00E5FF] font-bold'; break;
          case 'drop': colorClass = 'text-white'; break;
      }

      return (
          <div key={log.id} className={`mb-1 border-b border-[#222] pb-0.5 last:border-0 hover:bg-white/5 flex items-start gap-2 ${colorClass}`}>
              <span className="text-gray-600 text-[10px] whitespace-nowrap font-mono mt-0.5">[{new Date(log.timestamp).toLocaleTimeString().split(' ')[0]}]</span>
              <span className="break-words leading-tight">
                  {log.text}
                  {log.type === 'drop' && log.item && (
                      <span 
                        className={`ml-1 font-bold cursor-pointer hover:underline ${
                            log.item.rarity === ItemRarity.MYTHIC ? 'text-[#F44336]' :
                            log.item.rarity === ItemRarity.LEGENDARY ? 'text-[#FFD700]' :
                            log.item.rarity === ItemRarity.RARE ? 'text-[#2196F3]' : 'text-[#4CAF50]'
                        }`}
                        onClick={() => onViewItem(log.item!)}
                      >
                          [{log.item.name}]
                      </span>
                  )}
              </span>
          </div>
      );
  };

  const renderVisualEffect = (effect: VisualEffect) => {
      // 0. 检查是否有自定义 GIF 特效配置
      const customVfx = ASSET_CONFIG.vfx[effect.type];
      if (customVfx) {
          return (
             <div key={effect.id} className="absolute z-50 pointer-events-none" 
                  style={{ 
                      left: `${effect.x}%`, 
                      top: `${effect.y}%`, 
                      transform: 'translate(-50%, -50%)',
                  }}>
                 {/* 默认 200px 宽，防止 GIF 过大遮挡 */}
                 <img src={customVfx} alt="vfx" className="w-[200px] h-[200px] object-contain mix-blend-screen" />
             </div>
          );
      }

      // 1. 碎星斩 (Star Shatter) [c_t1_1]
      if (effect.type === 'SKILL_SLASH_HEAVY') {
          return (
              <div key={effect.id} className="vfx-slash-heavy-container" style={{ position: 'absolute', left: `${effect.x}%`, top: `${effect.y}%` }}>
                  <div className="vfx-slash-heavy-glow"></div>
                  <div className="vfx-slash-heavy-blade"></div>
                  <div className="vfx-slash-heavy-core"></div>
              </div>
          );
      }
      
      // 2. 剑刃风暴 (Whirlwind) [c_t2_1]
      if (effect.type === 'SKILL_WHIRLWIND') {
          return (
              <div key={effect.id} className="absolute z-40 pointer-events-none" style={{ left: `${effect.x}%`, top: `${effect.y}%` }}>
                  <div className="vfx-whirlwind-ring" style={{ width: '120px', height: '120px', transform: 'translate(-50%, -50%)', animationDuration: '0.4s' }}></div>
                  <div className="vfx-whirlwind-ring" style={{ width: '180px', height: '180px', transform: 'translate(-50%, -50%)', animationDuration: '0.6s', animationDirection: 'reverse', borderColor: '#ffcc00' }}></div>
                  <div className="absolute w-[200px] h-[200px] bg-red-500/10 rounded-full blur-md -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
              </div>
          );
      }

      // 3. 崩山裂地 (Earth Shatter) [c_t4_1]
      if (effect.type === 'SKILL_EARTH_SHATTER') {
          return (
              <div key={effect.id} className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
                  <div className="vfx-earth-crack"></div>
                  <div className="vfx-earth-debris" style={{ left: '40%', bottom: '0', '--tx': '-50px', '--ty': '-100px' } as any}></div>
                  <div className="vfx-earth-debris" style={{ left: '60%', bottom: '0', '--tx': '50px', '--ty': '-120px' } as any}></div>
                  <div className="absolute inset-0 bg-red-500/20 mix-blend-overlay animate-pulse"></div>
              </div>
          );
      }

      // 4. 神迹·救赎 (Holy Nova) [s_t4_1]
      if (effect.type === 'SKILL_HOLY_NOVA') {
          return (
              <div key={effect.id} className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
                  <div className="vfx-holy-nova-ring"></div>
                  <div className="vfx-holy-ray"></div>
                  <div className="vfx-holy-ray" style={{ transform: 'rotate(45deg)' }}></div>
                  <div className="vfx-holy-ray" style={{ transform: 'rotate(90deg)' }}></div>
                  <div className="vfx-holy-ray" style={{ transform: 'rotate(135deg)' }}></div>
              </div>
          );
      }

      // 5. 虚空领域 (Void Zone) [m_t4_1]
      if (effect.type === 'SKILL_VOID_ZONE') {
          return (
              <div key={effect.id} className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center">
                   <div className="vfx-void-hole">
                       <div className="vfx-void-horizon"></div>
                   </div>
              </div>
          );
      }

      // 6. 九天落雷 (Lightning) [m_t2_1]
      if (effect.type === 'SKILL_LIGHTNING') {
          return (
              <div key={effect.id} className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
                  <div className="vfx-lightning-bolt" style={{ left: `${effect.x}%` }}></div>
                  <div className="absolute inset-0 bg-white/50 mix-blend-overlay animate-pulse" style={{ animationDuration: '0.1s' }}></div>
              </div>
          );
      }

      // 7. 通用受击 (Hit Impact)
      if (effect.type === 'HIT_IMPACT') {
          return (
              <div key={effect.id} className="absolute z-50 pointer-events-none" style={{ left: `${effect.x}%`, top: `${effect.y}%` }}>
                  <div className="absolute -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-red-500/30 rounded-full animate-hit-impact"></div>
                  <div className="absolute -translate-x-1/2 -translate-y-1/2 w-1 h-16 bg-white rotate-45 animate-hit-impact"></div>
                  <div className="absolute -translate-x-1/2 -translate-y-1/2 w-1 h-16 bg-white -rotate-45 animate-hit-impact" style={{ animationDelay: '0.05s' }}></div>
              </div>
          );
      }

      // 8. 极寒冰刺 (Ice Spike) [m_t1_1]
      if (effect.type === 'SKILL_ICE_SPIKE') {
          return (
              <div key={effect.id} className="absolute z-40 pointer-events-none" style={{ left: `${effect.x}%`, top: `${effect.y}%`, transform: 'translate(-50%, -50%)' }}>
                  <div className="w-16 h-32 bg-gradient-to-b from-white to-cyan-500" style={{ clipPath: 'polygon(50% 0, 100% 100%, 0 100%)', animation: 'floatUp 0.3s ease-out forwards' }}></div>
              </div>
          );
      }

      // 9. 秘法飞弹 (Arcane Volley) [m_t2_3]
      if (effect.type === 'SKILL_ARCANE_VOLLEY') {
          return (
             <div key={effect.id} className="absolute z-40 pointer-events-none" style={{ left: '50%', top: '50%' }}>
                  {[...Array(5)].map((_, i) => (
                      <div key={i} className="absolute w-3 h-3 bg-purple-400 rounded-full shadow-[0_0_5px_#a855f7]"
                           style={{ 
                               transform: `translate(${(Math.random()-0.5)*200}px, ${(Math.random()-0.5)*200}px)`,
                               transition: 'all 0.5s ease-out',
                               opacity: 0,
                               animation: `vfx-fade-out 0.5s ease-out forwards ${i*0.1}s`
                           }}></div>
                  ))}
             </div>
          );
      }

      // 10. 永恒暴风雪 (Blizzard) [m_t3_1]
      if (effect.type === 'SKILL_BLIZZARD') {
          return (
              <div key={effect.id} className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
                   {[...Array(20)].map((_, i) => (
                       <div key={i} className="absolute w-2 h-2 bg-white rounded-full opacity-80"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `-10px`,
                                animation: `vfx-debris-fly 1s linear forwards`,
                                '--tx': `${(Math.random()-0.5)*50}px`,
                                '--ty': '500px'
                            } as any}></div>
                   ))}
              </div>
          );
      }

      // 11. 史诗特效 - 陨星风暴 (Epic Meteor) [装备特效]
      if (effect.type === 'EPIC_METEOR') {
          return (
              <div key={effect.id} className="absolute inset-0 z-50 pointer-events-none">
                  <div className="absolute w-24 h-24 bg-purple-600 rounded-full blur-sm" style={{ 
                      left: '80%', top: '-20%',
                      animation: 'vfx-debris-fly 0.5s ease-in forwards',
                      '--tx': '-300px', '--ty': '600px',
                      boxShadow: '0 0 20px #a855f7'
                  } as any}></div>
              </div>
          );
      }

      // 12. 升级 (Level Up)
      if (effect.type === 'LEVEL_UP') {
         return (
            <div key={effect.id} className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                 <div className="absolute w-[500px] h-[500px] bg-gradient-to-t from-yellow-500/0 via-yellow-500/20 to-yellow-500/0 rounded-full mix-blend-screen animate-pulse"></div>
                 <div className="text-[#FFD700] font-bold text-4xl animate-bounce drop-shadow-[4px_4px_0_#000] border-y-4 border-[#FFD700] py-2 bg-black/70 px-8">LEVEL UP!</div>
            </div>
         );
     }
     
     // 13. 天界恩赐 (Heal) [s_t1_1]
     if (effect.type === 'SKILL_HEAL_LIGHT') {
         return (
             <div key={effect.id} className="absolute z-40 pointer-events-none" style={{ left: `${effect.x}%`, top: `${effect.y}%`, transform: 'translate(-50%, -50%)' }}>
                 <div className="absolute inset-0 w-20 h-20 bg-green-500/20 rounded-full animate-ping"></div>
                 <div className="text-green-400 text-2xl font-bold animate-float-up">+</div>
             </div>
         );
     }
     
     // 14. 默认普攻 (Normal Slash)
     if (effect.type === 'SKILL_SLASH_NORMAL') {
        return (
            <div key={effect.id} className="absolute z-40 pointer-events-none" style={{ left: `${effect.x}%`, top: `${effect.y}%` }}>
                <div className="w-24 h-24 border-t-4 border-r-4 border-white rounded-full" style={{ transform: 'translate(-50%, -50%) rotate(-45deg)', animation: 'vfx-slash-rotate 0.2s ease-out forwards' }}></div>
            </div>
        );
     }

      return null;
  };

  // 检查是否配置了战斗面板背景
  const panelStyle = ASSET_CONFIG.ui.panel_bg_combat ? {
      backgroundImage: `url(${ASSET_CONFIG.ui.panel_bg_combat})`,
      backgroundSize: '100% 100%',
      backgroundColor: 'transparent'
  } : {};

  return (
    <div className={`flex flex-col h-full relative ${shakeScreen ? 'animate-screen-shake' : ''}`} style={panelStyle}>
      
      {/* 顶部关卡控制栏 */}
      <div className="flex justify-between items-center bg-[#1e1e1e] px-4 py-2 border-b border-[#333] z-20 shadow-lg select-none shrink-0 relative">
          <div className="flex items-center gap-2">
              <button 
                onClick={() => onChangeStage(stage - 1)}
                disabled={stage <= 1}
                className={`w-8 h-8 flex items-center justify-center border border-[#444] bg-[#2a2a2a] rounded-sm ${stage <= 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#333] text-[#FFD700] active:scale-95 transition-transform'}`}
              >
                  <ChevronLeft size={16} />
              </button>
              
              <div className="text-center min-w-[120px] flex flex-col items-center">
                  <div className={`font-bold text-sm leading-none flex items-center gap-1 ${isBossStage ? 'text-[#F44336] animate-pulse' : 'text-[#FFD700]'}`}>
                      {isBossStage && <Skull size={12} />}
                      {isBossStage ? 'BOSS 战' : `关卡 ${stage}`}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin size={10} />
                      {zone.name}
                  </div>
              </div>

              <button 
                onClick={() => onChangeStage(stage + 1)}
                disabled={stage >= maxStage}
                className={`w-8 h-8 flex items-center justify-center border border-[#444] bg-[#2a2a2a] rounded-sm ${stage >= maxStage ? 'opacity-30 cursor-not-allowed' : 'hover:bg-[#333] text-[#FFD700] active:scale-95 transition-transform'}`}
              >
                  <ChevronRight size={16} />
              </button>
          </div>

          <div className="flex-1 flex justify-end gap-2 items-center ml-2">
             {/* 自动进阶开关 */}
             <Tooltip content={autoAdvance ? "自动挑战下一关" : "循环当前关卡 (适合刷装备)"} position="bottom">
                 <button 
                    onClick={onToggleAutoAdvance}
                    className={`p-1.5 rounded border flex items-center gap-1 transition-colors ${autoAdvance ? 'bg-green-900/30 border-green-700 text-green-400' : 'bg-blue-900/30 border-blue-700 text-blue-400'}`}
                 >
                     {autoAdvance ? <PlayCircle size={14} /> : <Repeat size={14} />}
                     <span className="text-[10px] font-bold hidden md:inline">{autoAdvance ? '自动' : '循环'}</span>
                 </button>
             </Tooltip>
             
             {/* 快速挑战最高层 (如果正在挂机) */}
             {!autoAdvance && stage < maxStage && (
                 <button 
                    onClick={() => {
                        onChangeStage(maxStage);
                        // Optional: Toggle auto advance back on?
                        // onToggleAutoAdvance(); 
                    }}
                    className="p-1.5 bg-red-900/50 border border-red-600 text-red-200 text-[10px] font-bold animate-pulse hover:bg-red-800"
                 >
                     挑战BOSS
                 </button>
             )}

             <div className="flex-1 max-w-[100px] hidden sm:block">
                <PixelBar 
                    current={killCount} 
                    max={killReq} 
                    colorStart={isBossStage ? "#ef4444" : "#2196F3"} 
                    colorEnd={isBossStage ? "#7f1d1d" : "#0d47a1"}
                    height="h-4"
                    label=""
                    showValue={false}
                />
             </div>
          </div>
        </div>

        {/* 3D 战斗战场 */}
        <div className="flex-1 relative overflow-hidden select-none bg-[#121212]" style={{ perspective: '800px' }}>
          
          <div className="absolute inset-0 pointer-events-none transition-all duration-1000 ease-in-out" 
               style={{ 
                   ...(zone.bgImage ? { backgroundImage: `url(${zone.bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : zone.bgStyle),
                   transform: 'scale(1.2)', 
                   transformOrigin: '50% 100%'
               }}>
          </div>
          {!zone.bgImage && (
             <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50" style={zone.overlayStyle}></div>
          )}
          <div className="absolute inset-0 pointer-events-none bg-radial-gradient-vignette"></div>

          {showTransition && (
              <div className="absolute inset-0 z-[100] bg-black flex flex-col items-center justify-center pointer-events-none animate-pop-in">
                   <div className="text-4xl text-[#FFD700] font-bold mb-4 drop-shadow-[0_0_10px_#000] border-y-4 border-[#FFD700] py-4 bg-black/50 px-8">
                       {zone.name}
                   </div>
                   <div className="text-gray-400 text-xs max-w-xs text-center">
                       {zone.description}
                   </div>
              </div>
          )}

          {/* === 视觉特效层 === */}
          {visualEffects.map(effect => renderVisualEffect(effect))}

          {/* 飘字层 */}
          {floatingTexts.map(ft => (
            <div 
                key={ft.id} 
                className={`absolute z-50 font-black pointer-events-none animate-text-float text-center whitespace-nowrap ${
                    ft.size === 'xl' ? 'text-4xl text-[#FFD700] drop-shadow-[4px_4px_0_#000] scale-125' : 
                    ft.size === 'lg' ? 'text-2xl text-[#F44336] drop-shadow-[2px_2px_0_#000]' : 
                    ft.size === 'md' ? 'text-lg text-white drop-shadow-[2px_2px_0_#000]' : 
                    'text-sm text-gray-300 drop-shadow-[1px_1px_0_#000]'
                }`}
                style={{ 
                    left: `${ft.x}%`, 
                    top: `${ft.y}%`, 
                    color: ft.color,
                    fontFamily: "'Press Start 2P', monospace",
                    textShadow: '2px 2px 0 #000'
                }}
            >
                {ft.text}
            </div>
          ))}

          {/* 战场内容容器 */}
          <div className="absolute inset-0 z-10">
              
              {/* 玩家区域 */}
              <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 flex flex-col items-center group">
                   <div className="relative w-40 flex flex-col items-center justify-end">
                        <div className="w-full bg-[#1e1e1e] p-1.5 border border-[#333] shadow-md relative mb-2">
                                <div className="flex justify-between items-end mb-1">
                                    <span className="text-[10px] text-[#2196F3] font-bold tracking-widest">勇者 Lv.{player.level}</span>
                                </div>
                                <div className="space-y-1.5">
                                    <PixelBar 
                                        current={player.currentStats.hp} 
                                        max={player.currentStats.maxHp} 
                                        colorStart="#F44336" 
                                        colorEnd="#B71C1C" 
                                    />
                                </div>
                        </div>

                        <div className="absolute bottom-0 w-32 h-8 bg-black/60 rounded-[100%] blur-sm transform scale-y-50 group-hover:bg-[#2196F3]/20 transition-colors"></div>
                        
                        {/* 玩家形象渲染: 支持自定义图片或默认像素CSS */}
                        {ASSET_CONFIG.player.idle ? (
                             <div className={`
                                w-32 h-32 relative mb-2 transition-transform duration-100
                                ${isAttacking ? 'animate-lunge' : ''} 
                                ${isPlayerHit ? 'animate-hit-flash animate-shake filter brightness-150' : ''}
                             `}>
                                 <img 
                                    src={isAttacking && ASSET_CONFIG.player.attack ? ASSET_CONFIG.player.attack : ASSET_CONFIG.player.idle} 
                                    alt="Player"
                                    className="w-full h-full object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)]"
                                 />
                             </div>
                        ) : (
                             <div className={`
                                w-20 h-20 bg-[#0d47a1] border-4 border-[#2196F3] shadow-[0_0_0_2px_#000] 
                                flex items-center justify-center relative mb-4 transition-transform duration-100 
                                ${isAttacking ? 'animate-lunge' : ''} 
                                ${isPlayerHit ? 'animate-hit-flash animate-shake bg-[#b71c1c] border-[#f44336]' : ''}
                            `}>
                                <Sword size={40} fill="currentColor" className="text-white drop-shadow-[2px_2px_0_#000]" />
                                <div className="absolute bottom-0 w-full h-2 bg-[#002171]"></div>
                            </div>
                        )}
                   </div>
              </div>

              {/* 敌人区域 */}
              {enemies.length === 0 ? (
                  <div className="absolute top-1/2 left-3/4 -translate-x-1/2 -translate-y-1/2 text-gray-500 text-sm animate-pulse flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-gray-700 border-t-gray-500 rounded-full animate-spin mb-2"></div>
                      <span>正在搜索敌人...</span>
                  </div>
              ) : (
                  enemies.map((enemy, idx) => {
                       const pos = getEnemyPosition(idx, enemies.length);
                       const isHit = visualEffects.some(e => 
                           (Math.abs(e.x - pos.x) < 5 && Math.abs(e.y - pos.y) < 5) && 
                           (e.type === 'HIT_IMPACT' || e.type.startsWith('SKILL_'))
                       );
                       const isEnemyAttacking = (Date.now() - enemy.lastAttackTime) < 500;
                       const customAsset = getEnemyAsset(enemy.name, enemy.isBoss, stage);

                       return (
                           <div 
                                key={enemy.id} 
                                className={`absolute flex flex-col items-center transition-all duration-100 ${isHit ? 'brightness-200 scale-105 translate-x-1' : ''}`}
                                style={{ 
                                    left: `${pos.x}%`, 
                                    top: `${pos.y}%`,
                                    transform: 'translate(-50%, -50%) scale(0.9)',
                                    zIndex: Math.floor(pos.y)
                                }}
                           >
                               {/* 敌人状态栏 */}
                               <div className="absolute -top-14 w-32 z-20 transition-opacity duration-300" style={{ opacity: enemy.stats.hp < enemy.maxHp ? 1 : 0.8 }}>
                                    <div className="bg-[#1e1e1e]/90 border border-[#333] p-1 shadow-lg relative">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <span className="text-[10px] text-red-200 font-bold truncate max-w-[80px]">{enemy.name}</span>
                                            <span className="text-[10px] text-gray-500">Lv.{enemy.level}</span>
                                        </div>
                                        <PixelBar 
                                            current={enemy.stats.hp} 
                                            max={enemy.maxHp} 
                                            colorStart={enemy.isBoss ? "#9C27B0" : "#F44336"} 
                                            colorEnd={enemy.isBoss ? "#4A148C" : "#B71C1C"}
                                            height="h-2"
                                            showValue={false}
                                        />
                                    </div>
                               </div>

                               {/* 敌人形象: 支持自定义图片或默认图标 */}
                               {customAsset ? (
                                   <div className={`relative flex items-center justify-center transition-transform ${
                                       enemy.isBoss 
                                         ? `w-40 h-40 z-10 ${isEnemyAttacking ? 'animate-boss-slam' : ''}`
                                         : `w-24 h-24 ${isEnemyAttacking ? 'animate-monster-lunge' : ''}`
                                       }`}>
                                        <img 
                                            src={customAsset} 
                                            alt={enemy.name}
                                            className="w-full h-full object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)]"
                                        />
                                        <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity"></div>
                                   </div>
                               ) : (
                                   <div className={`relative flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform ${
                                       enemy.isBoss 
                                         ? `w-32 h-32 bg-[#311b92] border-4 border-[#9C27B0] z-10 ${isEnemyAttacking ? 'animate-boss-slam' : ''}`
                                         : `w-20 h-20 bg-[#263238] border-4 border-[#546E7A] ${isEnemyAttacking ? 'animate-monster-lunge' : ''}`
                                       } shadow-[0_0_0_2px_#000]`}>
                                       {enemy.isBoss ? (
                                           <Skull size={64} fill="currentColor" className="text-[#F44336] drop-shadow-[4px_4px_0_#000]" />
                                       ) : (
                                           <Zap size={32} fill="currentColor" className="text-[#4CAF50] opacity-80 drop-shadow-[2px_2px_0_#000]" />
                                       )}
                                       <div className="absolute inset-0 bg-white/5 animate-pulse"></div>
                                   </div>
                               )}

                               <div className="absolute -bottom-4 w-20 h-8 bg-black/50 rounded-[100%] blur-sm transform scale-y-50 -z-10"></div>
                           </div>
                       );
                  })
              )}
          </div>
        </div>
        
        {/* 底部技能栏 */}
        <div className="bg-[#111] border-t-2 border-[#333] p-3 overflow-x-auto shadow-[0_-5px_15px_rgba(0,0,0,0.5)] shrink-0 z-20">
             <div className="flex justify-start md:justify-center items-center gap-3 min-w-max px-4">
                {Array.from({ length: 9 }).map((_, idx) => {
                     const skillId = player.equippedSkills[idx];
                     const skill = player.skills.find(s => s.id === skillId);
                     const cooldownEnd = skillId ? (skillCooldowns[skillId] || 0) : 0;
                     
                     return <SkillSlot key={idx} skill={skill} cooldownEnd={cooldownEnd} />;
                })}
             </div>
        </div>

        {/* 战斗日志 */}
        <div className="h-32 flex flex-col bg-[#0a0a0a] border-t-2 border-[#333] shrink-0 font-mono text-xs">
          <div className="flex items-center justify-between px-3 py-1 bg-[#1e1e1e] border-b border-[#333] select-none">
              <div className="flex items-center gap-2 text-gray-400">
                  <Terminal size={12} />
                  <span className="text-[10px] font-bold tracking-wider">BATTLE_LOG.exe</span>
              </div>
              <div className="flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-[#555]"></div>
                 <div className="w-2 h-2 rounded-full bg-[#555]"></div>
              </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar" ref={logsContainerRef}>
             {logs.length === 0 && <div className="text-gray-600 italic px-2">等待战斗数据...</div>}
             {logs.map((log) => renderLogEntry(log))}
          </div>
        </div>
    </div>
  );
};
