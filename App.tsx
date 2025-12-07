
import React, { useReducer, useEffect, useState } from 'react';
import { GameState, GameAction, Player, ItemType, Equipment, ItemRarity, FloatingText, VisualEffect, SkillTreeType, Enemy, LogEntry, LogType, AutoAllocation } from './types';
import { calculateStats, getExpReq, generateEnemies, calculateDamage, generateItem, INITIAL_SKILLS, getStageKillReq, getEnemyPosition, UPGRADE_RATES, PURPLE_EFFECTS, recalculateSkillStats, ASSET_CONFIG } from './services/gameLogic';
import { saveGame, loadGame, hasSaveFile } from './services/saveSystem';
import { CombatView } from './components/CombatView';
import { CharacterPanel } from './components/CharacterPanel';
import { InventoryPanel } from './components/InventoryPanel';
import { TownPanel } from './components/TownPanel';
import { SkillsPanel } from './components/SkillsPanel';
import { MainMenu } from './components/MainMenu';
import { ItemDetailModal } from './components/ui/ItemDetailModal';
import { DeathModal } from './components/ui/DeathModal';
import { BestiaryModal } from './components/ui/BestiaryModal';
import { Sword, User, Package, Map, BookOpen, Coins, Sparkles, Save, Menu } from 'lucide-react';

// 获取初始状态的函数 (用于重置游戏)
const getInitialState = (): GameState => {
    const initialPlayer: Player = {
      level: 1,
      exp: 0,
      maxExp: 100,
      gold: 0,
      essence: 0,
      attributes: { vit: 5, str: 5, agi: 5, crt: 5 }, 
      attributePoints: 5,
      skillPoints: 1,
      currentStats: { hp: 0, maxHp: 0, hpRegen: 0, atk: 0, def: 0, speed: 0, critRate: 0, critDmg: 0, dodge: 0, lifesteal: 0 },
      equipment: {},
      inventory: [],
      skills: JSON.parse(JSON.stringify(INITIAL_SKILLS)), 
      equippedSkills: [], 
      autoAllocation: { enabled: false, weights: { vit: 1, str: 2, agi: 1, crt: 1 } }
    };
    
    // 初始化时计算一次属性 (包括被动技能，虽然初始等级为0)
    initialPlayer.currentStats = calculateStats(initialPlayer.attributes, initialPlayer.equipment, initialPlayer.level, initialPlayer.skills);
    initialPlayer.currentStats.hp = initialPlayer.currentStats.maxHp;

    return {
      player: initialPlayer,
      enemies: [], 
      autoBattle: true,
      stage: 1,
      maxStage: 1,
      killCount: 0,
      autoAdvance: true,
      battleLog: [{ id: 'init', type: 'info', text: '欢迎来到像素远征!', timestamp: Date.now() }],
      lastTick: Date.now(),
      lastPlayerAttackTime: 0,
      lastPlayerHitTime: 0,
      view: 'COMBAT',
      isPlayerDead: false,
      skillCooldowns: {},
      floatingTexts: [],
      visualEffects: [],
      shakeScreen: false,
      viewingItem: null
    };
};

// 辅助函数：生成飘字
const createFloatingText = (text: string, x: number, y: number, color: string, size: FloatingText['size'] = 'md'): FloatingText => ({
    id: Math.random().toString(36),
    text, x, y, color, size,
    createdAt: Date.now()
});

const createVisualEffect = (type: VisualEffect['type'], x: number = 50, y: number = 50): VisualEffect => ({
    id: Math.random().toString(36),
    type, x, y, createdAt: Date.now()
});

const createLog = (text: string, type: LogType = 'info', item?: Equipment): LogEntry => ({
    id: Math.random().toString(36),
    text, type, item, timestamp: Date.now()
});

