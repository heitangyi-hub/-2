
import React from 'react';
import { Attributes, Stats, Player, Equipment, ItemRarity, ItemType, Enemy, Skill, SkillTreeType, SpecialEffectType } from '../types';

// 强化概率表 (0->1 到 9->10)
export const UPGRADE_RATES = [
    1.0,  // 0 -> 1: 100%
    0.9,  // 1 -> 2: 90%
    0.8,  // 2 -> 3: 80%
    0.7,  // 3 -> 4: 70%
    0.6,  // 4 -> 5: 60%
    0.5,  // 5 -> 6: 50%
    0.4,  // 6 -> 7: 40%
    0.3,  // 7 -> 8: 30%
    0.15, // 8 -> 9: 15%
    0.02  // 9 -> 10: 2%
];

// +10 满级特殊词条池
export const PURPLE_EFFECTS: { type: SpecialEffectType, name: string, desc: string }[] = [
    { type: 'METEOR_STORM', name: '★ 陨星风暴', desc: '攻击时5%概率召唤全屏陨石，造成500%攻击力的伤害。' },
    { type: 'GALAXY_IMPACT', name: '★ 银河爆裂', desc: '暴击时10%概率引发空间震荡，对全体敌人造成300%真实伤害。' },
    { type: 'VAMPIRIC_AURA', name: '★ 鲜血领主', desc: '获得20%吸血，并且溢出的治疗量转化为临时护盾。' }
];

// 死亡嘲讽语录
export const DEATH_TAUNTS = [
    "就这？我的像素点都比你硬。",
    "刚才那下很疼吗？我看你好像没感觉。",
    "这里是终点吗？不，这里只是开始...重新开始。",
    "你的装备看起来不错，可惜操作烂透了。",
    "怪物们表示：还没热身呢你怎么就倒了？",
    "建议去之前的关卡再练练，如果你能忍受羞耻的话。",
    "是不是网卡了？哦，原来是菜。",
    "躺在地上舒服吗？地板凉不凉？",
    "胜败乃兵家常事，但你败的次数有点多。",
    "别灰心，下次也许能多坚持一秒。",
    "你的 HP 归零了，但你的勇气...大概也归零了。"
];

// ==========================================
// 🎨 全能美术资源配置中心 (ASSET CONFIGURATION)
// ==========================================
// 美术资源尺寸建议 (Pixel Art 风格推荐):
// 1. 全局背景 (Backgrounds): 1080x1920 (9:16) 或 720x1280
// 2. 角色/怪物 (Sprites): 64x64, 128x128, 或 256x256 (GIF 动图最佳)
// 3. 图标 (Icons): 64x64 或 128x128
// 4. 按钮 (Buttons): 300x80 或 400x100
// 5. UI边框 (Frames): 1080x1920 (中心透明 PNG)
// ==========================================

