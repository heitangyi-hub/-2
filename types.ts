
// 基础属性
export interface Stats {
  hp: number;
  maxHp: number;
  hpRegen: number; // 新增：生命回复
  atk: number;
  def: number;
  speed: number;
  critRate: number; // 会心率
  critDmg: number; // 会心伤害
  dodge: number;  // 闪避
  lifesteal: number; // 新增：吸血 (0-1)
}

// 基础四维 (重构)
export interface Attributes {
  vit: number; // 体质 (Constitution) -> HP / Regen
  str: number; // 力量 (Strength) -> ATK
  agi: number; // 敏捷 (Agility) -> Speed / Dodge
  crt: number; // 会心 (Perception) -> Crit Rate / Crit Dmg
}

// 物品品质
export enum ItemRarity {
  COMMON = 'Common',     // 绿
  RARE = 'Rare',         // 蓝
  LEGENDARY = 'Legendary', // 橙
  MYTHIC = 'Mythic'      // 红
}

// 物品类型
export enum ItemType {
  WEAPON = 'Weapon',
  ARMOR = 'Armor',
  BOOTS = 'Boots',
  ACCESSORY = 'Accessory'
}

// 特殊效果定义 (+10 获得)
export type SpecialEffectType = 'METEOR_STORM' | 'GALAXY_IMPACT' | 'VAMPIRIC_AURA';

// 装备
export interface Equipment {
  id: string;
  name: string;
  type: ItemType;
  rarity: ItemRarity;
  levelReq: number;
  baseStats: Partial<Stats>;
  affixes: string[]; // 特殊词条描述
  specialEffects?: SpecialEffectType[]; // 实际的程序化特效标签
  score: number; // 装备评分
  upgradeLevel: number; // 强化等级
}

// 技能流派
export enum SkillTreeType {
  COMBAT = 'Combat',   // 狂战
  SUSTAIN = 'Sustain', // 神佑
  CONTROL = 'Control'  // 秘术
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  tree: SkillTreeType;
  tier: number; // 技能层级
  level: number;
  maxLevel: number;
  isPassive: boolean;
  
  // 基础数值 (Lv.0)
  baseCooldown: number;
  baseDamageMult: number;
  baseHealMult?: number;

  // 成长配置 (每级增加)
  growth: {
      damage: number;
      heal?: number;
      cooldown?: number; // 负数代表减少
      effect?: number; // 新增：专门用于被动技能的效果成长值 (避免UI显示为伤害)
  };

  // 当前战斗属性 (计算后 = base + growth * level)
  cooldown: number; // 冷却时间 (秒)
  damageMult: number; // 伤害倍率 (1.0 = 100%)
  healMult?: number; // 治疗倍率
  
  targetType?: 'SINGLE' | 'AOE'; // 新增：目标类型
  effectType?: 'STUN' | 'SLOW' | 'BUFF_ATK' | 'BUFF_DEF';
  effectValue?: number;
  effectDuration?: number;
}

// 视觉特效类型
export interface FloatingText {
  id: string;
  text: string;
  x: number; // 0-100%
  y: number; // 0-100%
  color: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  createdAt: number;
}

// 扩展特效类型
export interface VisualEffect {
  id: string;
  type: 
    // 通用
    | 'HIT_IMPACT' 
    | 'LEVEL_UP' 
    // 狂战系
    | 'SKILL_SLASH_NORMAL' // 普攻
    | 'SKILL_SLASH_HEAVY'  // 碎星斩
    | 'SKILL_WHIRLWIND'    // 剑刃风暴
    | 'SKILL_BLOOD_IMPACT' // 鲜血渴望
    | 'SKILL_EXECUTE'      // 断头台
    | 'SKILL_EARTH_SHATTER'// 崩山裂地
    // 神佑系
    | 'SKILL_HEAL_LIGHT'   // 天界恩赐
    | 'SKILL_SMITE'        // 圣光审判
    | 'SKILL_SHIELD_WALL'  // 神圣壁垒
    | 'SKILL_HOLY_NOVA'    // 神迹救赎
    // 秘术系
    | 'SKILL_ICE_SPIKE'    // 极寒冰刺
    | 'SKILL_LIGHTNING'    // 九天落雷
    | 'SKILL_ARCANE_VOLLEY'// 秘法飞弹
    | 'SKILL_BLIZZARD'     // 永恒暴风雪
    | 'SKILL_VOID_ZONE'    // 时空静止
    // 史诗
    | 'EPIC_METEOR' 
    | 'EPIC_GALAXY';
  x: number;
  y: number;
  createdAt: number;
}