// Helper component for navigation
const NavButton = ({ 
  view, 
  icon: Icon, 
  customIcon,
  label, 
  isActive, 
  onClick 
}: { 
  view: GameState['view']; 
  icon: any; 
  customIcon?: string;
  label: string; 
  isActive: boolean; 
  onClick: () => void; 
}) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex flex-col items-center justify-center py-3 transition-all border-t-2 select-none ${
       isActive 
       ? 'text-[#FFD700] bg-[#1e1e1e] border-[#FFD700]' 
       : 'text-gray-500 hover:bg-[#1a1a1a] border-transparent hover:text-gray-300'
    }`}
  >
    {customIcon ? (
        <img src={customIcon} className={`w-5 h-5 mb-1 object-contain ${!isActive ? 'grayscale opacity-50' : ''}`} alt={label} />
    ) : (
        <Icon size={20} className={`mb-1 ${isActive ? 'drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]' : ''}`} />
    )}
    <span className="text-xs font-bold tracking-wide">{label}</span>
  </button>
);

// Reducer
function gameReducer(state: GameState, action: GameAction | { type: 'LOAD_GAME', payload: GameState }): GameState {
  switch (action.type) {
    case 'LOAD_GAME': 
        return action.payload;

    case 'SWITCH_VIEW':
      return { ...state, view: action.payload };
    
    case 'TOGGLE_AUTO_BATTLE':
      return { ...state, autoBattle: !state.autoBattle };

    case 'TOGGLE_AUTO_ADVANCE':
      return { 
          ...state, 
          autoAdvance: !state.autoAdvance,
          battleLog: [...state.battleLog, createLog(!state.autoAdvance ? '自动进阶已开启' : '进入循环挂机模式', 'info')].slice(-50)
      };

    case 'VIEW_ITEM':
      return { ...state, viewingItem: action.payload };
    
    case 'UPDATE_AUTO_ALLOCATION': 
      return { ...state, player: { ...state.player, autoAllocation: action.payload } };

    case 'CHANGE_STAGE': {
        const newStage = Math.max(1, Math.min(state.maxStage, action.payload));
        if (newStage === state.stage) return state;
        
        return {
            ...state,
            stage: newStage,
            killCount: 0,
            enemies: [], // 清空敌人，等待重生
            battleLog: [...state.battleLog, createLog(`前往关卡 ${newStage}...`, 'stage')].slice(-50)
        };
    }
    
    case 'PLAYER_REVIVE': {
        const { stage, autoAdvance } = action.payload;
        return {
            ...state,
            isPlayerDead: false,
            autoBattle: true, // Auto resume battle
            stage: stage,
            killCount: 0,
            enemies: [],
            autoAdvance: autoAdvance,
            player: { 
                ...state.player, 
                currentStats: { ...state.player.currentStats, hp: state.player.currentStats.maxHp } 
            },
            battleLog: [...state.battleLog, createLog('玩家复活！战斗继续！', 'success')].slice(-50)
        };
    }

    case 'CLEANUP_VFX': {
        const now = Date.now();
        // 清理超过 1s 的飘字和特效 (部分长特效可能需要更久)
        return {
            ...state,
            floatingTexts: state.floatingTexts.filter(ft => now - ft.createdAt < 1000),
            visualEffects: state.visualEffects.filter(ve => now - ve.createdAt < 2000), 
            shakeScreen: false // 重置震动
        };
    }

    case 'GAME_LOOP_TICK': {
        // 主循环逻辑: 处理攻击、技能、重生、死亡结算
        const now = action.payload;
        let newState = { ...state, lastTick: now };

        // 0. 死亡检查 (Prevent loop if dead)
        if (newState.isPlayerDead) return newState;

        // 1. 生成敌人
        if (newState.enemies.length === 0 && newState.autoBattle) {
             const newEnemies = generateEnemies(newState.stage);
             newState.enemies = newEnemies;
             newState.battleLog = [...newState.battleLog, createLog(`遭遇了 ${newEnemies.length} 个敌人!`, 'warning')].slice(-50);
             return newState;
        }

        if (!newState.autoBattle || newState.enemies.length === 0) return newState;

        // 2. 玩家攻击逻辑
        const playerInterval = Math.max(500, 1500 - newState.player.currentStats.speed * 2);
        
        if (now >= newState.lastPlayerAttackTime + playerInterval) {
             const target = newState.enemies[0]; // 优先打第一个
             if (target) {
                 const { damage, isCrit, isDodge } = calculateDamage(newState.player.currentStats, target.stats);
                 const pos = getEnemyPosition(0, newState.enemies.length); // 必须传入当前总数来定位
                 
                 const newTexts = [...newState.floatingTexts];
                 const newEffects = [...newState.visualEffects];
                 let logAppend = '';

                 // --- 史诗特效判定 START ---
                 Object.values(newState.player.equipment).forEach(item => {
                     if (item && item.specialEffects) {
                         item.specialEffects.forEach(effectType => {
                             if (effectType === 'METEOR_STORM' && Math.random() < 0.05) {
                                 newEffects.push(createVisualEffect('EPIC_METEOR', 50, 50));
                                 newState.enemies.forEach((e, idx) => {
                                     const meteorDmg = Math.floor(newState.player.currentStats.atk * 5);
                                     e.stats.hp -= meteorDmg;
                                     const p = getEnemyPosition(idx, newState.enemies.length);
                                     newTexts.push(createFloatingText(`${meteorDmg}`, p.x, p.y, '#a855f7', 'xl'));
                                 });
                                 logAppend += ' [陨星风暴!]';
                             }
                             if (effectType === 'GALAXY_IMPACT' && isCrit && Math.random() < 0.1) {
                                 newEffects.push(createVisualEffect('EPIC_GALAXY', 50, 50));
                                 newState.enemies.forEach((e, idx) => {
                                     const galaxyDmg = Math.floor(newState.player.currentStats.atk * 3);
                                     e.stats.hp -= galaxyDmg; 
                                     const p = getEnemyPosition(idx, newState.enemies.length);
                                     newTexts.push(createFloatingText(`${galaxyDmg}`, p.x, p.y, '#ffffff', 'xl'));
                                 });
                                 logAppend += ' [银河爆裂!]';
                             }
                         });
                     }
                 });
                 // --- 史诗特效判定 END ---
                 
                 if (isDodge) {
                    newTexts.push(createFloatingText('闪避', pos.x, pos.y, '#9ca3af', 'sm'));
                 } else {
                    newTexts.push(createFloatingText(`${damage}`, pos.x, pos.y, isCrit ? '#f97316' : '#ffffff', isCrit ? 'xl' : 'md'));
                 }
                 
                 if (!isDodge) {
                     // 普攻特效
                     newEffects.push(createVisualEffect('SKILL_SLASH_NORMAL', pos.x, pos.y));
                 }

                 let newPlayerHp = newState.player.currentStats.hp;
                 // 吸血
                 if (!isDodge && damage > 0 && newState.player.currentStats.lifesteal > 0) {
                     const heal = Math.floor(damage * newState.player.currentStats.lifesteal);
                     if (heal > 0) {
                        newPlayerHp = Math.min(newState.player.currentStats.maxHp, newPlayerHp + heal);
                        newTexts.push(createFloatingText(`+${heal}`, 20, 75, '#ef4444', 'sm'));
                     }
                 }

                 // 更新敌人血量
                 let updatedEnemies = newState.enemies.map((e, idx) => {
                     if (idx === 0) return { ...e, stats: { ...e.stats, hp: Math.max(0, e.stats.hp - damage) } };
                     return { ...e, stats: { ...e.stats, hp: Math.max(0, e.stats.hp) } };
                 });
                 
                 // --- 死亡结算逻辑 START ---
                 const survivors: Enemy[] = [];
                 let killDelta = 0;
                 let goldDelta = 0;
                 let expDelta = 0;
                 let drops: Equipment[] = [];

                 updatedEnemies.forEach(e => {
                     if (e.stats.hp > 0) {
                         survivors.push(e);
                     } else {
                         // 敌人死亡
                         killDelta++;
                         const expGain = Math.floor(getExpReq(e.level) * 0.05 + 5);
                         const goldGain = e.level * 10 + Math.floor(Math.random() * 10);
                         expDelta += expGain;
                         goldDelta += goldGain;
                         
                         const pos = getEnemyPosition(0, newState.enemies.length); 

                         // 掉落
                         let dropChance = 0.15;
                         if (e.isBoss) dropChance = 1.0;
                         if (Math.random() < dropChance) {
                             if (newState.player.inventory.length < 30) {
                                 const rarityRoll = Math.random();
                                 let rarity = ItemRarity.COMMON;
                                 if (e.isBoss) {
                                     if (rarityRoll < 0.05) rarity = ItemRarity.MYTHIC;
                                     else if (rarityRoll < 0.25) rarity = ItemRarity.LEGENDARY;
                                     else rarity = ItemRarity.RARE;
                                 } else {
                                     if (rarityRoll < 0.01) rarity = ItemRarity.LEGENDARY;
                                     else if (rarityRoll < 0.1) rarity = ItemRarity.RARE;
                                 }
                                 const item = generateItem(e.level, rarity);
                                 drops.push(item);
                             } else {
                                 newTexts.push(createFloatingText('背包已满!', pos.x, pos.y - 30, '#ef4444', 'sm'));
                             }
                         }
                         
                         newTexts.push(createFloatingText(`+${expGain} XP`, pos.x, pos.y - 15, '#60a5fa', 'sm'));
                         newTexts.push(createFloatingText(`+${goldGain} G`, pos.x, pos.y - 20, '#fbbf24', 'sm'));
                     }
                 });

                 // 更新玩家资源
                 let newPlayer = { ...newState.player, currentStats: { ...newState.player.currentStats, hp: newPlayerHp } };
                 newPlayer.gold += goldDelta;
                 newPlayer.exp += expDelta;
                 if (drops.length > 0) newPlayer.inventory = [...newPlayer.inventory, ...drops];

                 // 升级判定
                 while (newPlayer.exp >= newPlayer.maxExp) {
                    newPlayer.exp -= newPlayer.maxExp;
                    newPlayer.level++;
                    newPlayer.attributePoints += 5;
                    newPlayer.skillPoints += 1;
                    
                    if (newPlayer.autoAllocation.enabled) {
                        const weights = newPlayer.autoAllocation.weights;
                        ['vit', 'str', 'agi', 'crt'].forEach(key => {
                             const pointsToAdd = weights[key as keyof typeof weights];
                             if (pointsToAdd > 0) {
                                  newPlayer.attributes[key as keyof typeof weights] += pointsToAdd;
                                  newPlayer.attributePoints -= pointsToAdd;
                             }
                        });
                    }

                    newPlayer.maxExp = getExpReq(newPlayer.level);
                    // 升级需重新计算属性（包括技能加成）
                    newPlayer.currentStats = calculateStats(newPlayer.attributes, newPlayer.equipment, newPlayer.level, newPlayer.skills);
                    newPlayer.currentStats.hp = newPlayer.currentStats.maxHp;
                    newEffects.push(createVisualEffect('LEVEL_UP'));
                    newTexts.push(createFloatingText('升级!', 50, 40, '#fbbf24', 'lg'));
                    newState.battleLog.push(createLog(`等级提升至 Lv.${newPlayer.level}!`, 'level'));
                 }
                 
                 newState.player = newPlayer;

                 // 日志与关卡进度
                 drops.forEach(item => {
                     newTexts.push(createFloatingText(`掉落: ${item.name}`, 50, 60, item.rarity === ItemRarity.MYTHIC ? '#ef4444' : '#fcd34d', 'md'));
                     newState.battleLog.push(createLog(`获得: ${item.name}`, 'drop', item));
                 });

                 if (killDelta > 0) {
                     const killReq = getStageKillReq(newState.stage);
                     let nextKillCount = newState.killCount + killDelta;
                     let nextStage = newState.stage;
                     let nextMaxStage = newState.maxStage;

                     if (newState.stage === newState.maxStage) {
                         if (nextKillCount >= killReq) {
                             if (newState.autoAdvance) {
                                nextStage++;
                                nextMaxStage = nextStage;
                                nextKillCount = 0;
                                newState.battleLog.push(createLog(`区域制霸! 晋升至第 ${nextStage} 层`, 'stage'));
                                survivors.length = 0; // 清空剩余敌人强制刷新
                             } else {
                                // Auto advance disabled (Looping Max Stage)
                                nextKillCount = 0; // Just reset count to keep looping
                                // Maybe add a log? "Loop complete"
                             }
                         }
                     } else {
                         // Farming lower stages
                         if (nextKillCount >= killReq) nextKillCount = 0;
                     }
                     newState.killCount = nextKillCount;
                     newState.stage = nextStage;
                     newState.maxStage = nextMaxStage;
                 }
                 // --- 死亡结算逻辑 END ---

                 newState = {
                     ...newState,
                     lastPlayerAttackTime: now,
                     enemies: survivors,
                     floatingTexts: newTexts,
                     visualEffects: newEffects,
                     shakeScreen: isCrit,
                     battleLog: isCrit ? [...newState.battleLog, createLog(`暴击! 造成 ${damage} 伤害!${logAppend}`, 'warning')].slice(-50) : (logAppend ? [...newState.battleLog, createLog(`触发特效${logAppend}`, 'success')] : newState.battleLog).slice(-50)
                 };
             }
        }

        // 3. 敌人攻击逻辑
        const updatedEnemies = newState.enemies.map(enemy => {
            if (now >= enemy.nextAttackTime) {
                let { damage, isCrit, isDodge } = calculateDamage(enemy.stats, newState.player.currentStats);
                
                // --- 被动技能处理 START ---
                // 1. 痛苦诅咒 (m_t2_2): 减伤
                const curseSkill = newState.player.skills.find(s => s.id === 'm_t2_2' && s.level > 0);
                if (curseSkill) {
                    const reduction = curseSkill.effectValue || 0;
                    damage = Math.floor(damage * (1 - reduction));
                }

                const newPlayerHp = Math.max(0, newState.player.currentStats.hp - damage);
                
                // 2. 荆棘光环 (s_t2_3): 反伤
                const thornsSkill = newState.player.skills.find(s => s.id === 's_t2_3' && s.level > 0);
                if (thornsSkill && damage > 0 && !isDodge) {
                    const reflectPct = thornsSkill.effectValue || 0;
                    const reflectDmg = Math.floor(damage * reflectPct);
                    if (reflectDmg > 0) {
                        enemy.stats.hp = Math.max(0, enemy.stats.hp - reflectDmg);
                        const pos = getEnemyPosition(newState.enemies.indexOf(enemy), newState.enemies.length);
                        newState.floatingTexts.push(createFloatingText(`反弹 ${reflectDmg}`, pos.x, pos.y, '#84cc16', 'sm'));
                    }
                }
                // --- 被动技能处理 END ---

                newState.floatingTexts.push(
                    isDodge 
                    ? createFloatingText('闪避', 25, 75, '#60a5fa', 'sm')
                    : createFloatingText(`-${damage}`, 25, 75, '#ef4444', 'md')
                );
                
                // 受击特效与反馈
                if (!isDodge) {
                    newState.visualEffects.push(createVisualEffect('HIT_IMPACT', 25, 75));
                    newState.lastPlayerHitTime = now; // 触发角色受击动画
                }

                newState.player.currentStats.hp = newPlayerHp;
                
                const spd = enemy.stats.speed;
                const interval = Math.max(800, 2000 - spd * 10);
                
                return { 
                    ...enemy, 
                    nextAttackTime: now + interval,
                    lastAttackTime: now 
                };
            }
            return enemy;
        });
        
        // 过滤掉因为反伤而死亡的敌人
        const aliveEnemies = updatedEnemies.filter(e => e.stats.hp > 0);
        // 如果有反伤致死，增加击杀数/掉落 (简化处理: 这里暂时不加掉落，仅移除)
        if (aliveEnemies.length < newState.enemies.length) {
             // 简单的击杀逻辑补偿，防止反伤打死怪不给经验
             // 实际上完整的击杀逻辑应该封装成函数
             const deadEnemies = updatedEnemies.filter(e => e.stats.hp <= 0);
             deadEnemies.forEach(e => {
                 newState.player.exp += Math.floor(getExpReq(e.level) * 0.05);
                 newState.player.gold += e.level * 5;
                 newState.killCount++;
                 newState.battleLog.push(createLog(`${e.name} 被反弹致死!`, 'success'));
             });
        }

        newState.enemies = aliveEnemies;

        // 4. 检查玩家死亡
        if (newState.player.currentStats.hp <= 0) {
             newState.autoBattle = false;
             newState.isPlayerDead = true; // Set dead state
             newState.enemies = []; // Clear enemies
             newState.battleLog.push(createLog('你不幸战败了！请选择复活方式...', 'danger'));
        }

        return newState;
    }

    case 'LEVEL_UP_ATTRIBUTE': {
      const attr = action.payload;
      if (state.player.attributePoints <= 0) return state;

      const newAttrs = { ...state.player.attributes, [attr]: state.player.attributes[attr] + 1 };
      // 属性变化，重算 Stats (传入 skills 以计算被动)
      const newStats = calculateStats(newAttrs, state.player.equipment, state.player.level, state.player.skills);
      const hpPercent = state.player.currentStats.hp / state.player.currentStats.maxHp;
      newStats.hp = Math.floor(newStats.maxHp * hpPercent);

      return {
        ...state,
        player: {
          ...state.player,
          attributes: newAttrs,
          attributePoints: state.player.attributePoints - 1,
          currentStats: newStats
        }
      };
    }

    case 'EQUIP_ITEM': {
      const item = action.payload;
      const slot = item.type;
      const oldItem = state.player.equipment[slot];
      
      const newEquipment = { ...state.player.equipment, [slot]: item };
      const newInventory = state.player.inventory.filter(i => i.id !== item.id);
      if (oldItem) newInventory.push(oldItem);

      // 装备变化，重算 Stats (传入 skills 以计算被动)
      const newStats = calculateStats(state.player.attributes, newEquipment, state.player.level, state.player.skills);
      newStats.hp = Math.min(newStats.maxHp, state.player.currentStats.hp);

      return {
        ...state,
        player: {
          ...state.player,
          equipment: newEquipment,
          inventory: newInventory,
          currentStats: newStats
        }
      };
    }

    case 'UNEQUIP_ITEM': {
      const slot = action.payload;
      const item = state.player.equipment[slot];
      if (!item) return state;

      if (state.player.inventory.length >= 30) {
        return { ...state, battleLog: [...state.battleLog, createLog('背包已满，无法卸下！', 'warning')].slice(-50) };
      }

      const newEquipment = { ...state.player.equipment };
      delete newEquipment[slot];
      
      const newInventory = [...state.player.inventory, item];
      // 装备变化，重算 Stats
      const newStats = calculateStats(state.player.attributes, newEquipment, state.player.level, state.player.skills);
      newStats.hp = Math.min(newStats.maxHp, state.player.currentStats.hp);

      return {
        ...state,
        player: { ...state.player, equipment: newEquipment, inventory: newInventory, currentStats: newStats }
      };
    }

    case 'SELL_ITEM': {
      const itemId = action.payload;
      const item = state.player.inventory.find(i => i.id === itemId);
      if (!item) return state;

      let baseEssence = 0;
      switch (item.rarity) {
        case ItemRarity.COMMON: baseEssence = 1; break;
        case ItemRarity.RARE: baseEssence = 5; break;
        case ItemRarity.LEGENDARY: baseEssence = 15; break;
        case ItemRarity.MYTHIC: baseEssence = 50; break;
        default: baseEssence = 1;
      }
      const upgradeBonus = item.upgradeLevel * 2;
      const affixBonus = item.affixes.length * 3;
      const essenceGain = baseEssence + upgradeBonus + affixBonus;
      const goldGain = item.score * 5;

      return {
        ...state,
        player: {
          ...state.player,
          gold: state.player.gold + goldGain,
          essence: state.player.essence + essenceGain,
          inventory: state.player.inventory.filter(i => i.id !== itemId)
        },
        battleLog: [...state.battleLog, createLog(`分解 [${item.name}] 获得 ${goldGain}G, ${essenceGain}精华`, 'info')].slice(-50)
      };
    }

    case 'BATCH_SELL_ITEMS': {
        const raritiesToSell = action.payload;
        const itemsToSell = state.player.inventory.filter(item => raritiesToSell.includes(item.rarity));
        
        if (itemsToSell.length === 0) return state;

        let totalGold = 0;
        let totalEssence = 0;

        itemsToSell.forEach(item => {
            let baseEssence = 0;
            switch (item.rarity) {
                case ItemRarity.COMMON: baseEssence = 1; break;
                case ItemRarity.RARE: baseEssence = 5; break;
                case ItemRarity.LEGENDARY: baseEssence = 15; break;
                case ItemRarity.MYTHIC: baseEssence = 50; break;
            }
            const upgradeBonus = item.upgradeLevel * 2;
            const affixBonus = item.affixes.length * 3;
            totalEssence += baseEssence + upgradeBonus + affixBonus;
            totalGold += item.score * 5;
        });

        return {
            ...state,
            player: {
                ...state.player,
                gold: state.player.gold + totalGold,
                essence: state.player.essence + totalEssence,
                inventory: state.player.inventory.filter(item => !itemsToSell.includes(item))
            },
            battleLog: [...state.battleLog, createLog(`批量分解 ${itemsToSell.length} 件装备，获得 ${totalGold}G, ${totalEssence}精华`, 'info')].slice(-50)
        };
    }

    case 'UPGRADE_ITEM': {
      const slot = action.payload;
      const item = state.player.equipment[slot];
      if (!item) return state;

      if (item.upgradeLevel >= 10) {
          return { ...state, battleLog: [...state.battleLog, createLog('装备已达最大强化等级！', 'warning')].slice(-50) };
      }

      const costGold = (item.upgradeLevel + 1) * 100;
      const costEssence = item.upgradeLevel + 1;

      if (state.player.gold < costGold || state.player.essence < costEssence) {
          return { ...state, battleLog: [...state.battleLog, createLog('资源不足！', 'danger')].slice(-50) };
      }

      // 扣除资源
      let newPlayer = {
          ...state.player,
          gold: state.player.gold - costGold,
          essence: state.player.essence - costEssence
      };

      // 判定成功率
      const successRate = UPGRADE_RATES[item.upgradeLevel] !== undefined ? UPGRADE_RATES[item.upgradeLevel] : 0;
      const roll = Math.random();

      if (roll > successRate) {
          // 失败
          return {
              ...state,
              player: newPlayer,
              battleLog: [...state.battleLog, createLog(`强化失败！[${item.name}] 保持 +${item.upgradeLevel}`, 'danger')].slice(-50)
          };
      }

      // 成功
      const nextLevel = item.upgradeLevel + 1;
      let newItem: Equipment = { ...item, upgradeLevel: nextLevel };
      
      let successMsg = `强化成功！[${item.name}] 提升至 +${nextLevel}`;

      if (nextLevel === 10) {
          const effectPool = PURPLE_EFFECTS;
          const randomEffect = effectPool[Math.floor(Math.random() * effectPool.length)];
          
          const currentEffects = newItem.specialEffects || [];
          const currentAffixes = newItem.affixes || [];
          
          newItem = { 
              ...newItem, 
              specialEffects: [...currentEffects, randomEffect.type],
              affixes: [...currentAffixes, randomEffect.name + ': ' + randomEffect.desc]
          };
          successMsg += ` 并觉醒了 [${randomEffect.name}]!`;
      }

      const newEquipment = { ...state.player.equipment, [slot]: newItem };
      // 装备属性提升，重算面板
      const newStats = calculateStats(state.player.attributes, newEquipment, state.player.level, state.player.skills);
      newStats.hp = state.player.currentStats.hp; // 保持当前血量

      return {
        ...state,
        player: {
          ...newPlayer,
          equipment: newEquipment,
          currentStats: newStats
        },
        battleLog: [...state.battleLog, createLog(successMsg, 'success')].slice(-50)
      };
    }

    case 'LEARN_SKILL': {
      const skillId = action.payload;
      const skillIndex = state.player.skills.findIndex(s => s.id === skillId);
      if (skillIndex === -1 || state.player.skillPoints <= 0) return state;

      const skill = state.player.skills[skillIndex];
      if (skill.level >= skill.maxLevel) return state;

      const newLevel = skill.level + 1;
      const updatedSkill = recalculateSkillStats(skill, newLevel);

      const newSkills = [...state.player.skills];
      newSkills[skillIndex] = updatedSkill;
      
      // 技能学习/升级后，如果是被动技能，需要重算 Stats
      const newStats = calculateStats(state.player.attributes, state.player.equipment, state.player.level, newSkills);
      // 保持当前HP比例或数值
      const currentHpPercent = state.player.currentStats.hp / state.player.currentStats.maxHp;
      newStats.hp = Math.floor(newStats.maxHp * currentHpPercent);

      return {
        ...state,
        player: {
          ...state.player,
          skills: newSkills,
          currentStats: newStats,
          skillPoints: state.player.skillPoints - 1
        }
      };
    }
    
    case 'EQUIP_SKILL': {
        const skillId = action.payload;
        if (state.player.equippedSkills.includes(skillId)) return state;
        
        if (state.player.equippedSkills.length >= 9) {
             return {
                ...state,
                player: { ...state.player, equippedSkills: [...state.player.equippedSkills.slice(1), skillId] }
            };
        }
        return {
            ...state,
            player: { ...state.player, equippedSkills: [...state.player.equippedSkills, skillId] }
        };
    }

    case 'UNEQUIP_SKILL': {
        const skillId = action.payload;
        return {
            ...state,
            player: { ...state.player, equippedSkills: state.player.equippedSkills.filter(id => id !== skillId) }
        };
    }

    case 'REGEN_HP': {
      if (!state.isPlayerDead && state.player.currentStats.hp < state.player.currentStats.maxHp && state.player.currentStats.hp > 0) {
        const newHp = Math.min(state.player.currentStats.maxHp, state.player.currentStats.hp + state.player.currentStats.hpRegen);
        return {
          ...state,
          player: { ...state.player, currentStats: { ...state.player.currentStats, hp: newHp } }
        };
      }
      return state;
    }
    
    case 'USE_SKILL': {
        if (state.enemies.length === 0 || state.isPlayerDead) return state;
        const skillId = action.payload;
        const skill = state.player.skills.find(s => s.id === skillId);
        if (!skill) return state;

        const newCooldowns = { ...state.skillCooldowns, [skillId]: Date.now() + skill.cooldown * 1000 };
        
        let logText = `释放 [${skill.name}]!`;
        let effects: VisualEffect[] = [...state.visualEffects];
        let texts: FloatingText[] = [...state.floatingTexts, createFloatingText(skill.name, 30, 70, '#fbbf24', 'lg')];
        let newPlayerStats = { ...state.player.currentStats };
        let shake = false;
        
        let newEnemies = state.enemies.map(e => ({ ...e, stats: { ...e.stats } }));

        // --- 技能特效映射逻辑 ---
        const mapSkillEffect = (s: typeof skill): VisualEffect['type'] => {
             if (s.id === 'c_t1_1') return 'SKILL_SLASH_HEAVY'; 
             if (s.id === 'c_t2_1') return 'SKILL_WHIRLWIND';   
             if (s.id === 'c_t2_2') return 'SKILL_BLOOD_IMPACT';
             if (s.id === 'c_t3_1') return 'SKILL_EXECUTE';     
             if (s.id === 'c_t4_1') return 'SKILL_EARTH_SHATTER'; 
             
             if (s.id === 's_t1_1') return 'SKILL_HEAL_LIGHT';  
             if (s.id === 's_t2_1') return 'SKILL_SMITE';       
             if (s.id === 's_t3_1') return 'SKILL_SHIELD_WALL'; 
             if (s.id === 's_t4_1') return 'SKILL_HOLY_NOVA';   
             
             if (s.id === 'm_t1_1') return 'SKILL_ICE_SPIKE';   
             if (s.id === 'm_t2_1') return 'SKILL_LIGHTNING';   
             if (s.id === 'm_t2_3') return 'SKILL_ARCANE_VOLLEY'; 
             if (s.id === 'm_t3_1') return 'SKILL_BLIZZARD';    
             if (s.id === 'm_t4_1') return 'SKILL_VOID_ZONE';   

             return 'SKILL_SLASH_NORMAL';
        };

        if (skill.tree === SkillTreeType.SUSTAIN && skill.healMult) {
             const healAmount = state.player.currentStats.atk * skill.healMult;
             newPlayerStats.hp = Math.min(newPlayerStats.maxHp, newPlayerStats.hp + healAmount);
             logText += ` 恢复 ${Math.floor(healAmount)} HP!`;
             
             const vfxType = mapSkillEffect(skill);
             if (vfxType === 'SKILL_SHIELD_WALL') {
                 effects.push(createVisualEffect('SKILL_SHIELD_WALL', 50, 50));
             } else if (vfxType === 'SKILL_HOLY_NOVA') {
                 effects.push(createVisualEffect('SKILL_HOLY_NOVA', 50, 50));
             } else {
                 effects.push(createVisualEffect('SKILL_HEAL_LIGHT', 20, 80));
             }

             texts.push(createFloatingText(`+${Math.floor(healAmount)}`, 20, 75, '#4ade80', 'lg'));
             
             if (skill.targetType === 'AOE' && skill.damageMult > 0) {
                 newEnemies.forEach((enemy, idx) => {
                     const { damage, isCrit } = calculateDamage(state.player.currentStats, enemy.stats, skill.damageMult);
                     enemy.stats.hp = Math.max(0, enemy.stats.hp - damage);
                     const pos = getEnemyPosition(idx, state.enemies.length);
                     texts.push(createFloatingText(`${damage}`, pos.x, pos.y, isCrit ? '#f97316' : '#ffffff', isCrit ? 'xl' : 'lg'));
                 });
             }

        } else {
             const isAOE = skill.targetType === 'AOE';
             const targets = isAOE ? newEnemies : [newEnemies[0]];
             const vfxType = mapSkillEffect(skill);

             if (isAOE) {
                 if (['SKILL_ICE_SPIKE', 'SKILL_SMITE', 'SKILL_BLOOD_IMPACT', 'SKILL_LIGHTNING'].includes(vfxType)) {
                      targets.forEach((_, idx) => {
                          const pos = getEnemyPosition(idx, state.enemies.length);
                          effects.push(createVisualEffect(vfxType, pos.x, pos.y));
                      });
                 } else {
                      effects.push(createVisualEffect(vfxType, 50, 50));
                 }
             } else {
                 const pos = getEnemyPosition(0, state.enemies.length);
                 effects.push(createVisualEffect(vfxType, pos.x, pos.y));
             }

             targets.forEach((enemy, idx) => {
                 const { damage, isCrit } = calculateDamage(state.player.currentStats, enemy.stats, skill.damageMult);
                 
                 if (state.player.currentStats.lifesteal > 0) {
                    const heal = damage * state.player.currentStats.lifesteal * 0.5;
                    if (heal >= 1) newPlayerStats.hp = Math.min(newPlayerStats.maxHp, newPlayerStats.hp + heal);
                 }

                 enemy.stats.hp = Math.max(0, enemy.stats.hp - damage);
                 const pos = getEnemyPosition(idx, state.enemies.length);
                 texts.push(createFloatingText(`${damage}`, pos.x, pos.y, isCrit ? '#f97316' : '#ffffff', isCrit ? 'xl' : 'lg'));
                 if (isCrit) shake = true;
             });

             if (isAOE) logText += ` 对全体造成伤害!`;
             else logText += ` 对 ${targets[0].name} 造成伤害!`;
        }

        let killCountDelta = 0;
        let finalEnemies: Enemy[] = [];
        let earnedExp = 0;
        let earnedGold = 0;
        
        newEnemies.forEach(e => {
            if (e.stats.hp > 0) finalEnemies.push(e);
            else {
                killCountDelta++;
                earnedExp += e.level * 2;
                earnedGold += e.level * 5;
            }
        });

        let nextKillCount = state.killCount + killCountDelta;
        let nextStage = state.stage;
        let nextMaxStage = state.maxStage;
        const killReq = getStageKillReq(state.stage);

        const newLog = createLog(logText, 'info');
        let newLogs = [...state.battleLog, newLog];

        if (state.stage === state.maxStage && nextKillCount >= killReq) {
            if (state.autoAdvance) {
                nextStage++;
                nextMaxStage = nextStage;
                nextKillCount = 0;
                finalEnemies = []; // 强制刷新
                newLogs.push(createLog(`区域制霸! 晋升!`, 'stage'));
            } else {
                nextKillCount = 0; // Loop logic
            }
        } else if (nextKillCount >= killReq) {
            nextKillCount = 0;
        }

        return {
            ...state,
            skillCooldowns: newCooldowns,
            enemies: finalEnemies, 
            player: { ...state.player, currentStats: newPlayerStats, exp: state.player.exp + earnedExp, gold: state.player.gold + earnedGold },
            battleLog: newLogs.slice(-50),
            visualEffects: effects,
            floatingTexts: texts,
            shakeScreen: shake,
            killCount: nextKillCount,
            stage: nextStage,
            maxStage: nextMaxStage,
            lastPlayerAttackTime: Date.now() 
        };
    }

    case 'SPAWN_ENEMIES': {
      return {
        ...state,
        enemies: generateEnemies(state.stage),
        battleLog: [...state.battleLog, createLog(`遭遇了一群敌人!`, 'warning')].slice(-50)
      };
    }

    default:
      return state;
  }
}

const App: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, getInitialState());
  const [isInMenu, setIsInMenu] = useState(true);
  const [showBestiary, setShowBestiary] = useState(false);
  const [saveFileExists, setSaveFileExists] = useState(false);

  // 初始化检查存档
  useEffect(() => {
      setSaveFileExists(hasSaveFile());
  }, [isInMenu]);

  // 自动保存 (每30秒)
  useEffect(() => {
      if (isInMenu) return;
      const saveInterval = setInterval(() => {
          saveGame(state);
      }, 30000);
      return () => clearInterval(saveInterval);
  }, [state, isInMenu]);

  useEffect(() => {
      const cleanupTimer = setInterval(() => {
          dispatch({ type: 'CLEANUP_VFX' });
      }, 500);
      return () => clearInterval(cleanupTimer);
  }, []);

  useEffect(() => {
    const regenTimer = setInterval(() => {
       if (!isInMenu) dispatch({ type: 'REGEN_HP' });
    }, 1000);
    return () => clearInterval(regenTimer);
  }, [isInMenu]);

  useEffect(() => {
    if (!state.autoBattle || state.isPlayerDead || isInMenu) return;
    const loopTimer = setInterval(() => {
        dispatch({ type: 'GAME_LOOP_TICK', payload: Date.now() });
    }, 50);

    return () => clearInterval(loopTimer);
  }, [state.autoBattle, state.isPlayerDead, isInMenu]);

  useEffect(() => {
     if (!state.autoBattle || state.enemies.length === 0 || state.isPlayerDead || isInMenu) return;
     const checkSkills = setInterval(() => {
         const now = Date.now();
         for (const skillId of state.player.equippedSkills) {
             const cd = state.skillCooldowns[skillId] || 0;
             if (now >= cd) {
                 dispatch({ type: 'USE_SKILL', payload: skillId });
                 break; 
             }
         }
     }, 200);

     return () => clearInterval(checkSkills);
  }, [state.autoBattle, state.enemies.length, state.skillCooldowns, state.player.equippedSkills, state.isPlayerDead, isInMenu]);

  const handleStartGame = () => {
      dispatch({ type: 'LOAD_GAME', payload: getInitialState() });
      setIsInMenu(false);
  };

  const handleLoadGame = () => {
      const savedState = loadGame(getInitialState());
      if (savedState) {
          dispatch({ type: 'LOAD_GAME', payload: savedState });
          setIsInMenu(false);
      } else {
          alert('存档读取失败');
      }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#121212] p-0 md:p-4 font-mono select-none">
      
      {/* 主界面 */}
      {isInMenu && (
          <MainMenu 
             onStartGame={handleStartGame} 
             onLoadGame={handleLoadGame} 
             hasSave={saveFileExists}
             onOpenBestiary={() => setShowBestiary(true)}
          />
      )}

      {/* 图鉴弹窗 */}
      {showBestiary && <BestiaryModal onClose={() => setShowBestiary(false)} />}

      {!isInMenu && (
      <div className="w-full max-w-md h-[100vh] md:h-[800px] flex flex-col bg-[#000] border-x-0 md:border-4 border-[#333] shadow-2xl relative overflow-hidden animate-pop-in">
        
        {/* 全局 UI 边框 (如果配置) */}
        {ASSET_CONFIG.ui.frame && (
            <div className="absolute inset-0 pointer-events-none z-[200] overflow-hidden">
                <img src={ASSET_CONFIG.ui.frame} className="w-full h-full object-fill" alt="frame" />
            </div>
        )}

        {/* 返回菜单按钮 */}
        <div className="absolute top-2 right-2 z-[100]">
            <button 
                onClick={() => { saveGame(state); setIsInMenu(true); }}
                className="p-2 bg-black/50 text-gray-500 hover:text-white rounded border border-transparent hover:border-gray-500"
                title="保存并退出"
            >
                <Menu size={16} />
            </button>
        </div>

        {state.isPlayerDead && (
            <DeathModal 
                maxStage={state.maxStage}
                currentStage={state.stage}
                onRevive={(stage, loop) => dispatch({ type: 'PLAYER_REVIVE', payload: { stage, autoAdvance: loop } })}
            />
        )}

        <div className="bg-[#1a1a1a] h-auto min-h-[64px] py-2 px-4 flex justify-between items-center border-b-2 border-[#333] z-20 shrink-0 shadow-md relative">
          <div className="flex gap-4 items-center">
             <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-[#FFD700]/30">
                <div className="bg-[#FFD700]/10 p-1.5 rounded-full border border-[#FFD700]/30">
                    {ASSET_CONFIG.ui.gold ? (
                        <img src={ASSET_CONFIG.ui.gold} className="w-4 h-4 object-contain" alt="Gold" />
                    ) : (
                        <Coins size={16} className="text-[#FFD700]" />
                    )}
                </div>
                <div className="flex flex-col">
                     <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none">金币</span>
                     <span className="text-[#FFD700] font-bold text-sm leading-none mt-0.5">{state.player.gold.toLocaleString()}</span>
                </div>
             </div>
             <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded border border-purple-900/50">
                <div className="bg-purple-500/10 p-1.5 rounded-full border border-purple-500/30">
                    {ASSET_CONFIG.ui.essence ? (
                        <img src={ASSET_CONFIG.ui.essence} className="w-4 h-4 object-contain" alt="Essence" />
                    ) : (
                        <Sparkles size={16} className="text-purple-400" />
                    )}
                </div>
                <div className="flex flex-col">
                     <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider leading-none">精华</span>
                     <span className="text-purple-300 font-bold text-sm leading-none mt-0.5">{state.player.essence.toLocaleString()}</span>
                </div>
             </div>
          </div>
          <div className="mr-8"> 
            <button 
              onClick={() => dispatch({ type: 'TOGGLE_AUTO_BATTLE' })}
              className={`relative group flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold border-2 transition-all active:translate-y-0.5 shadow-md ${
                  state.autoBattle 
                  ? 'border-[#4CAF50] bg-[#1b5e20]/80 text-[#4CAF50] hover:bg-[#1b5e20]' 
                  : 'border-[#F44336] bg-[#b71c1c]/80 text-[#F44336] hover:bg-[#b71c1c]'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${state.autoBattle ? 'bg-[#4CAF50] animate-pulse' : 'bg-[#F44336]'}`}></div>
              {state.autoBattle ? '自动战斗中' : '已暂停'}
            </button>
          </div>
        </div>

        {state.viewingItem && (
            <ItemDetailModal 
                item={state.viewingItem}
                player={state.player}
                readonly={true}
                onClose={() => dispatch({ type: 'VIEW_ITEM', payload: null })}
            />
        )}

        <div className="flex-1 overflow-hidden bg-[#1e1e1e] relative flex flex-col">
          <div className={`absolute inset-0 transition-opacity duration-300 flex flex-col ${state.view === 'COMBAT' ? 'opacity-100 z-10' : 'opacity-20 pointer-events-none'}`}>
             <CombatView 
                player={state.player} 
                enemies={state.enemies} 
                enemy={null} 
                logs={state.battleLog}
                stage={state.stage}
                maxStage={state.maxStage}
                killCount={state.killCount}
                autoAdvance={state.autoAdvance}
                floatingTexts={state.floatingTexts}
                visualEffects={state.visualEffects}
                skillCooldowns={state.skillCooldowns}
                shakeScreen={state.shakeScreen}
                onChangeStage={(newStage) => dispatch({ type: 'CHANGE_STAGE', payload: newStage })}
                onToggleAutoAdvance={() => dispatch({ type: 'TOGGLE_AUTO_ADVANCE' })}
                lastPlayerAttackTime={state.lastPlayerAttackTime}
                lastPlayerHitTime={state.lastPlayerHitTime}
                onViewItem={(item) => dispatch({ type: 'VIEW_ITEM', payload: item })}
              />
          </div>
          
          {state.view !== 'COMBAT' && (
            <div className="absolute inset-0 z-20 bg-[#121212]/95 backdrop-blur-sm p-4 overflow-y-auto animate-pop-in">
               {state.view === 'TOWN' && (
                 <div className="h-full flex flex-col" style={ASSET_CONFIG.ui.panel_bg_town ? { backgroundImage: `url(${ASSET_CONFIG.ui.panel_bg_town})`, backgroundSize: 'cover' } : {}}>
                    <TownPanel 
                        player={state.player} 
                        onUpgrade={(slot) => dispatch({ type: 'UPGRADE_ITEM', payload: slot })}
                    />
                 </div>
               )}
               {state.view === 'INVENTORY' && (
                 <div className="h-full flex flex-col" style={ASSET_CONFIG.ui.panel_bg_inventory ? { backgroundImage: `url(${ASSET_CONFIG.ui.panel_bg_inventory})`, backgroundSize: 'cover' } : {}}>
                    <div className="flex justify-between items-center mb-3 pb-2 border-b border-[#333]">
                      <h2 className="text-[#FFD700] font-bold text-base flex items-center gap-2"><User size={18}/> 角色 & 背包</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                       <CharacterPanel 
                         player={state.player} 
                         onAttributeUp={(attr) => dispatch({ type: 'LEVEL_UP_ATTRIBUTE', payload: attr })} 
                         onUpdateAutoAllocation={(settings) => dispatch({ type: 'UPDATE_AUTO_ALLOCATION', payload: settings })}
                       />
                       <InventoryPanel 
                         player={state.player}
                         onEquip={(item) => dispatch({ type: 'EQUIP_ITEM', payload: item })}
                         onSell={(id) => dispatch({ type: 'SELL_ITEM', payload: id })}
                         onUnequip={(slot) => dispatch({ type: 'UNEQUIP_ITEM', payload: slot })}
                         onBatchSell={(rarities) => dispatch({ type: 'BATCH_SELL_ITEMS', payload: rarities })}
                       />
                    </div>
                 </div>
               )}
               {state.view === 'SKILLS' && (
                  <div className="h-full flex flex-col" style={ASSET_CONFIG.ui.panel_bg_skills ? { backgroundImage: `url(${ASSET_CONFIG.ui.panel_bg_skills})`, backgroundSize: 'cover' } : {}}>
                     <SkillsPanel 
                        player={state.player}
                        onLearn={(id) => dispatch({ type: 'LEARN_SKILL', payload: id })}
                        onEquip={(id) => dispatch({ type: 'EQUIP_SKILL', payload: id })}
                        onUnequip={(id) => dispatch({ type: 'UNEQUIP_SKILL', payload: id })}
                     />
                  </div>
               )}
            </div>
          )}
        </div>

        <div className="flex bg-[#1a1a1a] pb-safe z-30 border-t-2 border-[#333]">
          <NavButton view="COMBAT" icon={Sword} customIcon={ASSET_CONFIG.nav.combat} label="冒险" isActive={state.view === 'COMBAT'} onClick={() => dispatch({ type: 'SWITCH_VIEW', payload: 'COMBAT' })} />
          <NavButton view="INVENTORY" icon={User} customIcon={ASSET_CONFIG.nav.inventory} label="角色" isActive={state.view === 'INVENTORY'} onClick={() => dispatch({ type: 'SWITCH_VIEW', payload: 'INVENTORY' })} />
          <NavButton view="TOWN" icon={Map} customIcon={ASSET_CONFIG.nav.town} label="城镇" isActive={state.view === 'TOWN'} onClick={() => dispatch({ type: 'SWITCH_VIEW', payload: 'TOWN' })} />
          <NavButton view="SKILLS" icon={BookOpen} customIcon={ASSET_CONFIG.nav.skills} label="技能" isActive={state.view === 'SKILLS'} onClick={() => dispatch({ type: 'SWITCH_VIEW', payload: 'SKILLS' })} />
        </div>

      </div>
      )}
    </div>
  );
};

export default App;
