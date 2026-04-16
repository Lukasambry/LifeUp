export enum SSOProvider {
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}

export enum TaskCategory {
  STRENGTH = 'STRENGTH',
  INTELLIGENCE = 'INTELLIGENCE',
  AGILITY = 'AGILITY',
  ENDURANCE = 'ENDURANCE',
  CHARISMA = 'CHARISMA',
  WISDOM = 'WISDOM',
}

export enum TaskType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  ONESHOT = 'ONESHOT',
  REPEATABLE = 'REPEATABLE',
}

export enum UserClass {
  WARRIOR = 'WARRIOR',
  MAGE = 'MAGE',
  THIEF = 'THIEF',
  ARCHER = 'ARCHER',
  PALADIN = 'PALADIN',
  BARD = 'BARD',
}

export enum GuildRole {
  LEADER = 'LEADER',
  OFFICER = 'OFFICER',
  MEMBER = 'MEMBER',
}

export enum FriendshipStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  BLOCKED = 'BLOCKED',
}

export enum ChallengeType {
  DUEL = 'DUEL',
  GUILD_VS_GUILD = 'GUILD_VS_GUILD',
}

export enum ChallengeStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DECLINED = 'DECLINED',
}

export enum FraudType {
  RATE_ABUSE = 'RATE_ABUSE',
  SUSPICIOUS_TIME = 'SUSPICIOUS_TIME',
  PATTERN_ANOMALY = 'PATTERN_ANOMALY',
  COMMUNITY_REPORT = 'COMMUNITY_REPORT',
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum NotificationType {
  STREAK_WARNING = 'STREAK_WARNING',
  LEVEL_UP = 'LEVEL_UP',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
  GUILD_INVITE = 'GUILD_INVITE',
  CHALLENGE = 'CHALLENGE',
  NUDGE = 'NUDGE',
  REMINDER = 'REMINDER',
}

export enum ShopCategory {
  AVATAR = 'AVATAR',
  TITLE = 'TITLE',
  THEME = 'THEME',
  BOOST = 'BOOST',
}

export enum QuestStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum TransactionReason {
  TASK_COMPLETION = 'TASK_COMPLETION',
  ACHIEVEMENT = 'ACHIEVEMENT',
  DUEL_WIN = 'DUEL_WIN',
  GUILD_QUEST = 'GUILD_QUEST',
  SEASON_REWARD = 'SEASON_REWARD',
  SHOP_PURCHASE = 'SHOP_PURCHASE',
}
