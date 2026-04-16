import type {
  SSOProvider,
  TaskCategory,
  TaskType,
  UserClass,
  GuildRole,
  FriendshipStatus,
  ChallengeType,
  ChallengeStatus,
  NotificationType,
  ShopCategory,
  QuestStatus,
  TransactionReason,
} from './enums.js';

export interface User {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  userClass: UserClass | null;
  ssoProvider: SSOProvider | null;
  isHardcore: boolean;
  isPublic: boolean;
  createdAt: string;
}

export interface UserStats {
  strength: number;
  intelligence: number;
  agility: number;
  endurance: number;
  charisma: number;
  wisdom: number;
}

export interface Task {
  id: string;
  name: string;
  description: string | null;
  category: TaskCategory;
  type: TaskType;
  baseXp: number;
  cooldownMinutes: number | null;
  isPredefined: boolean;
  requiresProof: boolean;
  maxDailyCompletions: number;
}

export interface UserTask {
  id: string;
  taskId: string;
  task: Task;
  isActive: boolean;
  currentStreak: number;
  bestStreak: number;
  lastCompletedAt: string | null;
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  xpEarned: number;
  multiplier: number;
  proofUrl: string | null;
  completedAt: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string | null;
  iconUrl: string | null;
  condition: Record<string, unknown>;
  xpReward: number;
}

export interface Guild {
  id: string;
  name: string;
  description: string | null;
  avatarUrl: string | null;
  leaderId: string;
  maxMembers: number;
  totalXp: number;
  memberCount?: number;
}

export interface GuildMember {
  id: string;
  userId: string;
  user: Pick<User, 'id' | 'username' | 'avatarUrl' | 'level'>;
  role: GuildRole;
  joinedAt: string;
  xpContributed: number;
}

export interface Season {
  id: string;
  name: string;
  themeStat: TaskCategory | null;
  xpBonusPercent: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string | null;
  category: ShopCategory;
  priceGc: number;
  iconUrl: string | null;
  effect: Record<string, unknown> | null;
  seasonId: string | null;
  isActive: boolean;
}

export interface WalletTransaction {
  id: string;
  amount: number;
  reason: TransactionReason;
  referenceId: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

export interface Friendship {
  id: string;
  requesterId: string;
  addresseeId: string;
  status: FriendshipStatus;
  createdAt: string;
  user: Pick<User, 'id' | 'username' | 'avatarUrl' | 'level'>;
}

export interface Challenge {
  id: string;
  type: ChallengeType;
  challengerId: string;
  challengedId: string;
  status: ChallengeStatus;
  winnerId: string | null;
  startsAt: string;
  endsAt: string;
}

export interface GuildQuest {
  id: string;
  guildId: string;
  title: string;
  description: string | null;
  xpTarget: number;
  xpCurrent: number;
  rewardXpBonus: number;
  startsAt: string;
  endsAt: string;
  status: QuestStatus;
}

export interface TalentNode {
  id: string;
  stat: TaskCategory;
  name: string;
  description: string | null;
  tier: number;
  requiredStatLevel: number;
  prerequisiteTalentId: string | null;
  effect: Record<string, unknown>;
}

export interface HardcoreStatus {
  isActive: boolean;
  activatedAt: string | null;
  deathCount: number;
  cooldownUntil: string | null;
}
