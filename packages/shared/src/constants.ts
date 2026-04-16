import { UserClass, TaskCategory } from './enums.js';

// ── XP & Leveling ──────────────────────────────────────────────────────
export const MAX_LEVEL = 100;
export const MAX_STAT_LEVEL = 50;
export const XP_BASE = 100;
export const XP_EXPONENT = 1.5;

export function xpRequiredForLevel(level: number): number {
  return Math.floor(XP_BASE * Math.pow(level, XP_EXPONENT));
}

export function dailyXpCap(level: number): number {
  return level * 50 + 500;
}

// ── Streaks ────────────────────────────────────────────────────────────
export const STREAK_MULTIPLIERS: Record<number, number> = {
  7: 1.2,
  30: 1.5,
  100: 2.0,
};

export function getStreakMultiplier(streak: number): number {
  if (streak >= 100) return STREAK_MULTIPLIERS[100]!;
  if (streak >= 30) return STREAK_MULTIPLIERS[30]!;
  if (streak >= 7) return STREAK_MULTIPLIERS[7]!;
  return 1.0;
}

// ── Classes ────────────────────────────────────────────────────────────
export const CLASS_UNLOCK_LEVEL = 20;
export const CLASS_XP_BONUS = 0.10;

export const CLASS_STAT_MAPPING: Record<UserClass, [TaskCategory, TaskCategory]> = {
  [UserClass.WARRIOR]: [TaskCategory.STRENGTH, TaskCategory.ENDURANCE],
  [UserClass.MAGE]: [TaskCategory.INTELLIGENCE, TaskCategory.WISDOM],
  [UserClass.THIEF]: [TaskCategory.AGILITY, TaskCategory.CHARISMA],
  [UserClass.ARCHER]: [TaskCategory.AGILITY, TaskCategory.ENDURANCE],
  [UserClass.PALADIN]: [TaskCategory.STRENGTH, TaskCategory.WISDOM],
  [UserClass.BARD]: [TaskCategory.CHARISMA, TaskCategory.INTELLIGENCE],
};

// ── NFC & Hardcore ─────────────────────────────────────────────────────
export const NFC_XP_BONUS = 0.15;
export const HARDCORE_XP_BONUS = 0.25;
export const HARDCORE_INACTIVITY_XP_LOSS_MULTIPLIER = 10;
export const HARDCORE_STAT_DECAY_DAYS = 7;

// ── Gold Coins (GC) ───────────────────────────────────────────────────
export const GC_DAILY_TASK = 1;
export const GC_WEEKLY_TASK = 5;
export const GC_MONTHLY_TASK = 20;

// ── Trust & Anti-Fraud ─────────────────────────────────────────────────
export const TRUST_SCORE_DEFAULT = 100;
export const SUSPICIOUS_TASKS_THRESHOLD = 10;
export const SUSPICIOUS_TASKS_WINDOW_MINUTES = 5;

// ── Auth & Security ────────────────────────────────────────────────────
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_RESET_TOKEN_EXPIRY_MINUTES = 15;
export const MAGIC_LINK_EXPIRY_MINUTES = 15;
export const MAX_LOGIN_ATTEMPTS = 5;
export const ACCOUNT_LOCK_DURATION_MINUTES = 15;
export const PASSWORD_RENEWAL_DAYS = 60;

// ── Talents ────────────────────────────────────────────────────────────
export const TALENT_TIER_LEVELS: Record<number, number> = {
  1: 5,
  2: 15,
  3: 30,
};

// ── Seasons ────────────────────────────────────────────────────────────
export const SEASON_DURATION_MONTHS = 3;
export const SEASON_THEME_XP_BONUS = 0.15;
