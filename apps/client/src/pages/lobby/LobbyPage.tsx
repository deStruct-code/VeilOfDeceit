import {useMemo, useState, useEffect, useRef} from "react";
import {useNavigate, useSearchParams} from "react-router-dom";
import {normalizeRoomCode} from "../../shared/lib/roomCode";
import {
    getPlayerName,
    savePlayerName,
    getOrGeneratePlayerName,
} from "../../shared/lib/playerName";
import {setRoomPlayerSlot, setAllyCardBack} from "../../shared/lib/playerSlot";
import {getOrCreatePlayerId} from "../../shared/lib/playerId";
import {createLobbySocket, type LobbyServerMessage} from "../../shared/lib/ws";
import {
    useCreateSoloGameMutation,
    useCreateRoomMutation,
} from "../../shared/api/gameApi";
import {useMe} from "../../shared/lib/useMe";
import {CardBackShowcase} from "../../features/select-card-back";
import {getSelectedCardBack} from "../../entities/card/model/cardBack";
import styles from "./LobbyPage.module.css";

const API_URL =
    (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "") ||
    "http://localhost:8000";

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

const WaitingSpinner = () => (
    <svg
        className={styles.spinner}
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 100 100"
        overflow="visible"
        fill="#c09ee0"
        stroke="#a07bc8"
    >
        <defs>
            <polygon id="ldr" points="20,40 28,55 12,55" />
        </defs>
        {[
            0.17, 0.33, 0.5, 0.67, 0.83, 1.0, 1.17, 1.33, 1.5, 1.67, 1.83, 2.0,
        ].map((begin, i) => (
            <use
                key={i}
                xlinkHref="#ldr"
                transform={`rotate(${(i + 1) * 30} 50 50)`}
            >
                <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="2s"
                    begin={`${begin}s`}
                    repeatCount="indefinite"
                />
                <animateTransform
                    attributeName="transform"
                    type="scale"
                    additive="sum"
                    dur="2s"
                    begin={`${begin}s`}
                    repeatCount="indefinite"
                    from="0"
                    to="1.2"
                />
            </use>
        ))}
    </svg>
);

type RoomState = "connecting" | "waiting" | "ready" | "error";

