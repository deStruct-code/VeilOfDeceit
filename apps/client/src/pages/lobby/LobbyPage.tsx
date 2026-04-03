import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { normalizeRoomCode } from '../../shared/lib/roomCode'
import {
    getPlayerName,
    savePlayerName,
    getOrGeneratePlayerName,
} from '../../shared/lib/playerName'
import { setRoomPlayerSlot } from '../../shared/lib/playerSlot'
import {
    useCreateSoloGameMutation,
    useCreateRoomMutation,
} from '../../shared/api/gameApi'
import { useMe } from '../../shared/lib/useMe'
import { CardBackShowcase } from '../../features/select-card-back'
import { getSelectedCardBack } from '../../entities/card/model/cardBack'
import { LobbyCard } from '../../widgets/lobby-card'
import {
    RuneSymbol,
    DiamondDivider,
    CornerDecor,
    RuneFooter,
} from '../../shared/ui/lobby-decor'
import styles from './LobbyPage.module.css'

const API_URL =
    (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '') ||
    'http://localhost:8000'

export function LobbyPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { me, isLoading: isMeLoading, logout } = useMe()

    const [view, setView] = useState<'menu' | 'cards' | 'room'>('menu')
    const [joinCode, setJoinCode] = useState('')
    const [nickname, setNickname] = useState('')
    const [authError, setAuthError] = useState(false)
    const [roomCode, setRoomCode] = useState('')

    const [createSoloGame, { isLoading: isSoloLoading }] = useCreateSoloGameMutation()
    const [createRoom, { isLoading: isCreatingRoom }] = useCreateRoomMutation()

    const normalizedJoinCode = useMemo(
        () => normalizeRoomCode(joinCode).slice(0, 6),
        [joinCode],
    )
    const canJoin = normalizedJoinCode.length === 6

    useEffect(() => {
        if (searchParams.get('auth') === 'error') setAuthError(true)
        const joinParam = searchParams.get('join')
        if (joinParam) {
            const code = normalizeRoomCode(joinParam).slice(0, 6)
            if (code.length === 6) {
                setRoomCode(code)
                setView('room')
            }
        }
    }, [])

    useEffect(() => {
        const saved = getPlayerName()
        if (saved) {
            setNickname(saved)
        } else if (me) {
            setNickname(me.name)
            savePlayerName(me.name)
        } else {
            setNickname(getOrGeneratePlayerName())
        }
    }, [me])

    function handleNicknameBlur() {
        if (me) return
        const trimmed = nickname.trim().slice(0, 24)
        if (trimmed) {
            savePlayerName(trimmed)
            setNickname(trimmed)
        }
    }

    function handleEnterRoom(code: string) {
        const trimmed = nickname.trim().slice(0, 24)
        if (trimmed) savePlayerName(trimmed)
        setRoomCode(code)
        setView('room')
    }

    async function handleSoloGame() {
        const trimmed = nickname.trim().slice(0, 24)
        if (trimmed) savePlayerName(trimmed)
        try {
            const { code: gameId } = await createRoom().unwrap()
            await createSoloGame({
                gameId,
                playerName: trimmed || getOrGeneratePlayerName(),
            }).unwrap()
            setRoomPlayerSlot(gameId, 'player-1')
            navigate(`/game/${gameId}`)
        } catch (err) {
            console.error('[solo]', err)
        }
    }

    async function handleCreateDuoRoom() {
        const trimmed = nickname.trim().slice(0, 24)
        if (trimmed) savePlayerName(trimmed)
        try {
            const { code } = await createRoom().unwrap()
            setRoomCode(code)
            setView('room')
        } catch (err) {
            console.error('[create-room]', err)
        }
    }

    const isBusy = isSoloLoading || isCreatingRoom

    if (view === 'cards') {
        return (
            <CardBackShowcase
                initialSelected={getSelectedCardBack()}
                onBack={() => setView('menu')}
            />
        )
    }

    const menuFront = (
        <>
            <CornerDecor pos="tl" />
            <CornerDecor pos="tr" />
            <CornerDecor pos="bl" />
            <CornerDecor pos="br" />

            <div className={styles.titleBlock}>
                <div className={styles.titleRow}>
                    <RuneSymbol />
                    <div className={styles.titleTexts}>
                        <span className={styles.titleEyebrow}>A new card game</span>
                        <h1 className={styles.title}>VEIL OF DECEIT</h1>
                    </div>
                    <RuneSymbol />
                </div>
                <p className={styles.subtitle}>
                    Вуаль Обмана. <br /> Сражайся с боссами и не верь никому.
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
                        <span className={styles.accountName}>{me.name}</span>
                        <span className={styles.accountEmail}>{me.email}</span>
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
                        onClick={() => { window.location.href = `${API_URL}/auth/google` }}
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
                        onKeyDown={(e) => e.key === 'Enter' && handleNicknameBlur()}
                        placeholder="Введи свой никнейм..."
                        maxLength={24}
                        autoCorrect="off"
                        spellCheck={false}
                        onChange={(e) => setNickname(e.target.value)}
                    />
                </div>
            </div>

            <div className={styles.buttons}>
                <button className={styles.btnSolo} onClick={handleSoloGame} disabled={true}>
                    <svg viewBox="0 0 20 20" width="15" height="15" fill="none" style={{ opacity: 0.8 }}>
                        <circle cx="10" cy="7" r="4" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M3 18c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    {isBusy && !isCreatingRoom ? 'Загрузка...' : 'Играть соло'}
                </button>
                <button className={styles.btnDuo} onClick={handleCreateDuoRoom} disabled={isBusy}>
                    <svg viewBox="0 0 24 20" width="18" height="15" fill="none" style={{ opacity: 0.8 }}>
                        <circle cx="8" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.3" />
                        <circle cx="16" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.3" />
                        <path d="M1 18c0-3.314 3.134-6 7-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M23 18c0-3.314-3.134-6-7-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M8 12c1.1-.4 2.2-.6 3.5-.6s2.4.2 3.5.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                        <path d="M8 12c0 3 2 6 4 6s4-3 4-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    {isCreatingRoom ? 'Создание...' : 'Играть вдвоём'}
                </button>
            </div>

            <DiamondDivider />

            <div className={styles.section}>
                <label className={styles.labelPurple}>Код приглашения</label>
                <div className={styles.inputRow}>
                    <input
                        className={styles.inputCode}
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
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

            <RuneFooter />

            <button className={styles.cardBacksLink} onClick={() => setView('cards')}>
                ✦ Рубашки колоды ✦
            </button>
        </>
    )

    return (
        <div className={styles.page}>
            <div className={styles.atmoVignette} />
            <div className={styles.atmoTop} />
            <div className={styles.atmoBottom} />
            <div className={styles.atmoNoise} />

            <div className={styles.scene}>
                <LobbyCard
                    roomCode={roomCode}
                    flipped={view === 'room'}
                    onBack={() => setView('menu')}
                    front={menuFront}
                />
            </div>
        </div>
    )
}

function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" />
            <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" />
        </svg>
    )
}
