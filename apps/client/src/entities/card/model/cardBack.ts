export interface UnlockCondition {
    bossId: string; // ID босса (skeleton, lich, ghoul и т.д.)
    requiredWins: number; // Сколько раз нужно победить
}

export type CardBackId =
    | "veil-mandala"
    | "bloodpact"
    | "dead-star"
    | "iron-wraith";

export interface CardBackDef {
    id: CardBackId;
    name: string;
    subtitle: string;
    accent: string;
    accent2: string;
    isLocked: boolean;
    openWhen: string;
    unlockCriteria?: UnlockCondition;
    rarity?: string;
    source?: string;
}

export const CARD_BACKS: CardBackDef[] = [
    {
        id: "veil-mandala",
        name: "ЗАВЕСА РУННАЯ",
        subtitle: "Мандала & Золото",
        accent: "#e8c97a",
        accent2: "#d4a8ff",
        isLocked: false,
        openWhen: "Регистрация",
    },
    {
        id: "bloodpact",
        name: "КРОВАВЫЙ ПАКТ",
        subtitle: "Чешуя & Бронза",
        accent: "#c07030",
        accent2: "#8b0020",
        isLocked: false,
        openWhen: "Победите 10 раз Скелета",
    },
    {
        id: "dead-star",
        name: "МЁРТВАЯ ЗВЕЗДА",
        subtitle: "Бездна & Бирюза",
        accent: "#0a9880",
        accent2: "#c0b898",
        isLocked: false,
        openWhen: "Победите 10 раз Гуля",
    },
    {
        id: "iron-wraith",
        name: "ЖЕЛЕЗНЫЙ ПРИЗРАК",
        subtitle: "Сталь & Кровь",
        accent: "#9090a8",
        accent2: "#800018",
        isLocked: false,
        openWhen: "Победите 10 раз Лича",
    },
];

const STORAGE_KEY = "veil.cardBack";

export function getSelectedCardBack(): CardBackId {
    return (localStorage.getItem(STORAGE_KEY) as CardBackId) ?? "veil-mandala";
}

export function saveSelectedCardBack(id: CardBackId): void {
    localStorage.setItem(STORAGE_KEY, id);
}

// Пример логики на бэкенде или в модели
function canUnlock(userStats: any, card: CardBackDef): boolean {
    if (!card.unlockCriteria) return true;
    
    const { bossId, requiredWins } = card.unlockCriteria;
    const actualWins = userStats.bossDefeats[bossId] || 0;
    
    return actualWins >= requiredWins;
}