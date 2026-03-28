import type {GameState} from "@veil/shared";
import {useSubmitActionMutation} from "../../shared/api/gameApi";
import styles from "./SubmitAction.module.css";

interface Props {
    game: GameState;
    selectedCardIds: string[];
    playerId: string;
    onSkip: () => void;
}

export function SubmitAction({game, selectedCardIds, playerId, onSkip}: Props) {
    const [submitAction, {isLoading}] = useSubmitActionMutation();
    const me = game.players.find((p) => p.id === playerId)!;
    const ally = game.players.find((p) => p.id !== playerId)!;

    const canSubmit = !me.submitted && !isLoading;

    const handleSubmit = async (cardIds: string[]) => {
        if (!canSubmit) return;
        await submitAction({gameId: game.id, playerId, cardIds});
    };

    return (
        <div className={styles.zone}>
            <div className={styles.allyStatus}>
                <div
                    className={`${styles.dot} ${ally.submitted ? styles.dotReady : styles.dotWaiting}`}
                />
                <span className={styles.statusText}>
                    {ally.submitted
                        ? `${ally.name} is ready`
                        : `${ally.name} is thinking...`}
                </span>
            </div>

            <div style={{display: "flex", gap: "0.5rem"}}>
                <button
                    className={`${styles.submitBtn} ${me.submitted ? styles.submitted : ""} ${!canSubmit || selectedCardIds.length === 0 ? styles.idle : ""}`}
                    onClick={() => handleSubmit(selectedCardIds)}
                    disabled={!canSubmit || selectedCardIds.length === 0}
                >
                    {isLoading
                        ? "Resolving..."
                        : me.submitted
                          ? "✓ Committed"
                          : selectedCardIds.length > 0
                            ? "Commit"
                            : "Pick cards"}
                </button>

                {!me.submitted && (
                    <button
                        onClick={onSkip}
                        disabled={me.submitted || isLoading}
                    >
                        Skip
                    </button>
                )}
            </div>
        </div>
    );
}
