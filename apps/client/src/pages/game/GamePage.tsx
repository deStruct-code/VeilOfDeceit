import {useState, useEffect, useMemo} from "react";
import {useParams} from "react-router-dom";
import {
    useGetGameQuery,
    useSubmitActionMutation,
    useResetGameMutation,
} from "../../shared/api/gameApi";
import {BossPanel} from "../../widgets/boss-panel/BossPanel";
import {PlayerHand} from "../../widgets/player-hand/PlayerHand";
import {SubmitAction} from "../../features/submit-action/SubmitAction";
import {RevealOverlay} from "../../widgets/reveal-overlay/RevealOverlay";
import {getRoomPlayerSlot} from "../../shared/lib/playerSlot";
import styles from "./GamePage.module.css";

export function GamePage() {
    const params = useParams();
    const gameId = useMemo(
        () => String(params.code ?? "").toUpperCase(),
        [params.code],
    );
    const localPlayerId = useMemo(
        () => getRoomPlayerSlot(gameId) ?? "player-1",
        [gameId],
    );

    const {
        data: game,
        isLoading,
        isError,
    } = useGetGameQuery(gameId, {pollingInterval: 1000});
    const [resetGame] = useResetGameMutation();

    const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
    const [showOverlay, setShowOverlay] = useState(false);
    const [prevPhase, setPrevPhase] = useState<string | null>(null);

    // Show overlay when phase changes away from 'action'
    useEffect(() => {
        if (!game) return;
        if (game.phase !== "action" && game.phase !== prevPhase) {
            setShowOverlay(true);
        }
        setPrevPhase(game.phase);
        // Reset card selection when new turn starts
        if (game.phase === "action" && prevPhase && prevPhase !== "action") {
            setSelectedCardIds([]);
        }
    }, [game?.phase]);

    const handleContinue = async () => {
        if (!game) return;
        if (game.phase === "defeat" || game.phase === "victory") {
            await resetGame({gameId});
            setSelectedCardIds([]);
        }
        setShowOverlay(false);
    };
    const handleSelect = (cardId: string) => {
        const card = localPlayer.hand.find((c) => c.id === cardId);
        if (!card) return;

        setSelectedCardIds((prev) => {
            const already = prev.includes(cardId);

            // снять выбор
            if (already) {
                return prev.filter((id) => id !== cardId);
            }

            // считаем текущую энергию
            const selectedCards = localPlayer.hand.filter((c) =>
                prev.includes(c.id),
            );
            const usedEnergy = selectedCards.reduce(
                (sum, c) => sum + c.cost,
                0,
            );

            // ❗ проверка энергии
            if (usedEnergy + card.cost > localPlayer.energy) {
                return prev;
            }

            return [...prev, cardId];
        });
    };

    if (isLoading)
        return (
            <div className={styles.loading}>
                Entering the void<span className={styles.dots}>...</span>
            </div>
        );
    if (isError || !game)
        return (
            <div className={styles.loading}>Failed to reach the server.</div>
        );

    const localPlayer = game.players.find((p) => p.id === localPlayerId)!;
    const allyPlayer = game.players.find((p) => p.id !== localPlayerId)!;
    const recentLogs = [...game.log].slice(-3);

    return (
        <div className={styles.layout}>
            <header className={styles.header}>
                <span className={styles.turnLabel}>Turn {game.turn}</span>
                <span className={`${styles.phase} ${styles[game.phase]}`}>
                    {game.phase.replace("_", " ")}
                </span>
                <button
                    className={styles.resetBtn}
                    onClick={async () => {
                        await resetGame({gameId});
                        setSelectedCardIds([]);
                    }}
                >
                    ↺
                </button>
            </header>

            <BossPanel boss={game.boss} />

            <div className={styles.log}>
                {recentLogs.map((entry, i) => (
                    <p
                        key={i}
                        className={`${styles.logEntry} ${styles[entry.type ?? "system"]}`}
                    >
                        <span className={styles.logTurn}>T{entry.turn}</span>
                        {entry.text}
                    </p>
                ))}
            </div>

            <div className={styles.hands}>
                <PlayerHand
                    player={allyPlayer}
                    isLocal={false}
                    selectedCardIds={[]}
                    onSelect={() => {}}
                />
                <PlayerHand
                    player={localPlayer}
                    isLocal={true}
                    selectedCardIds={selectedCardIds}
                    onSelect={handleSelect}
                />
            </div>

            <SubmitAction
                game={game}
                selectedCardIds={selectedCardIds}
                playerId={localPlayerId}
            />

            {showOverlay && (
                <RevealOverlay
                    game={game}
                    localPlayerId={localPlayerId}
                    onContinue={handleContinue}
                />
            )}
        </div>
    );
}