export function LobbyPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const {me, isLoading: isMeLoading, logout} = useMe();

    const [view, setView] = useState<"menu" | "cards" | "room">("menu");
    const [joinCode, setJoinCode] = useState("");
    const [nickname, setNickname] = useState("");
    const [authError, setAuthError] = useState(false);

    const [roomCode, setRoomCode] = useState("");
    const [roomState, setRoomState] = useState<RoomState>("connecting");
    const [playerCount, setPlayerCount] = useState(0);
    const [roomError, setRoomError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const wsRef = useRef<WebSocket | null>(null);
    const playerIdRef = useRef<string>(getOrCreatePlayerId());

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
        } else if (me) {
            setNickname(me.name);
            savePlayerName(me.name);
        } else {
            setNickname(getOrGeneratePlayerName());
        }
    }, [me]);

    useEffect(() => {
        if (view !== "room" || !roomCode) return;

        const ws = createLobbySocket();
        wsRef.current = ws;
        setRoomState("connecting");
        setRoomError(null);

        ws.addEventListener("open", () => {
            ws.send(
                JSON.stringify({
                    type: "join",
                    roomCode,
                    playerId: playerIdRef.current,
                    playerName: getOrGeneratePlayerName(),
                    cardBackId: getSelectedCardBack(),
                }),
            );
        });

        ws.addEventListener("message", (evt) => {
            let msg: LobbyServerMessage;
            try {
                msg = JSON.parse(String(evt.data));
            } catch {
                return;
            }

            if (msg.type === "error") {
                setRoomState("error");
                setRoomError(msg.message);
                return;
            }
            if (msg.type === "joined") {
                setPlayerCount(msg.playerCount);
                setRoomPlayerSlot(roomCode, msg.slot);
                if (msg.allyCardBackId)
                    setAllyCardBack(roomCode, msg.allyCardBackId);
                setRoomState(msg.playerCount >= 2 ? "ready" : "waiting");
                return;
            }
            if (msg.type === "ready") {
                setPlayerCount(msg.playerCount);
                if (msg.allyCardBackId)
                    setAllyCardBack(roomCode, msg.allyCardBackId);
                setRoomState("ready");
                navigate(`/game/${roomCode}`);
            }
        });

        ws.addEventListener("close", () => {
            setRoomState((prev) => (prev === "ready" ? prev : "error"));
            setRoomError((prev) => prev ?? "Соединение закрыто.");
        });

        ws.addEventListener("error", () => {
            setRoomState("error");
            setRoomError("Ошибка соединения.");
        });

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [view, roomCode]);

    function handleNicknameBlur() {
        if (me) return;
        const trimmed = nickname.trim().slice(0, 24);
        if (trimmed) {
            savePlayerName(trimmed);
            setNickname(trimmed);
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
        try {
            const {code: gameId} = await createRoom().unwrap();
            await createSoloGame({
                gameId,
                playerName: trimmed || getOrGeneratePlayerName(),
            }).unwrap();
            setRoomPlayerSlot(gameId, "player-1");
            navigate(`/game/${gameId}`);
        } catch (err) {
            console.error("[solo]", err);
        }
    }

    async function handleCreateDuoRoom() {
        const trimmed = nickname.trim().slice(0, 24);
        if (trimmed) savePlayerName(trimmed);
        try {
            const {code} = await createRoom().unwrap();
            setRoomCode(code);
            setPlayerCount(0);
            setRoomState("connecting");
            setRoomError(null);
            setView("room");
        } catch (err) {
            console.error("[create-room]", err);
        }
    }

    function handleBackToMenu() {
        wsRef.current?.close();
        wsRef.current = null;
        setView("menu");
    }

    function handleShare() {
        navigator.clipboard
            .writeText(`${window.location.origin}/room/${roomCode}`)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
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

    const isFlipped = view === "room";

    const pillClass =
        roomState === "ready"
            ? `${styles.pill} ${styles.pillReady}`
            : roomState === "error"
              ? `${styles.pill} ${styles.pillError}`
              : styles.pill;

    const pillText = {
        connecting: "подключение...",
        waiting: `ожидание ( ${playerCount} / 2 )`,
        ready: `готово ( ${playerCount} / 2 )`,
        error: "ошибка",
    }[roomState];

    const statusText = {
        connecting: "Создаём связь с сервером.",
        waiting: "Ждём второго игрока. Отправь ему этот код.",
        ready: "Сессия стартует...",
        error: roomError ?? "Неизвестная ошибка.",
    }[roomState];

    return (
        <div className={styles.page}>
            <div className={styles.atmoVignette} />
            <div className={styles.atmoTop} />
            <div className={styles.atmoBottom} />
            <div className={styles.atmoNoise} />

            <div className={styles.scene}>
                <div
                    className={`${styles.cardInner} ${isFlipped ? styles.cardInnerFlipped : ""}`}
                >
                    {/* ── FRONT: Lobby ── */}
                    <div className={`${styles.cardFace} ${styles.cardFront}`}>
                        <CornerDecor pos="tl" />
                        <CornerDecor pos="tr" />
                        <CornerDecor pos="bl" />
                        <CornerDecor pos="br" />

                        <div className={styles.titleBlock}>
                            <div className={styles.titleRow}>
                                <RuneSymbol />
                                <div className={styles.titleTexts}>
                                    <span className={styles.titleEyebrow}>
                                        A new card game
                                    </span>
                                    <h1 className={styles.title}>
                                        VEIL OF DECEIT
                                    </h1>
                                </div>
                                <RuneSymbol />
                            </div>
                            <p className={styles.subtitle}>
                                Вуаль Обмана. <br /> Сражайся с боссами и не
                                верь никому.
                            </p>
                        </div>

                        <DiamondDivider />

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
                                <button
                                    className={styles.logoutBtn}
                                    onClick={logout}
                                >
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
                                    <GoogleIcon /> Войти через Google
                                </button>
                            </div>
                        )}

                        <div className={styles.section}>
                            <label className={styles.label}>Имя героя</label>
                            <div className={styles.nicknameRow}>
                                <input
                                    className={styles.input}
                                    value={nickname}
                                    onBlur={handleNicknameBlur}
                                    onKeyDown={(e) =>
                                        e.key === "Enter" &&
                                        handleNicknameBlur()
                                    }
                                    placeholder="Введи свой никнейм..."
                                    maxLength={24}
                                    autoCorrect="off"
                                    spellCheck={false}
                                    onChange={(e) =>
                                        setNickname(e.target.value)
                                    }
                                />
                            </div>
                        </div>

                        <div className={styles.buttons}>
                            <button
                                className={styles.btnSolo}
                                onClick={handleSoloGame}
                                // disabled={isBusy}
                                disabled={true}
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
                                {isCreatingRoom
                                    ? "Создание..."
                                    : "Играть вдвоём"}
                            </button>
                        </div>

                        <DiamondDivider />

                        <div className={styles.section}>
                            <label className={styles.labelPurple}>
                                Код приглашения
                            </label>
                            <div className={styles.inputRow}>
                                <input
                                    className={styles.inputCode}
                                    value={joinCode}
                                    onChange={(e) =>
                                        setJoinCode(
                                            e.target.value.toUpperCase(),
                                        )
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
                                    onClick={() =>
                                        handleEnterRoom(normalizedJoinCode)
                                    }
                                >
                                    Войти
                                </button>
                            </div>
                        </div>

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

                        <button
                            className={styles.cardBacksLink}
                            onClick={() => setView("cards")}
                        >
                            ✦ Рубашки колоды ✦
                        </button>
                    </div>

                    {/* ── BACK: Room waiting ── */}
                    <div className={`${styles.cardFace} ${styles.cardBack}`}>
                        <CornerDecor pos="tl" />
                        <CornerDecor pos="tr" />
                        <CornerDecor pos="bl" />
                        <CornerDecor pos="br" />

                        <div className={styles.titleBlock}>
                            <div className={styles.titleRow}>
                                <RuneSymbol />
                                <div className={styles.titleTexts}>
                                    <span className={styles.titleEyebrow}>
                                        Комната ожидания
                                    </span>
                                    <h1
                                        className={`${styles.title} ${styles.titleCode}`}
                                    >
                                        {roomCode || "······"}
                                    </h1>
                                </div>
                                <RuneSymbol />
                            </div>
                        </div>

                        <div
                            style={{display: "flex", justifyContent: "center"}}
                        >
                            <div className={pillClass}>{pillText}</div>
                        </div>

                        <DiamondDivider />

                        <div className={styles.slots}>
                            <div
                                className={`${styles.slot} ${playerCount >= 1 ? styles.slotFilled : styles.slotEmpty}`}
                            >
                                {playerCount >= 1
                                    ? getPlayerName() || "Игрок I"
                                    : "ожидание..."}
                            </div>
                            <div
                                className={`${styles.slot} ${playerCount >= 2 ? styles.slotFilled : styles.slotEmpty}`}
                            >
                                {playerCount >= 2 ? "Игрок II" : "ожидание..."}
                            </div>
                        </div>

                        <p
                            className={`${styles.status} ${roomState === "error" ? styles.statusError : ""}`}
                        >
                            {roomState === "waiting" && <WaitingSpinner />}
                            {statusText}
                        </p>

                        <DiamondDivider />

                        <div className={styles.buttons}>
                            {roomState === "waiting" && (
                                <button
                                    className={`${styles.btnSolo} ${copied ? styles.btnCopied : ""}`}
                                    onClick={handleShare}
                                >
                                    {copied ? "✓ Скопировано" : "Поделиться"}
                                </button>
                            )}
                            <button
                                className={styles.btnDuo}
                                onClick={handleBackToMenu}
                            >
                                ← Назад
                            </button>
                            {roomState === "ready" && (
                                <button
                                    className={styles.btnSolo}
                                    onClick={() =>
                                        navigate(`/game/${roomCode}`)
                                    }
                                >
                                    Войти в игру
                                </button>
                            )}
                        </div>

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
                    </div>
                </div>
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
