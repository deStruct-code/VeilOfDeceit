import {useMemo, useState, useEffect} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {normalizeRoomCode} from "../../shared/lib/roomCode";
import {
    getPlayerName,
    savePlayerName,
    getOrGeneratePlayerName,
} from "../../shared/lib/playerName";
import {setRoomPlayerSlot} from "../../shared/lib/playerSlot";
import {
    useCreateSoloGameMutation,
    useCreateRoomMutation,
} from "../../shared/api/gameApi";
import {useMe} from "../../shared/lib/useMe";
import {CardBackShowcase} from "../../features/select-card-back";
import styles from "./LobbyPage.module.css";
import {getSelectedCardBack} from "@/entities/card/cardBack";

const API_URL =
    (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "") ||
    "http://localhost:8000";

// ── Decorative SVG components ─────────────────────────────────────

const RuneSymbol = ({className}: {className?: string}) => (
    <svg
        viewBox="0 0 40 40"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
    >
        <path
            d="M20 4 L20 36 M8 12 L32 12 M8 28 L32 28 M8 12 L20 4 L32 12 M8 28 L20 36 L32 28"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
        />
    </svg>
);

const DiamondDivider = () => (
    <div className={styles.divider}>
        <div className={`${styles.dividerLine} ${styles.dividerLineLeft}`} />
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none">
            <path
                d="M8 1 L15 8 L8 15 L1 8 Z"
                stroke="rgba(180,130,60,0.7)"
                strokeWidth="1"
                fill="rgba(180,130,60,0.15)"
            />
        </svg>
        <div className={`${styles.dividerLine} ${styles.dividerLineRight}`} />
    </div>
);