export const ASSET_CONFIG = {
  // -------------------------
  // 1. 主界面 & UI 框架
  // -------------------------
  mainMenu: {
      background: "https://k1.a2k6.com/cyiliu66/i/2025/12/07/主界面.gif", // [尺寸: 1080x1920] 主界面背景图
      logo: "https://k1.a2k6.com/cyiliu66/i/2025/12/07/主标题.png",       // [尺寸: 600x300] 游戏标题 LOGO
      
      // 主菜单按钮 (如果不填则使用默认像素样式)
      btn_start: "https://k1.a2k6.com/cyiliu66/i/2025/12/07/开始征程.png",    // [尺寸: 300x80] 开始征程按钮
      btn_continue: "https://k1.a2k6.com/cyiliu66/i/2025/12/07/继续冒险.png", // [尺寸: 300x80] 继续冒险按钮
      btn_wiki: "https://k1.a2k6.com/cyiliu66/i/2025/12/07/恶魔图鉴.png",     // [尺寸: 300x80] 恶魔图鉴按钮
  },

  // 全局 UI 装饰
  ui: {
      frame: "",      // [尺寸: 1080x1920] 全局游戏边框 (PNG, 中间透明, 用于模拟复古掌机或相框)
    
      gold: "",       // [尺寸: 64x64] 金币图标
      essence: "",    // [尺寸: 64x64] 精华图标
      
      // 各面板背景图 (如果不填则使用纯色/默认样式)
      panel_bg_combat: "",    // [尺寸: 1080x800] 战斗区域背景框
      panel_bg_inventory: "", // [尺寸: 1080x1000] 角色/背包面板背景
      panel_bg_town: "",      // [尺寸: 1080x1000] 城镇面板背景
      panel_bg_skills: "",    // [尺寸: 1080x1000] 技能面板背景
  },
  
  // 底部导航栏图标 [尺寸: 64x64]
  nav: {
      combat: "https://k1.a2k6.com/cyiliu66/i/2025/12/08/战斗.png",    // [冒险] 剑图标
      inventory: "https://k1.a2k6.com/cyiliu66/i/2025/12/08/角色.png", // [角色] 人物图标
      town: "https://k1.a2k6.com/cyiliu66/i/2025/12/08/城镇.png",      // [城镇] 地图图标
      skills: "https://k1.a2k6.com/cyiliu66/i/2025/12/08/技能.png",    // [技能] 书本图标
  },

  // -------------------------
  // 2. 角色与属性图标
  // -------------------------
  player: {
    idle: "https://k1.a2k6.com/cyiliu66/i/2025/12/07/主角站立.gif",   // [尺寸: 128x128] 战斗中：站立/待机 GIF
    attack: "https://k1.a2k6.com/cyiliu66/i/2025/主角1.gif", // [尺寸: 128x128] 战斗中：攻击动作 GIF
    portrait: "https://k1.a2k6.com/cyiliu66/i/2025/12/07/主角站立.gif", // [尺寸: 256x256] 角色面板：大立绘
  },

  // 属性图标 [尺寸: 32x32 或 64x64]
  stats: {
      hp: "",      // 生命
      atk: "",     // 攻击
      def: "",     // 防御
      speed: "",   // 速度
      critRate: "",// 暴击率
      critDmg: "", // 暴击伤害
      dodge: "",   // 闪避
      lifesteal: "",// 吸血
      regen: "",    // 回复
  },

  // -------------------------
  // 3. 战斗特效 (VFX) - 建议 GIF
  // -------------------------
  vfx: {
      // --- 通用 [尺寸: 200x200] ---
      'HIT_IMPACT': "",       // [受击] 怪物或玩家受到伤害
      'LEVEL_UP': "",         // [升级] 升级光柱
      
      // --- 狂战系 ---
      'SKILL_SLASH_NORMAL': "", // [普攻] 普通攻击
      'SKILL_SLASH_HEAVY': "",  // [技能] 碎星斩 (T1-1)
      'SKILL_WHIRLWIND': "",    // [技能] 剑刃风暴 (T2-1)
      'SKILL_BLOOD_IMPACT': "", // [技能] 鲜血渴望 (T2-2)
      'SKILL_EXECUTE': "",      // [技能] 断头台 (T3-1)
      'SKILL_EARTH_SHATTER': "",// [技能] 崩山裂地 (T4-1)

      // --- 神佑系 ---
      'SKILL_HEAL_LIGHT': "",   // [技能] 天界恩赐 (T1-1)
      'SKILL_SMITE': "",        // [技能] 圣光审判 (T2-1)
      'SKILL_SHIELD_WALL': "",  // [技能] 神圣壁垒 (T3-1)
      'SKILL_HOLY_NOVA': "",    // [技能] 神迹救赎 (T4-1)

      // --- 秘术系 ---
      'SKILL_ICE_SPIKE': "",    // [技能] 极寒冰刺 (T1-1)
      'SKILL_LIGHTNING': "",    // [技能] 九天落雷 (T2-1)
      'SKILL_ARCANE_VOLLEY': "",// [技能] 秘法飞弹 (T2-3)
      'SKILL_BLIZZARD': "",     // [技能] 永恒暴风雪 (T3-1)
      'SKILL_VOID_ZONE': "",    // [技能] 时空静止 (T4-1)

      // --- 史诗/神话 ---
      'EPIC_METEOR': "",        // [特效] 陨星风暴 (+10神话特效)
      'EPIC_GALAXY': "",        // [特效] 银河爆裂 (+10神话特效)
  } as Record<string, string>,
  
  // -------------------------
  // 4. 战斗背景 [尺寸: 1080x1920 或 宽屏适配]
  // -------------------------
  backgrounds: {
      1: "https://k1.a2k6.com/cyiliu66/i/2025/12/08/幽暗密林.png", // 幽暗密林
      2: "https://k1.a2k6.com/cyiliu66/i/2025/12/08/凛风草原.png", // 凛风草原
      3: "https://k1.a2k6.com/cyiliu66/i/2025/12/08/埋骨之地.png", // 埋骨之地
      4: "https://k1.a2k6.com/cyiliu66/i/2025/12/08/赤红峡谷.png", // 赤红峡谷
      5: "https://k1.a2k6.com/cyiliu66/i/2025/12/08/迷糊沼泽.png", // 迷雾沼泽
      6: "https://k1.a2k6.com/cyiliu66/i/2025/12/08/熔岩炼狱.png", // 熔岩炼狱
      7: "https://k1.a2k6.com/cyiliu66/i/2025/12/08/极寒冰原.png", // 极寒冰原
      8: "https://k1.a2k6.com/cyiliu66/i/2025/12/08/诅咒废墟.png", // 诅咒废墟
      9: "https://k1.a2k6.com/cyiliu66/i/2025/12/08/天空之城.png", // 天空之城
      10: "https://k1.a2k6.com/cyiliu66/i/2025/12/08/深渊虚空.png", // 深渊虚空
  } as Record<number, string>,

  // -------------------------
  // 5. 敌人形象 [尺寸: 128x128 (小怪), 256x256 (Boss)]
  // -------------------------
  enemies: {
    // === 普通怪物 (对应 MONSTER_POOL) ===
    // Zone 1
    "史莱姆": "", 
    "大耳鼠": "",
    "吸血蝙蝠": "",
    "森林蜘蛛": "",
    
    // Zone 2
    "哥布林": "",
    "野狼": "",
    "强盗": "",
    "野猪": "",
    
    // Zone 3
    "骷髅兵": "",
    "腐尸": "",
    "幽灵": "",
    "食尸鬼": "",
    
    // Zone 4
    "兽人战士": "",
    "棕熊": "",
    "鹰身女妖": "",
    "黑暗信徒": "",
    
    // Zone 5
    "石头人": "",
    "石像鬼": "",
    "巨魔": "",
    "牛头人": "",
    
    // Zone 6
    "熔岩史莱姆": "",
    "火元素": "",
    "地狱犬": "",
    "魅魔": "",
    
    // Zone 7
    "冰霜巨人": "",
    "雪人": "",
    "极地狼": "",
    "冰晶兽": "",
    
    // Zone 8
    "暗黑骑士": "",
    "吸血鬼": "",
    "死灵法师": "",
    "怨灵": "",
    
    // Zone 9
    "龙人卫士": "",
    "飞龙": "",
    "奇美拉": "",
    "独眼巨人": "",
    
    // Zone 10
    "深渊恶魔": "",
    "虚空行者": "",
    "混沌兽": "",
    "堕落天使": "",

    // === 关卡 BOSS (Boss_ID) ===
    "Boss_1": "", // 史莱姆王
    "Boss_2": "", // 哥布林酋长
    "Boss_3": "", // 骷髅王
    "Boss_4": "", // 兽人督军
    "Boss_5": "", // 远古石巨人
    "Boss_6": "", // 炎魔之王
    "Boss_7": "", // 冰霜女王
    "Boss_8": "", // 吸血鬼伯爵
    "Boss_9": "", // 红龙
    "Boss_10": "", // 深渊领主
  } as Record<string, string>,

  // -------------------------
  // 6. 装备部位图标 [尺寸: 64x64]
  // -------------------------
  items: {
    [ItemType.WEAPON]: "",    
    [ItemType.ARMOR]: "",     
    [ItemType.BOOTS]: "",     
    [ItemType.ACCESSORY]: "", 
  } as Record<string, string>,

  // -------------------------
  // 7. 技能图标 [尺寸: 64x64]
  // -------------------------
  skills: {
    // 狂战系
    "c_t1_1": "", "c_t1_2": "", "c_t2_1": "", "c_t2_2": "", "c_t2_3": "", "c_t3_1": "", "c_t3_2": "", "c_t4_1": "",
    // 神佑系
    "s_t1_1": "", "s_t1_2": "", "s_t2_1": "", "s_t2_2": "", "s_t2_3": "", "s_t3_1": "", "s_t3_2": "", "s_t4_1": "",
    // 秘术系
    "m_t1_1": "", "m_t1_2": "", "m_t2_1": "", "m_t2_2": "", "m_t2_3": "", "m_t3_1": "", "m_t3_2": "", "m_t4_1": "",
  } as Record<string, string>
};