// 日志类型
export type LogType = 'info' | 'success' | 'warning' | 'danger' | 'drop' | 'level' | 'stage';

export interface LogEntry {
  id: string;
  type: LogType;
  text: string;
  item?: Equipment; // For drops
  timestamp: number;
}

// 自动加点配置
export interface AutoAllocation {
  enabled: boolean;
  weights: Attributes; // 每次升级自动分配的点数 (总和应为5)
}

// 玩家角色
export interface Player {
  level: number;
  exp: number;
  maxExp: number;
  gold: number;
  essence: number; // 新增：装备精华 (用于强化)
  attributes: Attributes;
  attributePoints: number; // 未分配属性点
  skillPoints: number;     // 未分配技能点
  currentStats: Stats;     // 计算装备后的最终面板
  equipment: {
    [key in ItemType]?: Equipment;
  };
  inventory: Equipment[];
  skills: Skill[];
  equippedSkills: string[]; // 已装备技能ID
  autoAllocation: AutoAllocation; // 新增：自动加点
}

// 敌人
export interface Enemy {
  id: string;
  name: string;
  level: number;
  stats: Stats;
  isBoss: boolean;
  maxHp: number; // 记录最大血量用于UI
  nextAttackTime: number; // 下次攻击的时间戳
  lastAttackTime: number; // 新增：上次攻击时间 (用于动画)
}

// 游戏全局状态
export interface GameState {
  player: Player;
  enemies: Enemy[]; // 改为数组，支持 1vN
  autoBattle: boolean;
  
  stage: number;
  maxStage: number; // 历史最高关卡
  killCount: number; // 当前关卡击杀进度
  autoAdvance: boolean; // 新增：是否自动晋升关卡 (Loop模式)

  battleLog: LogEntry[]; // 改为结构化日志
  lastTick: number; // 上一帧时间戳
  lastPlayerAttackTime: number; // 玩家上次攻击时间
  lastPlayerHitTime: number; // 新增：玩家上次受击时间

  view: 'COMBAT' | 'TOWN' | 'INVENTORY' | 'SKILLS';
  
  // 新增战斗状态
  isPlayerDead: boolean; // 新增：玩家是否死亡
  skillCooldowns: { [skillId: string]: number }; // 记录技能下一次可用的时间戳
  floatingTexts: FloatingText[];
  visualEffects: VisualEffect[];
  shakeScreen: boolean; // 是否震屏
  
  // 查看物品详情 (从日志点击)
  viewingItem: Equipment | null;
}

export type GameAction = 
  | { type: 'GAME_LOOP_TICK'; payload: number } // 主循环心跳
  | { type: 'TOGGLE_AUTO_BATTLE' }
  | { type: 'TOGGLE_AUTO_ADVANCE' } // 新增：切换是否自动进阶
  | { type: 'CHANGE_STAGE'; payload: number } // 切换关卡
  | { type: 'SWITCH_VIEW'; payload: GameState['view'] }
  | { type: 'LEVEL_UP_ATTRIBUTE'; payload: keyof Attributes }
  | { type: 'UPDATE_AUTO_ALLOCATION'; payload: AutoAllocation } // 新增：更新自动加点
  | { type: 'EQUIP_ITEM'; payload: Equipment }
  | { type: 'UNEQUIP_ITEM'; payload: ItemType }
  | { type: 'SELL_ITEM'; payload: string } 
  | { type: 'BATCH_SELL_ITEMS'; payload: ItemRarity[] }
  | { type: 'UPGRADE_ITEM'; payload: ItemType } 
  | { type: 'USE_SKILL'; payload: string }
  | { type: 'WAVE_CLEARED'; payload: { exp: number; gold: number; drops: Equipment[]; isFirstClear: boolean } }
  | { type: 'SPAWN_ENEMIES' } 
  | { type: 'LEARN_SKILL'; payload: string }
  | { type: 'EQUIP_SKILL'; payload: string }
  | { type: 'UNEQUIP_SKILL'; payload: string }
  | { type: 'CLEANUP_VFX' }
  | { type: 'REGEN_HP' }
  | { type: 'VIEW_ITEM'; payload: Equipment | null } // 新增：查看物品详情
  | { type: 'PLAYER_REVIVE'; payload: { stage: number; autoAdvance: boolean } }; // 新增：复活
