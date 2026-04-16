import { Injectable } from '@nestjs/common';
import { TaskCategory } from '@prisma/client';

@Injectable()
export class XpService {
  /**
   * Minimum cumulative XP to reach a given level.
   * level 1 → 0, level N → floor((N-1)^1.8 * 100)
   * level 2 → 100 | level 5 → 826 | level 10 → 2512 | level 20 → 7943
   */
  xpThreshold(level: number): number {
    if (level <= 1) return 0;
    return Math.floor(Math.pow(level - 1, 1.8) * 100);
  }

  /**
   * Compute the level for a given cumulative XP total.
   */
  computeLevel(totalXp: bigint): number {
    const xp = Number(totalXp);
    let level = 1;
    while (this.xpThreshold(level + 1) <= xp) {
      level++;
    }
    return level;
  }

  calculateXp(baseXp: number, multiplier: number): number {
    return Math.floor(baseXp * multiplier);
  }

  getStatField(category: TaskCategory): string {
    const map: Record<TaskCategory, string> = {
      STRENGTH: 'strength',
      INTELLIGENCE: 'intelligence',
      AGILITY: 'agility',
      ENDURANCE: 'endurance',
      CHARISMA: 'charisma',
      WISDOM: 'wisdom',
    };
    return map[category];
  }
}
