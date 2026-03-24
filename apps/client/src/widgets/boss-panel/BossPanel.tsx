import type { Boss } from '../../shared/types/game'
import styles from './BossPanel.module.css'

interface Props { boss: Boss }

const actionIcon: Record<string, string> = {
  attack: '⚔', status: '☽', attack_status: '⚔☽',
}

export function BossPanel({ boss }: Props) {
  const hpPct = (boss.hp / boss.maxHp) * 100
  const phaseColor = boss.phase === 1 ? 'var(--phase-1)' : 'var(--phase-2)'
  const statuses = (boss as any).statuses ?? []

  return (
    <div className={styles.panel}>
      <div className={styles.nameRow}>
        <span className={styles.phase} style={{ color: phaseColor }}>
          Phase {boss.phase}
        </span>
        <h2 className={styles.name}>{boss.name}</h2>
        <span className={styles.hp}>{boss.hp} / {boss.maxHp}</span>
      </div>

      <div className={styles.hpTrack}>
        <div className={styles.hpFill} style={{ width: `${hpPct}%`, background: phaseColor }} />
      </div>

      <div className={styles.footer}>
        <div className={styles.nextAction}>
          <span className={styles.actionLabel}>Next</span>
          <div className={styles.actionCard}>
            <span>{actionIcon[boss.nextAction.type] ?? '?'}</span>
            <span className={styles.actionName}>{boss.nextAction.label}</span>
            {boss.nextAction.damage && (
              <span className={styles.actionDmg}>−{boss.nextAction.damage} HP</span>
            )}
            {boss.nextAction.status && (
              <span className={styles.actionStatus}>
                {boss.nextAction.status.type} ×{boss.nextAction.status.stacks}
              </span>
            )}
            <span className={styles.actionTarget}>→ {boss.nextAction.target}</span>
          </div>
        </div>

        {statuses.length > 0 && (
          <div className={styles.statuses}>
            {statuses.map((s: any) => (
              <span key={s.type} className={`${styles.statusBadge} ${styles[s.type]}`}>
                {s.type} ×{s.stacks}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
