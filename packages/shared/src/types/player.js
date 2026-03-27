"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PLAYER_DEFAULTS = exports.DEBUFF_TYPES = exports.BUFF_TYPES = exports.MAX_DEBUFFS = exports.MAX_BUFFS = void 0;
// ─── Status constraints ───────────────────────────────────────────────────────
exports.MAX_BUFFS = 3;
exports.MAX_DEBUFFS = 3;
// Какие статусы считаются баффами, какие дебаффами
exports.BUFF_TYPES = ['strength', 'regen', 'shield'];
exports.DEBUFF_TYPES = ['poison', 'weakness',];
// ─── Defaults ────────────────────────────────────────────────────────────────
exports.PLAYER_DEFAULTS = {
    maxHp: 50,
    handLimit: 7,
    startCards: 3, // сколько карт тянуть в начале игры
    maxEnergy: 10,
};
//# sourceMappingURL=player.js.map