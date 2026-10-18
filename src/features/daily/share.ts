import { RULE_NAME } from '../game/rules';
import { LinkRule } from '../game/types';
import { DateKey, formatDateKey } from './dateKey';

export interface ShareInput {
  dateKey: DateKey;
  rule: LinkRule;
  stars: number;
  score: number;
  movesLeft: number;
  streak: number;
}

/** The message a player sends to friends after the daily board. Plain text, so it works in any app. */
export function buildShareText({ dateKey, rule, stars, score, movesLeft, streak }: ShareInput): string {
  const starRow = '★'.repeat(stars) + '☆'.repeat(Math.max(0, 3 - stars));
  const lines = [
    `Make Ten Daily · ${formatDateKey(dateKey)}`,
    `Rule: ${RULE_NAME[rule]}`,
    `${starRow} · ${score} pts · ${movesLeft} moves left`,
  ];
  if (streak > 1) lines.push(`🔥 ${streak} day streak`);
  lines.push('Can you beat it?');
  return lines.join('\n');
}
