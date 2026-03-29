import type { CardBackId } from '../../model/cardBack'
import { CardBackVeilMandala } from './CardBackVeilMandala'
import { CardBackBloodpact } from './CardBackBloodpact'
import { CardBackDeadStar } from './CardBackDeadStar'
import { CardBackIronWraith } from './CardBackIronWraith'

export const CARD_BACK_COMPONENTS: Record<CardBackId, () => JSX.Element> = {
  'veil-mandala': CardBackVeilMandala,
  'bloodpact':    CardBackBloodpact,
  'dead-star':    CardBackDeadStar,
  'iron-wraith':  CardBackIronWraith,
}
