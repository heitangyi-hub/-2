import { GameState, Player } from '../types';
import { INITIAL_SKILLS } from './gameLogic';

const SAVE_KEY = 'pixel_expedition_save_v1';

// 序列化：只保存核心数据，移除临时战斗状态
export const saveGame = (state: GameState) => {
    try {
        const dataToSave = {
            player: state.player,
            stage: state.stage,
            maxStage: state.maxStage,
            autoAdvance: state.autoAdvance,
            autoBattle: state.autoBattle,
            killCount: state.killCount,
            savedAt: Date.now()
        };
        localStorage.setItem(SAVE_KEY, JSON.stringify(dataToSave));
        return true;
    } catch (e) {
        console.error("Save failed:", e);
        return false;
    }
};

// 反序列化：合并存档数据与默认状态
export const loadGame = (initialState: GameState): GameState | null => {
    try {
        const savedString = localStorage.getItem(SAVE_KEY);
        if (!savedString) return null;

        const savedData = JSON.parse(savedString);
        
        // 简单的迁移逻辑：确保加载的技能树结构是最新的
        // 如果游戏更新了技能属性，我们需要保留玩家的等级，但使用新的数值配置
        const mergedSkills = INITIAL_SKILLS.map(defaultSkill => {
            const savedSkill = savedData.player.skills.find((s: any) => s.id === defaultSkill.id);
            if (savedSkill) {
                return {
                    ...defaultSkill,
                    level: savedSkill.level,
                    // 重新计算数值以防公式变更
                    damageMult: Number((defaultSkill.baseDamageMult + savedSkill.level * defaultSkill.growth.damage).toFixed(2)),
                    healMult: defaultSkill.baseHealMult !== undefined ? Number(((defaultSkill.baseHealMult || 0) + savedSkill.level * (defaultSkill.growth.heal || 0)).toFixed(2)) : undefined,
                    cooldown: Math.max(0.5, Number((defaultSkill.baseCooldown + savedSkill.level * (defaultSkill.growth.cooldown || 0)).toFixed(1)))
                };
            }
            return defaultSkill;
        });

        // 合并 Player 对象
        const mergedPlayer: Player = {
            ...initialState.player,
            ...savedData.player,
            skills: mergedSkills,
            // 重新计算面板，防止旧存档数值错误
            currentStats: initialState.player.currentStats // 将在 App 初始化时重新计算
        };

        return {
            ...initialState,
            player: mergedPlayer,
            stage: savedData.stage || 1,
            maxStage: savedData.maxStage || 1,
            autoAdvance: savedData.autoAdvance ?? true,
            killCount: 0, // 重新加载不保留当前击杀进度
            enemies: [], // 清空敌人
            isPlayerDead: false, // 读档默认存活
            view: 'COMBAT', // 默认进入战斗视图
            battleLog: [{ id: 'load', type: 'info', text: '游戏存档读取成功。', timestamp: Date.now() }]
        };

    } catch (e) {
        console.error("Load failed:", e);
        return null;
    }
};

export const hasSaveFile = (): boolean => {
    return !!localStorage.getItem(SAVE_KEY);
};

export const clearSave = () => {
    localStorage.removeItem(SAVE_KEY);
};