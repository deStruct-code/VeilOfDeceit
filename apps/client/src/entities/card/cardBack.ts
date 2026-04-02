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
}

export const CARD_BACKS: CardBackDef[] = [
    {
        id: "veil-mandala",
        name: "РУННАЯ",
        subtitle: "Мандала & Золото",
        accent: "#e8c97a",
        accent2: "#d4a8ff",
    },
    {
        id: "bloodpact",
        name: "КРОВАВЫЙ ПАКТ",
        subtitle: "Чешуя & Бронза",
        accent: "#c07030",
        accent2: "#8b0020",
    },
    {
        id: "dead-star",
        name: "МЁРТВАЯ ЗВЕЗДА",
        subtitle: "Бездна & Бирюза",
        accent: "#0a9880",
        accent2: "#c0b898",
    },
    {
        id: "iron-wraith",
        name: "ЖЕЛЕЗНЫЙ ПРИЗРАК",
        subtitle: "Сталь & Кровь",
        accent: "#9090a8",
        accent2: "#800018",
    },
];

const STORAGE_KEY = "veil.cardBack";

export function getSelectedCardBack(): CardBackId {
    return (localStorage.getItem(STORAGE_KEY) as CardBackId) ?? "veil-mandala";
}

export function saveSelectedCardBack(id: CardBackId): void {
    localStorage.setItem(STORAGE_KEY, id);
}