const CornerDecor = ({pos}: {pos: "tl" | "tr" | "bl" | "br"}) => {
    const rotate = {tl: "0deg", tr: "90deg", br: "180deg", bl: "270deg"}[pos];
    return (
        <svg
            viewBox="0 0 32 32"
            width="32"
            height="32"
            fill="none"
            style={{
                transform: `rotate(${rotate})`,
                position: "absolute",
                top: pos === "tl" || pos === "tr" ? 0 : undefined,
                bottom: pos === "bl" || pos === "br" ? 0 : undefined,
                left: pos === "tl" || pos === "bl" ? 0 : undefined,
                right: pos === "tr" || pos === "br" ? 0 : undefined,
            }}
        >
            <path
                d="M2 2 L2 14 M2 2 L14 2"
                stroke="rgba(180,130,60,0.55)"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
};

// ── Main component ────────────────────────────────────────────────

export function LobbyPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {me, isLoading: isMeLoading, logout} = useMe();

    const [view, setView] = useState<"menu" | "cards">("menu");
    const [joinCode, setJoinCode] = useState("");
    const [nickname, setNickname] = useState("");
    const [nicknameSaved, setNicknameSaved] = useState(false);
    const [authError, setAuthError] = useState(false);

    const [createSoloGame, {isLoading: isSoloLoading}] =
        useCreateSoloGameMutation();
    const [createRoom, {isLoading: isCreatingRoom}] = useCreateRoomMutation();

    const normalizedJoinCode = useMemo(
        () => normalizeRoomCode(joinCode).slice(0, 6),
        [joinCode],
    );
    const canJoin = normalizedJoinCode.length === 6;

    useEffect(() => {
        if (searchParams.get("auth") === "error") setAuthError(true);
    }, [searchParams]);

    useEffect(() => {
        const saved = getPlayerName();
        if (saved) {
            setNickname(saved);
            setNicknameSaved(true);
        } else if (me) {
            setNickname(me.name);
            savePlayerName(me.name);
            setNicknameSaved(true);
        } else {
            setNickname(getOrGeneratePlayerName());
            setNicknameSaved(false);
        }
    }, [me]);

    function handleNicknameBlur() {
        if (me) return;
        const trimmed = nickname.trim().slice(0, 24);
        if (trimmed) {
            savePlayerName(trimmed);
            setNickname(trimmed);
            setNicknameSaved(true);
        }
    }

    function handleEnterRoom(code: string) {
        const trimmed = nickname.trim().slice(0, 24);
        if (trimmed) savePlayerName(trimmed);
        navigate(`/room/${code}`);
    }

    async function handleSoloGame() {
        const trimmed = nickname.trim().slice(0, 24);
        if (trimmed) savePlayerName(trimmed);
        const playerName = trimmed || getOrGeneratePlayerName();
        try {
            const {code: gameId} = await createRoom().unwrap();
            await createSoloGame({gameId, playerName}).unwrap();
            setRoomPlayerSlot(gameId, "player-1");
            navigate(`/game/${gameId}`);
        } catch (err) {
            console.error("[solo]", err);
        }
    }

    async function handleCreateDuoRoom() {
        try {
            const {code} = await createRoom().unwrap();
            handleEnterRoom(code);
        } catch (err) {
            console.error("[create-room]", err);
        }
    }

    const isBusy = isSoloLoading || isCreatingRoom;

    if (view === "cards") {
        return (
            <CardBackShowcase
                initialSelected={getSelectedCardBack()}
                onBack={() => setView("menu")}
            />
        );
    }

    return (
        <div className={styles.page}>
            {/* Atmospheric background */}
            <div className={styles.atmoVignette} />
            <div className={styles.atmoTop} />
            <div className={styles.atmoBottom} />
            <div className={styles.atmoNoise} />

            {/* Main card */}
            <div className={styles.card}>
                <CornerDecor pos="tl" />
                <CornerDecor pos="tr" />
                <CornerDecor pos="bl" />
                <CornerDecor pos="br" />

                {/* Title */}
                <div className={styles.titleBlock}>
                    <div className={styles.titleRow}>
                        <RuneSymbol />
                        <div className={styles.titleTexts}>
                            <span className={styles.titleEyebrow}>
                                A new card game
                            </span>
                            <h1 className={styles.title}>VEIL OF DECEIT</h1>
                        </div>
                        <RuneSymbol />
                    </div>
                    <p className={styles.subtitle}>
                        Вуаль Обмана. <br /> Сражайся с боссами и не верь никому.
                    </p>
                </div>

                <DiamondDivider />

                {/* Account */}
                {isMeLoading ? (
                    <div className={styles.accountLoading}>...</div>
                ) : me ? (
                    <div className={styles.account}>
                        {me.avatar && (
                            <img
                                src={me.avatar}
                                alt={me.name}
                                className={styles.avatar}
                                referrerPolicy="no-referrer"
                            />
                        )}
                        <div className={styles.accountInfo}>
                            <span className={styles.accountName}>
                                {me.name}
                            </span>
                            <span className={styles.accountEmail}>
                                {me.email}
                            </span>
                        </div>
                        <button className={styles.logoutBtn} onClick={logout}>
                            Выйти
                        </button>
                    </div>
                ) : (
                    <div className={styles.authBlock}>
                        {authError && (
                            <p className={styles.authError}>
                                Ошибка авторизации. Попробуй снова.
                            </p>
                        )}
                        <button
                            className={styles.googleBtn}
                            onClick={() => {
                                window.location.href = `${API_URL}/auth/google`;
                            }}
                        >
                            <GoogleIcon />
                            Войти через Google
                        </button>
                    </div>
                )}

                {/* Nickname */}
                <div className={styles.section}>
                    <label className={styles.label}>Имя героя</label>
                    <div className={styles.nicknameRow}>
                        <input
                            className={styles.input}
                            value={nickname}
                            onBlur={handleNicknameBlur}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleNicknameBlur()
                            }
                            placeholder="Введи свой никнейм..."
                            maxLength={24}
                            autoCorrect="off"
                            spellCheck={false}
                            onChange={(e) => {
                                setNickname(e.target.value);
                                setNicknameSaved(false);
                            }}
                        />
                    </div>
                </div>

                {/* Game buttons */}
                <div className={styles.buttons}>
                    <button
                        className={styles.btnSolo}
                        onClick={handleSoloGame}
                        disabled={isBusy}
                    >
                        <svg
                            viewBox="0 0 20 20"
                            width="15"
                            height="15"
                            fill="none"
                            style={{opacity: 0.8}}
                        >
                            <circle
                                cx="10"
                                cy="7"
                                r="4"
                                stroke="currentColor"
                                strokeWidth="1.3"
                            />
                            <path
                                d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7"
                                stroke="currentColor"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                            />
                        </svg>
                        {isBusy && !isCreatingRoom
                            ? "Загрузка..."
                            : "Играть соло"}
                    </button>
                    <button
                        className={styles.btnDuo}
                        onClick={handleCreateDuoRoom}
                        disabled={isBusy}
                    >
                        <svg
                            viewBox="0 0 24 20"
                            width="18"
                            height="15"
                            fill="none"
                            style={{opacity: 0.8}}
                        >
                            <circle
                                cx="8"
                                cy="7"
                                r="3.5"
                                stroke="currentColor"
                                strokeWidth="1.3"
                            />
                            <circle
                                cx="16"
                                cy="7"
                                r="3.5"
                                stroke="currentColor"
                                strokeWidth="1.3"
                            />
                            <path
                                d="M1 18c0-3.314 3.134-6 7-6"
                                stroke="currentColor"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                            />
                            <path
                                d="M23 18c0-3.314-3.134-6-7-6"
                                stroke="currentColor"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                            />
                            <path
                                d="M8 12c1.1-.4 2.2-.6 3.5-.6s2.4.2 3.5.6"
                                stroke="currentColor"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                            />
                            <path
                                d="M8 12c0 3 2 6 4 6s4-3 4-6"
                                stroke="currentColor"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                            />
                        </svg>
                        {isCreatingRoom ? "Создание..." : "Играть вдвоём"}
                    </button>
                </div>

                <DiamondDivider />

                {/* Join by code */}
                <div className={styles.section}>
                    <label className={styles.labelPurple}>
                        Код приглашения
                    </label>
                    <div className={styles.inputRow}>
                        <input
                            className={styles.inputCode}
                            value={joinCode}
                            onChange={(e) =>
                                setJoinCode(e.target.value.toUpperCase())
                            }
                            placeholder="XXX-XXX"
                            inputMode="text"
                            autoCapitalize="characters"
                            autoCorrect="off"
                            spellCheck={false}
                            maxLength={6}
                        />
                        <button
                            className={styles.btnJoin}
                            disabled={!canJoin}
                            onClick={() => handleEnterRoom(normalizedJoinCode)}
                        >
                            Войти
                        </button>
                    </div>
                </div>

                {/* Footer runes */}
                <div className={styles.runes}>
                    {["ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ"].map((r, i) => (
                        <span
                            key={i}
                            className={`${styles.rune} ${i === 2 ? styles.runeMid : styles.runeOuter}`}
                        >
                            {r}
                        </span>
                    ))}
                </div>

                {/* Card backs link — не трогаем */}
                <button
                    className={styles.cardBacksLink}
                    onClick={() => setView("cards")}
                >
                    ✦ Рубашки колоды ✦
                </button>
            </div>
        </div>
    );
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" style={{flexShrink: 0}}>
            <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
            />
            <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
            />
            <path
                fill="#FBBC05"
                d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"
            />
            <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
            />
        </svg>
    );
}