// --- 资源获取辅助函数 (请勿修改以下代码) ---

export const getEnemyAsset = (name: string, isBoss: boolean, stage: number): string | null => {
  // 1. 优先匹配 Boss 特定 ID
  if (isBoss) {
      const bossKey = `Boss_${Math.ceil(stage / 5) % 10 || 10}`;
      if (ASSET_CONFIG.enemies[bossKey]) return ASSET_CONFIG.enemies[bossKey];
  }

  // 2. 模糊匹配名称
  for (const key in ASSET_CONFIG.enemies) {
    if (!key.startsWith("Boss_") && name.includes(key) && ASSET_CONFIG.enemies[key]) {
      return ASSET_CONFIG.enemies[key];
    }
  }
  return null;
};

// 区域信息接口
export interface ZoneInfo {
    id: number;
    name: string;
    description: string;
    bgStyle: React.CSSProperties; 
    overlayStyle?: React.CSSProperties; 
}

// 区域配置数据 (10个区域循环)
export const ZONE_DATA: Record<number, ZoneInfo> = {
    1: { id: 1, name: '幽暗密林', description: '阳光无法穿透的古老森林，空气中弥漫着腐败的气息。', bgStyle: { background: 'linear-gradient(to bottom, #0f1810 0%, #1a2e1a 50%, #0d150d 100%)' }, overlayStyle: { backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(76, 175, 80, 0.1), transparent 60%)' } },
    2: { id: 2, name: '凛风草原', description: '狂风呼啸的荒凉草原，野兽出没之地。', bgStyle: { background: 'linear-gradient(to bottom, #4a6fa5 0%, #87CEEB 30%, #5d4037 30%, #3e2723 100%)' }, overlayStyle: { backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '100px 100%' } },
    3: { id: 3, name: '埋骨之地', description: '亡者的归宿，遍地是风化的白骨与游荡的亡灵。', bgStyle: { background: 'linear-gradient(to bottom, #2d1b2e 0%, #1a1016 100%)' }, overlayStyle: { backgroundImage: 'radial-gradient(circle, rgba(106, 27, 154, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' } },
    4: { id: 4, name: '赤红峡谷', description: '被烈日炙烤的红岩峡谷，在这个不毛之地只有强者生存。', bgStyle: { background: 'linear-gradient(to bottom, #ff8a65 0%, #bf360c 60%, #5d4037 100%)' }, overlayStyle: { backgroundColor: 'rgba(255, 87, 34, 0.1)' } },
    5: { id: 5, name: '迷雾沼泽', description: '常年笼罩在剧毒迷雾中的沼泽，每一步都暗藏杀机。', bgStyle: { background: 'linear-gradient(to bottom, #263238 0%, #1b5e20 80%, #000000 100%)' }, overlayStyle: { background: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 10px, transparent 10px, transparent 20px)' } },
    6: { id: 6, name: '熔岩炼狱', description: '地壳破裂之处，流淌的岩浆将一切化为灰烬。', bgStyle: { background: 'linear-gradient(to bottom, #3e2723 0%, #b71c1c 50%, #ff6f00 100%)' }, overlayStyle: { boxShadow: 'inset 0 -50px 100px rgba(255, 69, 0, 0.3)' } },
    7: { id: 7, name: '极寒冰原', description: '永冻的极寒之地，连时间仿佛都被冻结。', bgStyle: { background: 'linear-gradient(to bottom, #e0f7fa 0%, #81d4fa 40%, #0288d1 100%)' }, overlayStyle: { backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)' } },
    8: { id: 8, name: '诅咒废墟', description: '失落文明的遗迹，如今只剩下诅咒与黑暗。', bgStyle: { background: 'linear-gradient(to bottom, #000000 0%, #311b92 80%, #000000 100%)' } },
    9: { id: 9, name: '天空之城', description: '漂浮在云端的神秘都市，传说是神明的居所。', bgStyle: { background: 'linear-gradient(to bottom, #0288d1 0%, #b3e5fc 100%)' }, overlayStyle: { backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(255,255,255,0.8) 0%, transparent 20%)' } },
    10: { id: 10, name: '深渊虚空', description: '世界的尽头，一切法则在此失效。', bgStyle: { background: 'radial-gradient(circle at 50% 50%, #311b92 0%, #000000 100%)' }, overlayStyle: { backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239c27b0\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' } }
};

export const getZoneInfo = (stage: number): ZoneInfo & { subStage: number, tier: number, bgImage?: string } => {
    let tier = Math.ceil(stage / 5) % 10;
    if (tier === 0) tier = 10;
    const subStage = (stage - 1) % 5 + 1; 
    const info = ZONE_DATA[tier] || ZONE_DATA[1];
    
    // 检查是否有自定义背景图
    const customBg = ASSET_CONFIG.backgrounds[tier];
    
    return { ...info, subStage, tier, bgImage: customBg };
};

// 属性转换公式 (包含被动技能和装备强化计算)
export const calculateStats = (attrs: Attributes, equipment: Player['equipment'], level: number, skills: Skill[] = []): Stats => {
  let stats: Stats = {
    hp: 0, 
    maxHp: 100 + attrs.vit * 10 + level * 5,
    hpRegen: 1 + attrs.vit * 0.2, 
    atk: 5 + attrs.str * 2 + level * 1,
    def: attrs.vit * 0.5 + attrs.str * 0.2, 
    speed: 10 + attrs.agi * 0.2,
    critRate: 0.05 + attrs.crt * 0.0005, 
    critDmg: 1.5 + attrs.crt * 0.005,    
    dodge: attrs.agi * 0.0005,           
    lifesteal: 0
  };

  // 1. 装备加成 (Total = Base + Upgrade)
  // 算法：强化后的属性 = 基础属性 + (基础属性 * 强化等级 * 0.1)
  Object.values(equipment).forEach((item) => {
    if (item && item.baseStats) {
      // 强化加成 (每级提升 10% 基础值)
      const upgradeBonusMulti = (item.upgradeLevel || 0) * 0.1;
      const totalMulti = 1 + upgradeBonusMulti;

      stats.maxHp += Math.floor((item.baseStats.maxHp || 0) * totalMulti);
      stats.atk += Math.floor((item.baseStats.atk || 0) * totalMulti);
      stats.def += Math.floor((item.baseStats.def || 0) * totalMulti);
      stats.speed += Math.floor((item.baseStats.speed || 0) * totalMulti);
      stats.hpRegen += Number(((item.baseStats.hpRegen || 0) * totalMulti).toFixed(1));
      
      // 百分比类属性通常不受强化基础倍率影响，或者影响较小，这里设定为不随强化成长，只看词条
      // 如果想让强化也加暴击，可以在这里乘 totalMulti，但平衡性难控制
      stats.critRate += (item.baseStats.critRate || 0);
      stats.critDmg += (item.baseStats.critDmg || 0);
      stats.dodge += (item.baseStats.dodge || 0);
      stats.lifesteal += (item.baseStats.lifesteal || 0);
    }
  });

  // 2. 被动技能加成
  skills.forEach(skill => {
      if (skill.isPassive && skill.level > 0) {
          // 根据 id 判断效果
          // 狂战系
          if (skill.id === 'c_t1_2') { // 战神意志: 攻击力%
              stats.atk *= (1 + skill.effectValue!); 
          }
          if (skill.id === 'c_t2_3') { // 狂怒: 暴击率%
              stats.critRate += skill.effectValue!;
          }
          if (skill.id === 'c_t3_2') { // 弱点洞悉: 暴击伤害%
              stats.critDmg += skill.effectValue!;
          }
          
          // 神佑系
          if (skill.id === 's_t1_2') { // 不朽之躯: 防御力%
              stats.def *= (1 + skill.effectValue!);
          }
          if (skill.id === 's_t2_2') { // 天使守护: 生命回复+
              stats.hpRegen += skill.effectValue!;
          }
          if (skill.id === 's_t3_2') { // 虔诚信仰: 生命上限%
              stats.maxHp *= (1 + skill.effectValue!);
          }
          
          // 秘术系
          if (skill.id === 'm_t1_2') { // 奥术智慧: 冷却减少 -> 转化为速度提升 (模拟动作加快)
              stats.speed *= (1 + skill.effectValue!);
          }
          // m_t2_2 (痛苦诅咒) 和 s_t2_3 (荆棘光环) 属于战斗逻辑触发，不直接影响面板基础属性，
          // 它们将在 App.tsx 的战斗循环中生效。
          
          if (skill.id === 'm_t3_2') { // 星象预知: 闪避率%
              stats.dodge += skill.effectValue!;
          }
      }
  });

  return stats;
};

export const getExpReq = (level: number) => Math.floor(100 * Math.pow(1.15, level - 1));

export const getStageKillReq = (stage: number): number => {
    if (stage % 5 === 0) return 1; 
    return 5 + Math.floor(stage / 2);
};

const MONSTER_POOL = {
    1: ['史莱姆', '大耳鼠', '吸血蝙蝠', '森林蜘蛛'],
    2: ['哥布林', '野狼', '强盗', '野猪'],
    3: ['骷髅兵', '腐尸', '幽灵', '食尸鬼'],
    4: ['兽人战士', '棕熊', '鹰身女妖', '黑暗信徒'],
    5: ['石头人', '石像鬼', '巨魔', '牛头人'],
    6: ['熔岩史莱姆', '火元素', '地狱犬', '魅魔'],
    7: ['冰霜巨人', '雪人', '极地狼', '冰晶兽'],
    8: ['暗黑骑士', '吸血鬼', '死灵法师', '怨灵'],
    9: ['龙人卫士', '飞龙', '奇美拉', '独眼巨人'],
    10: ['深渊恶魔', '虚空行者', '混沌兽', '堕落天使']
};

export const BOSS_POOL = {
    1: '巨大史莱姆王',
    2: '哥布林酋长',
    3: '骷髅王',
    4: '兽人督军',
    5: '远古石巨人',
    6: '炎魔之王',
    7: '冰霜女王',
    8: '吸血鬼伯爵',
    9: '红龙·奥妮克希亚',
    10: '深渊领主'
};

// BOSS 图鉴数据
export interface BossLore {
    id: number;
    name: string;
    title: string;
    description: string;
    difficulty: number;
}

export const BOSS_LORE_DATA: Record<number, BossLore> = {
    1: { id: 1, name: BOSS_POOL[1], title: '森林贪食者', description: '因为吞噬了过多的魔法药水而变异的巨大史莱姆，身体具有极强的腐蚀性。', difficulty: 1 },
    2: { id: 2, name: BOSS_POOL[2], title: '草原暴君', description: '统领着三百哥布林大军的残暴酋长，手中的巨棒沾满了冒险者的鲜血。', difficulty: 2 },
    3: { id: 3, name: BOSS_POOL[3], title: '不朽骸骨', description: '曾是人类王国的将军，死后被死灵法术唤醒，永远守卫着废弃的王座。', difficulty: 3 },
    4: { id: 4, name: BOSS_POOL[4], title: '血斧行刑官', description: '兽人部落中最强壮的战士，信奉力量至上，渴望挑战一切强者。', difficulty: 4 },
    5: { id: 5, name: BOSS_POOL[5], title: '大地守护者', description: '远古时期被创造出来的魔像，虽然核心已经破损，但依然执行着守卫指令。', difficulty: 5 },
    6: { id: 6, name: BOSS_POOL[6], title: '灰烬之主', description: '从地心熔岩中诞生的元素领主，所到之处皆为焦土。', difficulty: 6 },
    7: { id: 7, name: BOSS_POOL[7], title: '极寒之泪', description: '因爱人的背叛而堕入黑暗的精灵女王，她的悲伤冻结了整个北境。', difficulty: 7 },
    8: { id: 8, name: BOSS_POOL[8], title: '鲜血贵族', description: '存活了上千年的吸血鬼，将猎杀冒险者视为一场优雅的游戏。', difficulty: 8 },
    9: { id: 9, name: BOSS_POOL[9], title: '烈焰灾厄', description: '传说中的巨龙，它的吐息能融化最坚固的铠甲，是天空的霸主。', difficulty: 9 },
    10: { id: 10, name: BOSS_POOL[10], title: '虚空终结者', description: '来自世界之外的恐怖存在，目的是吞噬所有的光与希望。', difficulty: 10 },
};

export const getEnemyPosition = (index: number, total: number) => {
    if (total === 1) return { x: 70, y: 35 }; 
    const positions = [
        { x: 65, y: 40 }, 
        { x: 80, y: 30 }, 
        { x: 75, y: 50 }, 
        { x: 90, y: 40 }, 
    ];
    return positions[index % positions.length];
};

export const generateEnemies = (stage: number): Enemy[] => {
  const isBossStage = stage % 5 === 0;
  const scaling = Math.pow(1.1, stage);
  
  let tier = Math.ceil(stage / 5) % 10;
  if (tier === 0) tier = 10;
  
  const count = isBossStage ? 1 : Math.floor(Math.random() * 3) + 2; 
  const enemies: Enemy[] = [];

  const pool = MONSTER_POOL[tier as keyof typeof MONSTER_POOL] || MONSTER_POOL[1];
  const bossName = BOSS_POOL[tier as keyof typeof BOSS_POOL] || '未知领主';

  for (let i = 0; i < count; i++) {
      let name = '';
      if (isBossStage) {
          name = `☠️ ${bossName} (Lv.${stage})`;
      } else {
          const monsterName = pool[Math.floor(Math.random() * pool.length)];
          const prefix = count > 1 ? String.fromCharCode(65 + i) : '';
          name = `${monsterName} ${prefix}`;
      }
      
      const multiMod = isBossStage ? 1 : (1.0 / (count * 0.6));
      const hpBase = isBossStage ? 100 : 30;
      const hp = Math.floor(hpBase * scaling * (isBossStage ? 1 : multiMod));
      
      const spd = 8 + stage * 0.1;
      const initDelay = Math.random() * 2000 + 1000;

      enemies.push({
        id: `enemy_${Date.now()}_${i}`,
        name,
        level: stage,
        isBoss: isBossStage,
        maxHp: hp,
        nextAttackTime: Date.now() + initDelay,
        lastAttackTime: 0, 
        stats: {
          hp: hp,
          maxHp: hp,
          hpRegen: 0,
          atk: Math.floor((isBossStage ? 8 : 4) * scaling * (isBossStage ? 1 : multiMod)),
          def: Math.floor(1 * scaling),
          speed: spd,
          critRate: 0.05,
          critDmg: 1.5,
          dodge: 0,
          lifesteal: 0
        }
      });
  }
  
  return enemies;
};

interface AffixDef {
  stat: keyof Stats;
  name: string;
  min: number;
  max: number;
  isPercent?: boolean; 
}

const AFFIX_POOLS: { [key in ItemType]: AffixDef[] } = {
  [ItemType.WEAPON]: [
    { stat: 'atk', name: '锋利', min: 2, max: 5 },
    { stat: 'atk', name: '破坏', min: 3, max: 6 },
    { stat: 'critDmg', name: '残暴', min: 0.05, max: 0.15, isPercent: true },
    { stat: 'critRate', name: '致命', min: 0.01, max: 0.03, isPercent: true },
    { stat: 'critRate', name: '精准', min: 0.02, max: 0.04, isPercent: true },
    { stat: 'speed', name: '急速', min: 2, max: 4 },
  ],
  [ItemType.ARMOR]: [
    { stat: 'maxHp', name: '强壮', min: 10, max: 30 },
    { stat: 'maxHp', name: '巨熊', min: 15, max: 40 },
    { stat: 'def', name: '坚固', min: 2, max: 5 },
    { stat: 'def', name: '韧性', min: 3, max: 6 },
    { stat: 'hpRegen', name: '复苏', min: 0.5, max: 1.5 },
  ],
  [ItemType.BOOTS]: [
    { stat: 'speed', name: '神行', min: 1, max: 3 },
    { stat: 'speed', name: '疾行', min: 2, max: 5 },
    { stat: 'dodge', name: '灵巧', min: 0.01, max: 0.02, isPercent: true },
    { stat: 'dodge', name: '幻影', min: 0.02, max: 0.03, isPercent: true },
    { stat: 'def', name: '护腿', min: 1, max: 3 },
  ],
  [ItemType.ACCESSORY]: [
    { stat: 'atk', name: '力量', min: 1, max: 3 },
    { stat: 'critRate', name: '幸运', min: 0.01, max: 0.02, isPercent: true },
    { stat: 'hpRegen', name: '生命', min: 0.2, max: 0.8 },
    { stat: 'maxHp', name: '体质', min: 5, max: 15 },
    { stat: 'lifesteal', name: '嗜血', min: 0.01, max: 0.03, isPercent: true },
    { stat: 'lifesteal', name: '贪婪', min: 0.02, max: 0.05, isPercent: true },
  ]
};

const MYTHIC_EFFECTS = [
    "★ 神话: 攻击时 10% 概率触发【连锁闪电】，对敌人造成额外伤害。",
    "★ 神话: 每次释放技能后，下一次普通攻击造成 200% 伤害。",
    "★ 神话: 受到致命伤害时，免疫死亡并恢复 30% 生命 (CD: 120秒)。",
    "★ 神话: 【吸血光环】 你的吸血效果提升 50%。",
    "★ 神话: 攻击速度提升极限，并不再受到减少攻速效果的影响。",
    "★ 神话: 暴击时，有 20% 概率重置所有技能冷却时间 (CD: 15秒)。"
];

export const generateItem = (level: number, forceRarity?: ItemRarity): Equipment => {
  const types = [ItemType.WEAPON, ItemType.ARMOR, ItemType.BOOTS, ItemType.ACCESSORY];
  const type = types[Math.floor(Math.random() * types.length)];
  
  let rarity = ItemRarity.COMMON;
  let affixCount = 0;
  
  if (forceRarity) {
    rarity = forceRarity;
    if (rarity === ItemRarity.RARE) affixCount = 2;
    if (rarity === ItemRarity.LEGENDARY) affixCount = 3;
    if (rarity === ItemRarity.MYTHIC) affixCount = 5;
  } else {
    const rand = Math.random();
    if (rand > 0.98) { rarity = ItemRarity.MYTHIC; affixCount = 5; }
    else if (rand > 0.90) { rarity = ItemRarity.LEGENDARY; affixCount = 3; }
    else if (rand > 0.70) { rarity = ItemRarity.RARE; affixCount = 1; } 
  }
  
  const baseStats: Partial<Stats> = {};
  const multiplier = level * (rarity === ItemRarity.MYTHIC ? 2.5 : rarity === ItemRarity.LEGENDARY ? 1.8 : rarity === ItemRarity.RARE ? 1.3 : 1);

  if (type === ItemType.WEAPON) {
    baseStats.atk = Math.floor(5 + multiplier * 2.5);
    baseStats.critDmg = 0.1 * (level / 10);
  }
  if (type === ItemType.ARMOR) {
    baseStats.maxHp = Math.floor(20 + multiplier * 12);
    baseStats.def = Math.floor(2 + multiplier * 1.5);
    baseStats.hpRegen = Math.floor(multiplier * 0.2);
  }
  if (type === ItemType.BOOTS) {
    baseStats.speed = Math.floor(1 + multiplier * 0.8);
    baseStats.dodge = 0.01 * (multiplier / 10);
  }
  if (type === ItemType.ACCESSORY) {
    baseStats.critRate = 0.01 + (0.01 * (multiplier / 5));
    baseStats.atk = Math.floor(2 + multiplier);
    baseStats.maxHp = Math.floor(10 + multiplier * 5);
  }

  const affixes: string[] = [];
  const pool = AFFIX_POOLS[type];

  for (let i = 0; i < affixCount; i++) {
    const affixDef = pool[Math.floor(Math.random() * pool.length)];
    const rawVal = (affixDef.min + Math.random() * (affixDef.max - affixDef.min)) * (level * 0.5);
    let valStr = '';
    
    if (affixDef.isPercent) {
      const val = Math.min(0.5, rawVal * 0.1); 
      const currentVal = baseStats[affixDef.stat] || 0;
      baseStats[affixDef.stat] = currentVal + val;
      valStr = `+${(val * 100).toFixed(1)}%`;
    } else {
      const val = Math.max(1, Math.floor(rawVal));
      const currentVal = baseStats[affixDef.stat] || 0;
      baseStats[affixDef.stat] = currentVal + val;
      valStr = `+${val}`;
    }

    let statNameCN = '';
    switch(affixDef.stat) {
      case 'atk': statNameCN = '攻击力'; break;
      case 'def': statNameCN = '防御力'; break;
      case 'maxHp': statNameCN = '生命上限'; break;
      case 'hpRegen': statNameCN = '生命回复'; break;
      case 'speed': statNameCN = '速度'; break;
      case 'critRate': statNameCN = '暴击率'; break;
      case 'critDmg': statNameCN = '暴击伤害'; break;
      case 'dodge': statNameCN = '闪避率'; break;
      case 'lifesteal': statNameCN = '吸血'; break;
      default: statNameCN = '未知属性';
    }

    affixes.push(`◇ ${affixDef.name}: ${statNameCN} ${valStr}`);
  }

  if (rarity === ItemRarity.MYTHIC) {
    const mythicEffect = MYTHIC_EFFECTS[Math.floor(Math.random() * MYTHIC_EFFECTS.length)];
    affixes.push(mythicEffect);
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    name: `${rarity === ItemRarity.MYTHIC ? '神话·' : rarity === ItemRarity.LEGENDARY ? '传说·' : rarity === ItemRarity.RARE ? '稀有·' : ''}${type === ItemType.WEAPON ? '巨剑' : type === ItemType.ARMOR ? '板甲' : type === ItemType.BOOTS ? '战靴' : '指环'}`,
    type,
    rarity,
    levelReq: level,
    baseStats,
    affixes,
    score: Math.floor(multiplier * 10 + affixCount * 20),
    upgradeLevel: 0
  };
};

export const calculateDamage = (attacker: Stats, defender: Stats, skillMult: number = 1.0): { damage: number; isCrit: boolean; isDodge: boolean } => {
  if (Math.random() < defender.dodge) {
    return { damage: 0, isCrit: false, isDodge: true };
  }

  const isCrit = Math.random() < attacker.critRate;
  const attackPower = attacker.atk * skillMult;
  let rawDmg = Math.max(attackPower * 0.05, attackPower - defender.def);
  
  if (isCrit) rawDmg *= attacker.critDmg;
  
  const variance = 0.95 + Math.random() * 0.1;
  
  return {
    damage: Math.floor(rawDmg * variance),
    isCrit,
    isDodge: false
  };
};

export const recalculateSkillStats = (skill: Skill, newLevel: number): Skill => {
    // 重新计算技能属性
    // 基础 + 成长 * 等级
    
    // 如果是被动技能，伤害倍率为0 (确保 UI 不显示错误的伤害数值)
    let dmg = skill.isPassive ? 0 : (skill.baseDamageMult + (newLevel * skill.growth.damage));
    
    const heal = (skill.baseHealMult || 0) + (newLevel * (skill.growth.heal || 0));
    const cd = Math.max(0.5, skill.baseCooldown + (newLevel * (skill.growth.cooldown || 0))); 

    // 修复被动技能效果计算：
    // 优先使用 growth.effect (新字段)，如果未定义则回退到 growth.damage (兼容旧逻辑，但尽量避免)
    let effect = 0;
    if (skill.isPassive) {
        const baseEffect = INITIAL_SKILLS.find(s => s.id === skill.id)?.effectValue || 0;
        const growthEffect = skill.growth.effect || skill.growth.damage || 0; 
        effect = baseEffect + newLevel * growthEffect;
    }

    return {
        ...skill,
        level: newLevel,
        damageMult: Number(dmg.toFixed(2)),
        healMult: Number(heal.toFixed(2)),
        cooldown: Number(cd.toFixed(1)),
        effectValue: Number(effect.toFixed(3))
    };
};

// 技能配置表 (已优化被动技能数值，并将被动成长移至 growth.effect)
// 已调整所有主动技能的冷却时间 (Base Cooldown) 以减少视觉混乱并优化节奏
export const INITIAL_SKILLS: Skill[] = [
  // --- 狂战系 (Combat) ---
  // T1: 4s -> 7s
  { id: 'c_t1_1', name: '碎星斩', description: '凝聚力量的重击。', tree: SkillTreeType.COMBAT, tier: 1, level: 0, maxLevel: 5, isPassive: false, baseCooldown: 7, baseDamageMult: 1.2, growth: { damage: 0.2, cooldown: -0.2 }, cooldown: 7, damageMult: 1.2, targetType: 'SINGLE' },
  { id: 'c_t1_2', name: '战神意志', description: '被动：基础攻击力提升(%)。', tree: SkillTreeType.COMBAT, tier: 1, level: 0, maxLevel: 5, isPassive: true, baseCooldown: 0, baseDamageMult: 0, growth: { damage: 0, effect: 0.01 }, cooldown: 0, damageMult: 0, effectValue: 0.05 }, // Base 5%, +1%/Lv
  // T2: 5s -> 12s
  { id: 'c_t2_1', name: '剑刃风暴', description: 'AOE：化身为旋风，对所有敌人造成伤害。', tree: SkillTreeType.COMBAT, tier: 2, level: 0, maxLevel: 5, isPassive: false, baseCooldown: 12, baseDamageMult: 0.8, growth: { damage: 0.15, cooldown: -0.5 }, cooldown: 12, damageMult: 0.8, targetType: 'AOE' },
  // T2: 5s -> 10s
  { id: 'c_t2_2', name: '鲜血渴望', description: '造成伤害并使敌人流血。', tree: SkillTreeType.COMBAT, tier: 2, level: 0, maxLevel: 5, isPassive: false, baseCooldown: 10, baseDamageMult: 1.4, growth: { damage: 0.2, cooldown: -0.4 }, cooldown: 10, damageMult: 1.4, targetType: 'SINGLE' },
  { id: 'c_t2_3', name: '狂怒', description: '被动：暴击率提升(%)。', tree: SkillTreeType.COMBAT, tier: 2, level: 0, maxLevel: 5, isPassive: true, baseCooldown: 0, baseDamageMult: 0, growth: { damage: 0, effect: 0.005 }, cooldown: 0, damageMult: 0, effectValue: 0.02 }, // Base 2%, +0.5%/Lv
  // T3: 8s -> 18s
  { id: 'c_t3_1', name: '断头台', description: '无情的处决一击，造成巨量伤害。', tree: SkillTreeType.COMBAT, tier: 3, level: 0, maxLevel: 5, isPassive: false, baseCooldown: 18, baseDamageMult: 2.0, growth: { damage: 0.4, cooldown: -0.8 }, cooldown: 18, damageMult: 2.0, targetType: 'SINGLE' },
  { id: 'c_t3_2', name: '弱点洞悉', description: '被动：暴击伤害提升(%)。', tree: SkillTreeType.COMBAT, tier: 3, level: 0, maxLevel: 5, isPassive: true, baseCooldown: 0, baseDamageMult: 0, growth: { damage: 0, effect: 0.05 }, cooldown: 0, damageMult: 0, effectValue: 0.1 }, // Base 10%, +5%/Lv
  // T4: 20s -> 45s
  { id: 'c_t4_1', name: '崩坏·裂地击', description: 'AOE终极奥义：撼动大地的斩击。', tree: SkillTreeType.COMBAT, tier: 4, level: 0, maxLevel: 1, isPassive: false, baseCooldown: 45, baseDamageMult: 3.0, growth: { damage: 0.5, cooldown: -2 }, cooldown: 45, damageMult: 3.0, targetType: 'AOE' },

  // --- 神佑系 (Sustain) ---
  // T1: 12s -> 15s
  { id: 's_t1_1', name: '天界恩赐', description: '召唤天界之光恢复生命。', tree: SkillTreeType.SUSTAIN, tier: 1, level: 0, maxLevel: 5, isPassive: false, baseCooldown: 15, baseDamageMult: 0, baseHealMult: 1.5, growth: { damage: 0, heal: 0.3, cooldown: -0.5 }, cooldown: 15, damageMult: 0, healMult: 1.5 },
  { id: 's_t1_2', name: '不朽之躯', description: '被动：防御力提升(%)。', tree: SkillTreeType.SUSTAIN, tier: 1, level: 0, maxLevel: 5, isPassive: true, baseCooldown: 0, baseDamageMult: 0, growth: { damage: 0, effect: 0.02 }, cooldown: 0, damageMult: 0, effectValue: 0.05 }, // Base 5%, +2%/Lv
  // T2: 6s -> 10s
  { id: 's_t2_1', name: '圣光审判', description: '造成伤害并恢复少量生命。', tree: SkillTreeType.SUSTAIN, tier: 2, level: 0, maxLevel: 5, isPassive: false, baseCooldown: 10, baseDamageMult: 1.2, baseHealMult: 0.4, growth: { damage: 0.1, heal: 0.1, cooldown: -0.3 }, cooldown: 10, damageMult: 1.2, healMult: 0.4, targetType: 'SINGLE' },
  { id: 's_t2_2', name: '天使守护', description: '被动：生命回复速度提升(固定值)。', tree: SkillTreeType.SUSTAIN, tier: 2, level: 0, maxLevel: 5, isPassive: true, baseCooldown: 0, baseDamageMult: 0, growth: { damage: 0, effect: 0.5 }, cooldown: 0, damageMult: 0, effectValue: 1.0 }, // Base 1, +0.5/Lv
  { id: 's_t2_3', name: '荆棘光环', description: '被动：受击时反弹百分比伤害。', tree: SkillTreeType.SUSTAIN, tier: 2, level: 0, maxLevel: 5, isPassive: true, baseCooldown: 0, baseDamageMult: 0, growth: { damage: 0, effect: 0.02 }, cooldown: 0, damageMult: 0, effectValue: 0.1 }, // Base 10%, +2%/Lv
  // T3: 25s -> 30s
  { id: 's_t3_1', name: '神圣壁垒', description: '获得一个足以抵挡伤害的护盾。', tree: SkillTreeType.SUSTAIN, tier: 3, level: 0, maxLevel: 5, isPassive: false, baseCooldown: 30, baseDamageMult: 0, baseHealMult: 3.0, growth: { damage: 0, heal: 0.5, cooldown: -1 }, cooldown: 30, damageMult: 0, healMult: 3.0 },
  { id: 's_t3_2', name: '虔诚信仰', description: '被动：生命上限提升(%)。', tree: SkillTreeType.SUSTAIN, tier: 3, level: 0, maxLevel: 5, isPassive: true, baseCooldown: 0, baseDamageMult: 0, growth: { damage: 0, effect: 0.02 }, cooldown: 0, damageMult: 0, effectValue: 0.05 }, // Base 5%, +2%/Lv
  // T4: 60s -> 75s
  { id: 's_t4_1', name: '神迹·救赎', description: '终极奥义：回满生命并造成神圣冲击。', tree: SkillTreeType.SUSTAIN, tier: 4, level: 0, maxLevel: 1, isPassive: false, baseCooldown: 75, baseDamageMult: 2.0, baseHealMult: 5.0, growth: { damage: 0.5, heal: 2.0, cooldown: -2 }, cooldown: 75, damageMult: 2.0, healMult: 5.0, targetType: 'AOE' },

  // --- 秘术系 (Control) ---
  // T1: 5s -> 8s
  { id: 'm_t1_1', name: '极寒冰刺', description: '造成伤害并附带减速效果。', tree: SkillTreeType.CONTROL, tier: 1, level: 0, maxLevel: 5, isPassive: false, baseCooldown: 8, baseDamageMult: 1.1, growth: { damage: 0.15, cooldown: -0.2 }, cooldown: 8, damageMult: 1.1, targetType: 'SINGLE' },
  { id: 'm_t1_2', name: '奥术智慧', description: '被动：冷却加速(转化为速度提升)。', tree: SkillTreeType.CONTROL, tier: 1, level: 0, maxLevel: 5, isPassive: true, baseCooldown: 0, baseDamageMult: 0, growth: { damage: 0, effect: 0.01 }, cooldown: 0, damageMult: 0, effectValue: 0.02 }, // Base 2%, +1%/Lv
  // T2: 6s -> 14s
  { id: 'm_t2_1', name: '九天落雷', description: '召唤必定命中的天雷。', tree: SkillTreeType.CONTROL, tier: 2, level: 0, maxLevel: 5, isPassive: false, baseCooldown: 14, baseDamageMult: 1.3, growth: { damage: 0.2, cooldown: -0.5 }, cooldown: 14, damageMult: 1.3, targetType: 'SINGLE' },
  { id: 'm_t2_2', name: '痛苦诅咒', description: '被动：受到攻击时，受到的伤害降低(%)。', tree: SkillTreeType.CONTROL, tier: 2, level: 0, maxLevel: 5, isPassive: true, baseCooldown: 0, baseDamageMult: 0, growth: { damage: 0, effect: 0.01 }, cooldown: 0, damageMult: 0, effectValue: 0.05 }, // Base 5%, +1%/Lv
  // T2: 4s -> 8s
  { id: 'm_t2_3', name: '秘法飞弹', description: 'AOE：快速连射魔法飞弹。', tree: SkillTreeType.CONTROL, tier: 2, level: 0, maxLevel: 5, isPassive: false, baseCooldown: 8, baseDamageMult: 1.2, growth: { damage: 0.15, cooldown: -0.2 }, cooldown: 8, damageMult: 1.2, targetType: 'AOE' },
  // T3: 12s -> 25s
  { id: 'm_t3_1', name: '永恒暴风雪', description: 'AOE：召唤极寒暴风雪。', tree: SkillTreeType.CONTROL, tier: 3, level: 0, maxLevel: 5, isPassive: false, baseCooldown: 25, baseDamageMult: 1.5, growth: { damage: 0.25, cooldown: -1 }, cooldown: 25, damageMult: 1.5, targetType: 'AOE' },
  { id: 'm_t3_2', name: '星象预知', description: '被动：闪避率提升(%)。', tree: SkillTreeType.CONTROL, tier: 3, level: 0, maxLevel: 5, isPassive: true, baseCooldown: 0, baseDamageMult: 0, growth: { damage: 0, effect: 0.002 }, cooldown: 0, damageMult: 0, effectValue: 0.01 }, // Base 1%, +0.2%/Lv
  // T4: 45s -> 60s
  { id: 'm_t4_1', name: '禁术·时空静止', description: 'AOE终极奥义：造成巨量伤害。', tree: SkillTreeType.CONTROL, tier: 4, level: 0, maxLevel: 1, isPassive: false, baseCooldown: 60, baseDamageMult: 3.5, growth: { damage: 0.6, cooldown: -2 }, cooldown: 60, damageMult: 3.5, targetType: 'AOE' },
];
