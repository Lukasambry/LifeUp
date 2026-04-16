import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, TaskCategory, TaskType } from '@prisma/client';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // 1. Seed Talent Trees
  const talents = [
    {
      stat: TaskCategory.STRENGTH,
      tier: 1,
      name: 'Echauffement',
      description: '+5% XP sport',
      requiredStatLevel: 5,
      effect: { type: 'xp_bonus', value: 0.05 },
    },
    {
      stat: TaskCategory.INTELLIGENCE,
      tier: 1,
      name: 'Curiosite',
      description: '+5% XP apprentissage',
      requiredStatLevel: 5,
      effect: { type: 'xp_bonus', value: 0.05 },
    },
    {
      stat: TaskCategory.AGILITY,
      tier: 1,
      name: 'Efficacite',
      description: 'Cooldown -10%',
      requiredStatLevel: 5,
      effect: { type: 'cooldown_reduction', value: 0.1 },
    },
    {
      stat: TaskCategory.ENDURANCE,
      tier: 1,
      name: 'Resilience',
      description: '+1 jour de grace streak',
      requiredStatLevel: 5,
      effect: { type: 'streak_grace', value: 1 },
    },
    {
      stat: TaskCategory.CHARISMA,
      tier: 1,
      name: 'Sociable',
      description: '+10 XP nudge ami',
      requiredStatLevel: 5,
      effect: { type: 'nudge_bonus', value: 10 },
    },
    {
      stat: TaskCategory.WISDOM,
      tier: 1,
      name: 'Serenite',
      description: 'Notifications moins stressantes',
      requiredStatLevel: 5,
      effect: { type: 'notification_calm', value: true },
    },
    // Tier 2 talents (requiredStatLevel: 15)
    {
      stat: TaskCategory.STRENGTH,
      tier: 2,
      name: 'Discipline de fer',
      description: 'Streak forgive pour STRENGTH',
      requiredStatLevel: 15,
      effect: { type: 'streak_forgive', category: 'STRENGTH', value: 1 },
    },
    {
      stat: TaskCategory.INTELLIGENCE,
      tier: 2,
      name: 'Focus',
      description: 'Bonus combo quotidien INTELLIGENCE',
      requiredStatLevel: 15,
      effect: { type: 'daily_combo_bonus', category: 'INTELLIGENCE', threshold: 3, value: 0.15 },
    },
    {
      stat: TaskCategory.AGILITY,
      tier: 2,
      name: 'Multitache',
      description: 'Bonus combo quotidien toutes categories',
      requiredStatLevel: 15,
      effect: { type: 'daily_combo_bonus', category: 'ALL', threshold: 5, value: 0.10 },
    },
    {
      stat: TaskCategory.ENDURANCE,
      tier: 2,
      name: 'Regeneration',
      description: 'Bonus de retour apres absence',
      requiredStatLevel: 15,
      effect: { type: 'comeback_bonus', value: 0.25 },
    },
    {
      stat: TaskCategory.CHARISMA,
      tier: 2,
      name: 'Leader ne',
      description: 'Bonus XP de guilde',
      requiredStatLevel: 15,
      effect: { type: 'guild_xp_bonus', value: 0.05 },
    },
    {
      stat: TaskCategory.WISDOM,
      tier: 2,
      name: 'Meditation',
      description: 'Recap quotidien debloque',
      requiredStatLevel: 15,
      effect: { type: 'daily_recap', value: true },
    },
    // Tier 3 talents (requiredStatLevel: 30)
    {
      stat: TaskCategory.STRENGTH,
      tier: 3,
      name: 'Berserker',
      description: 'Multiplicateur premiere tache STRENGTH du jour',
      requiredStatLevel: 30,
      effect: { type: 'first_daily_multiplier', category: 'STRENGTH', value: 2.0 },
    },
    {
      stat: TaskCategory.INTELLIGENCE,
      tier: 3,
      name: 'Erudit',
      description: 'Debloquer les taches cachees',
      requiredStatLevel: 30,
      effect: { type: 'unlock_hidden_tasks', value: true },
    },
    {
      stat: TaskCategory.AGILITY,
      tier: 3,
      name: 'Assassin',
      description: 'Bonus matinal avant 8h',
      requiredStatLevel: 30,
      effect: { type: 'early_bird_bonus', before_hour: 8, value: 0.20 },
    },
    {
      stat: TaskCategory.ENDURANCE,
      tier: 3,
      name: 'Immortel',
      description: 'Reduction des pertes en mode hardcore',
      requiredStatLevel: 30,
      effect: { type: 'hardcore_loss_reduction', value: 0.50 },
    },
    {
      stat: TaskCategory.CHARISMA,
      tier: 3,
      name: 'Influenceur',
      description: 'Bonus XP amis',
      requiredStatLevel: 30,
      effect: { type: 'friend_xp_bonus', value: 0.05 },
    },
    {
      stat: TaskCategory.WISDOM,
      tier: 3,
      name: 'Oracle',
      description: 'Intel de duel debloque',
      requiredStatLevel: 30,
      effect: { type: 'duel_intel', value: true },
    },
  ];

  for (const t of talents) {
    await prisma.talentTree.upsert({
      where: {
        stat_name: { stat: t.stat, name: t.name },
      },
      update: {},
      create: {
        stat: t.stat,
        tier: t.tier,
        name: t.name,
        description: t.description,
        requiredStatLevel: t.requiredStatLevel,
        effect: t.effect,
      },
    });
  }
  console.log('Talent Trees seeded');

  // 2. Seed Predefined Tasks
  const tasks = [
    {
      name: 'Pompes (x20)',
      description: 'Faire 20 pompes',
      category: TaskCategory.STRENGTH,
      type: TaskType.REPEATABLE,
      baseXp: 20,
      cooldownMinutes: 60,
      isPredefined: true,
    },
    {
      name: 'Lire 10 pages',
      description: "Lire 10 pages d'un livre",
      category: TaskCategory.INTELLIGENCE,
      type: TaskType.DAILY,
      baseXp: 50,
      isPredefined: true,
    },
    {
      name: 'Mediter 10 min',
      description: 'Seance de meditation de 10 minutes',
      category: TaskCategory.WISDOM,
      type: TaskType.DAILY,
      baseXp: 40,
      isPredefined: true,
    },
    {
      name: "Boire 2L d'eau",
      description: "Boire 2 litres d'eau dans la journee",
      category: TaskCategory.ENDURANCE,
      type: TaskType.DAILY,
      baseXp: 30,
      isPredefined: true,
    },
    {
      name: 'Aller au sport',
      description: 'Seance de sport complete',
      category: TaskCategory.STRENGTH,
      type: TaskType.DAILY,
      baseXp: 100,
      isPredefined: true,
    },
    {
      name: 'Ranger son bureau',
      description: 'Organiser et ranger son espace de travail',
      category: TaskCategory.AGILITY,
      type: TaskType.DAILY,
      baseXp: 25,
      isPredefined: true,
    },
    {
      name: 'Appeler un ami',
      description: 'Appeler un ami ou un proche',
      category: TaskCategory.CHARISMA,
      type: TaskType.DAILY,
      baseXp: 35,
      isPredefined: true,
    },
    {
      name: 'Prendre une douche',
      description: 'Prendre sa douche',
      category: TaskCategory.ENDURANCE,
      type: TaskType.DAILY,
      baseXp: 15,
      isPredefined: true,
    },
    // STRENGTH tasks
    {
      name: 'Course 30 min',
      description: 'Courir pendant 30 minutes',
      category: TaskCategory.STRENGTH,
      type: TaskType.DAILY,
      baseXp: 40,
      isPredefined: true,
    },
    {
      name: 'Planche 1 min',
      description: 'Tenir la planche pendant 1 minute',
      category: TaskCategory.STRENGTH,
      type: TaskType.REPEATABLE,
      baseXp: 15,
      cooldownMinutes: 120,
      maxDailyCompletions: 3,
      isPredefined: true,
    },
    {
      name: 'Squats x30',
      description: 'Faire 30 squats',
      category: TaskCategory.STRENGTH,
      type: TaskType.REPEATABLE,
      baseXp: 20,
      cooldownMinutes: 120,
      maxDailyCompletions: 3,
      isPredefined: true,
    },
    {
      name: 'Etirements 15 min',
      description: 'Faire des etirements pendant 15 minutes',
      category: TaskCategory.STRENGTH,
      type: TaskType.DAILY,
      baseXp: 25,
      isPredefined: true,
    },
    {
      name: 'Marche 10 000 pas',
      description: 'Marcher 10 000 pas dans la journee',
      category: TaskCategory.STRENGTH,
      type: TaskType.DAILY,
      baseXp: 35,
      isPredefined: true,
    },
    {
      name: 'Velo 30 min',
      description: 'Faire du velo pendant 30 minutes',
      category: TaskCategory.STRENGTH,
      type: TaskType.DAILY,
      baseXp: 40,
      isPredefined: true,
    },
    {
      name: 'Courir un marathon',
      description: 'Completer un marathon',
      category: TaskCategory.STRENGTH,
      type: TaskType.ONESHOT,
      baseXp: 100,
      isPredefined: true,
    },
    // INTELLIGENCE tasks
    {
      name: 'Reviser 30 min',
      description: 'Reviser ses cours pendant 30 minutes',
      category: TaskCategory.INTELLIGENCE,
      type: TaskType.DAILY,
      baseXp: 40,
      isPredefined: true,
    },
    {
      name: 'Coder 1h',
      description: 'Coder pendant 1 heure',
      category: TaskCategory.INTELLIGENCE,
      type: TaskType.DAILY,
      baseXp: 50,
      isPredefined: true,
    },
    {
      name: 'Apprendre un mot anglais',
      description: 'Apprendre un nouveau mot en anglais',
      category: TaskCategory.INTELLIGENCE,
      type: TaskType.DAILY,
      baseXp: 15,
      isPredefined: true,
    },
    {
      name: 'Regarder une conference',
      description: 'Regarder une conference ou un talk',
      category: TaskCategory.INTELLIGENCE,
      type: TaskType.WEEKLY,
      baseXp: 60,
      isPredefined: true,
    },
    {
      name: 'Resoudre un probleme',
      description: 'Resoudre un probleme de logique ou algorithmique',
      category: TaskCategory.INTELLIGENCE,
      type: TaskType.REPEATABLE,
      baseXp: 25,
      cooldownMinutes: 180,
      maxDailyCompletions: 3,
      isPredefined: true,
    },
    {
      name: 'Ecrire un article',
      description: 'Ecrire un article de blog ou un texte',
      category: TaskCategory.INTELLIGENCE,
      type: TaskType.MONTHLY,
      baseXp: 80,
      isPredefined: true,
    },
    {
      name: 'Suivre un cours en ligne',
      description: 'Suivre un cours ou une lecon en ligne',
      category: TaskCategory.INTELLIGENCE,
      type: TaskType.WEEKLY,
      baseXp: 60,
      isPredefined: true,
    },
    {
      name: 'Obtenir une certification',
      description: 'Obtenir une certification professionnelle',
      category: TaskCategory.INTELLIGENCE,
      type: TaskType.ONESHOT,
      baseXp: 100,
      isPredefined: true,
    },
    // AGILITY tasks
    {
      name: 'Planifier sa journee',
      description: 'Planifier et organiser sa journee',
      category: TaskCategory.AGILITY,
      type: TaskType.DAILY,
      baseXp: 20,
      isPredefined: true,
    },
    {
      name: 'Repondre aux emails',
      description: 'Repondre a tous ses emails en attente',
      category: TaskCategory.AGILITY,
      type: TaskType.DAILY,
      baseXp: 25,
      isPredefined: true,
    },
    {
      name: 'Faire ses comptes',
      description: 'Verifier et mettre a jour ses comptes',
      category: TaskCategory.AGILITY,
      type: TaskType.WEEKLY,
      baseXp: 50,
      isPredefined: true,
    },
    {
      name: 'Organiser son bureau',
      description: 'Organiser et ranger son bureau',
      category: TaskCategory.AGILITY,
      type: TaskType.WEEKLY,
      baseXp: 40,
      isPredefined: true,
    },
    {
      name: 'Trier ses affaires',
      description: 'Trier et ranger ses affaires',
      category: TaskCategory.AGILITY,
      type: TaskType.MONTHLY,
      baseXp: 80,
      isPredefined: true,
    },
    {
      name: 'To-do list du jour',
      description: 'Creer sa to-do list pour la journee',
      category: TaskCategory.AGILITY,
      type: TaskType.DAILY,
      baseXp: 15,
      isPredefined: true,
    },
    {
      name: 'Preparer ses affaires',
      description: 'Preparer ses affaires pour le lendemain',
      category: TaskCategory.AGILITY,
      type: TaskType.DAILY,
      baseXp: 15,
      isPredefined: true,
    },
    // ENDURANCE tasks
    {
      name: 'Dormir 8h',
      description: 'Dormir au moins 8 heures',
      category: TaskCategory.ENDURANCE,
      type: TaskType.DAILY,
      baseXp: 30,
      isPredefined: true,
    },
    {
      name: 'Se brosser les dents',
      description: 'Se brosser les dents matin et soir',
      category: TaskCategory.ENDURANCE,
      type: TaskType.DAILY,
      baseXp: 10,
      isPredefined: true,
    },
    {
      name: 'Prendre ses vitamines',
      description: 'Prendre ses vitamines et complements',
      category: TaskCategory.ENDURANCE,
      type: TaskType.DAILY,
      baseXp: 10,
      isPredefined: true,
    },
    {
      name: 'Pas de fast-food',
      description: 'Ne pas manger de fast-food de la journee',
      category: TaskCategory.ENDURANCE,
      type: TaskType.DAILY,
      baseXp: 25,
      isPredefined: true,
    },
    {
      name: "Pas d'alcool",
      description: "Ne pas boire d'alcool de la journee",
      category: TaskCategory.ENDURANCE,
      type: TaskType.DAILY,
      baseXp: 25,
      isPredefined: true,
    },
    {
      name: 'Se coucher avant 23h',
      description: 'Se coucher avant 23 heures',
      category: TaskCategory.ENDURANCE,
      type: TaskType.DAILY,
      baseXp: 20,
      isPredefined: true,
    },
    {
      name: 'Marcher 30 min',
      description: 'Marcher pendant 30 minutes',
      category: TaskCategory.ENDURANCE,
      type: TaskType.DAILY,
      baseXp: 25,
      isPredefined: true,
    },
    {
      name: 'Preparer un repas sain',
      description: 'Preparer un repas equilibre et sain',
      category: TaskCategory.ENDURANCE,
      type: TaskType.DAILY,
      baseXp: 30,
      isPredefined: true,
    },
    // CHARISMA tasks
    {
      name: 'Networking',
      description: 'Faire du networking et rencontrer de nouvelles personnes',
      category: TaskCategory.CHARISMA,
      type: TaskType.WEEKLY,
      baseXp: 50,
      isPredefined: true,
    },
    {
      name: "Complimenter quelqu'un",
      description: 'Faire un compliment sincere a quelqu un',
      category: TaskCategory.CHARISMA,
      type: TaskType.DAILY,
      baseXp: 15,
      isPredefined: true,
    },
    {
      name: 'Parler en public',
      description: 'Faire une presentation ou parler en public',
      category: TaskCategory.CHARISMA,
      type: TaskType.MONTHLY,
      baseXp: 80,
      isPredefined: true,
    },
    {
      name: 'Aider un inconnu',
      description: 'Aider une personne inconnue',
      category: TaskCategory.CHARISMA,
      type: TaskType.WEEKLY,
      baseXp: 40,
      isPredefined: true,
    },
    {
      name: 'Envoyer un message positif',
      description: 'Envoyer un message positif a un proche',
      category: TaskCategory.CHARISMA,
      type: TaskType.DAILY,
      baseXp: 15,
      isPredefined: true,
    },
    {
      name: 'Sortir avec des amis',
      description: 'Sortir et passer du temps avec des amis',
      category: TaskCategory.CHARISMA,
      type: TaskType.WEEKLY,
      baseXp: 50,
      isPredefined: true,
    },
    {
      name: 'Faire du benevolat',
      description: 'Participer a une activite de benevolat',
      category: TaskCategory.CHARISMA,
      type: TaskType.MONTHLY,
      baseXp: 100,
      isPredefined: true,
    },
    // WISDOM tasks
    {
      name: 'Journaling',
      description: 'Ecrire dans son journal personnel',
      category: TaskCategory.WISDOM,
      type: TaskType.DAILY,
      baseXp: 25,
      isPredefined: true,
    },
    {
      name: 'Gratitude x3',
      description: 'Noter 3 choses pour lesquelles on est reconnaissant',
      category: TaskCategory.WISDOM,
      type: TaskType.DAILY,
      baseXp: 20,
      isPredefined: true,
    },
    {
      name: 'Pas de telephone 1h',
      description: 'Passer 1 heure sans telephone',
      category: TaskCategory.WISDOM,
      type: TaskType.DAILY,
      baseXp: 30,
      isPredefined: true,
    },
    {
      name: 'Yoga 20 min',
      description: 'Faire une seance de yoga de 20 minutes',
      category: TaskCategory.WISDOM,
      type: TaskType.DAILY,
      baseXp: 35,
      isPredefined: true,
    },
    {
      name: 'Respiration consciente',
      description: 'Faire un exercice de respiration consciente',
      category: TaskCategory.WISDOM,
      type: TaskType.REPEATABLE,
      baseXp: 15,
      cooldownMinutes: 180,
      maxDailyCompletions: 3,
      isPredefined: true,
    },
    {
      name: 'Ecouter un podcast',
      description: 'Ecouter un podcast educatif ou inspirant',
      category: TaskCategory.WISDOM,
      type: TaskType.DAILY,
      baseXp: 25,
      isPredefined: true,
    },
    {
      name: 'Promenade sans musique',
      description: 'Faire une promenade sans musique ni telephone',
      category: TaskCategory.WISDOM,
      type: TaskType.DAILY,
      baseXp: 20,
      isPredefined: true,
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: {
        name_isPredefined: { name: task.name, isPredefined: true },
      },
      update: {},
      create: task,
    });
  }
  console.log('Predefined Tasks seeded');

  // 3. Seed Achievements
  const achievements = [
    {
      name: 'Premier pas',
      description: 'Completer sa premiere tache',
      iconUrl: '/achievements/first-step.png',
      condition: { type: 'task_completion', count: 1 },
      xpReward: 50,
    },
    {
      name: 'Semaine parfaite',
      description: 'Completer toutes ses taches quotidiennes pendant 7 jours',
      iconUrl: '/achievements/perfect-week.png',
      condition: { type: 'streak', value: 7 },
      xpReward: 200,
    },
    {
      name: 'Niveau 10',
      description: 'Atteindre le niveau 10',
      iconUrl: '/achievements/level-10.png',
      condition: { type: 'level', value: 10 },
      xpReward: 500,
    },
    {
      name: 'Niveau 20',
      description: 'Atteindre le niveau 20 et debloquer sa classe',
      iconUrl: '/achievements/level-20.png',
      condition: { type: 'level', value: 20 },
      xpReward: 1000,
    },
    {
      name: 'Social Butterfly',
      description: 'Ajouter 5 amis',
      iconUrl: '/achievements/social.png',
      condition: { type: 'friends', count: 5 },
      xpReward: 150,
    },
    {
      name: 'Guild Master',
      description: 'Creer une guilde',
      iconUrl: '/achievements/guild.png',
      condition: { type: 'guild_created' },
      xpReward: 300,
    },
    // Streaks
    {
      name: 'En feu',
      description: 'Maintenir un streak de 7 jours',
      iconUrl: '/achievements/streak-7.png',
      condition: { type: 'streak', value: 7 },
      xpReward: 100,
    },
    {
      name: 'Inarretable',
      description: 'Maintenir un streak de 30 jours',
      iconUrl: '/achievements/streak-30.png',
      condition: { type: 'streak', value: 30 },
      xpReward: 500,
    },
    {
      name: 'Legendaire',
      description: 'Maintenir un streak de 100 jours',
      iconUrl: '/achievements/streak-100.png',
      condition: { type: 'streak', value: 100 },
      xpReward: 2000,
    },
    // Progression
    {
      name: 'Niveau 25',
      description: 'Atteindre le niveau 25',
      iconUrl: '/achievements/level-25.png',
      condition: { type: 'level', value: 25 },
      xpReward: 1500,
    },
    {
      name: 'Niveau 50',
      description: 'Atteindre le niveau 50',
      iconUrl: '/achievements/level-50.png',
      condition: { type: 'level', value: 50 },
      xpReward: 3000,
    },
    {
      name: 'Centurion',
      description: 'Completer 100 taches',
      iconUrl: '/achievements/tasks-100.png',
      condition: { type: 'task_completion', count: 100 },
      xpReward: 300,
    },
    {
      name: 'Marathonien',
      description: 'Completer 500 taches',
      iconUrl: '/achievements/tasks-500.png',
      condition: { type: 'task_completion', count: 500 },
      xpReward: 1000,
    },
    {
      name: 'Machine',
      description: 'Completer 1000 taches',
      iconUrl: '/achievements/tasks-1000.png',
      condition: { type: 'task_completion', count: 1000 },
      xpReward: 2500,
    },
    // Social
    {
      name: 'Premier ami',
      description: 'Ajouter son premier ami',
      iconUrl: '/achievements/first-friend.png',
      condition: { type: 'friends', count: 1 },
      xpReward: 50,
    },
    {
      name: 'Populaire',
      description: 'Avoir 10 amis',
      iconUrl: '/achievements/friends-10.png',
      condition: { type: 'friends', count: 10 },
      xpReward: 200,
    },
    {
      name: 'Coup de pouce',
      description: 'Envoyer son premier nudge',
      iconUrl: '/achievements/first-nudge.png',
      condition: { type: 'nudge', count: 1 },
      xpReward: 50,
    },
    // Guildes
    {
      name: "Esprit d'equipe",
      description: 'Rejoindre une guilde',
      iconUrl: '/achievements/guild-joined.png',
      condition: { type: 'guild_joined' },
      xpReward: 100,
    },
    {
      name: 'Quete accomplie',
      description: 'Completer une quete de guilde',
      iconUrl: '/achievements/guild-quest.png',
      condition: { type: 'guild_quest_completed' },
      xpReward: 300,
    },
    // Duels
    {
      name: 'Premier duel',
      description: 'Participer a son premier duel',
      iconUrl: '/achievements/first-duel.png',
      condition: { type: 'duel', count: 1 },
      xpReward: 100,
    },
    {
      name: 'Champion',
      description: 'Gagner 10 duels',
      iconUrl: '/achievements/duel-wins-10.png',
      condition: { type: 'duel_wins', count: 10 },
      xpReward: 500,
    },
    // NFC
    {
      name: 'Premier scan',
      description: 'Scanner son premier tag NFC',
      iconUrl: '/achievements/first-nfc.png',
      condition: { type: 'nfc', count: 1 },
      xpReward: 50,
    },
    {
      name: 'Scanner pro',
      description: 'Scanner 50 tags NFC',
      iconUrl: '/achievements/nfc-50.png',
      condition: { type: 'nfc', count: 50 },
      xpReward: 500,
    },
    // Hardcore
    {
      name: 'Temeraire',
      description: 'Activer le mode hardcore',
      iconUrl: '/achievements/hardcore-activated.png',
      condition: { type: 'hardcore_activated' },
      xpReward: 200,
    },
    {
      name: 'Survivant',
      description: 'Survivre 30 jours en mode hardcore',
      iconUrl: '/achievements/hardcore-30.png',
      condition: { type: 'hardcore_days', value: 30 },
      xpReward: 1500,
    },
    // Misc
    {
      name: 'Createur',
      description: 'Creer sa premiere tache personnalisee',
      iconUrl: '/achievements/first-custom-task.png',
      condition: { type: 'custom_task', count: 1 },
      xpReward: 50,
    },
    {
      name: 'Acheteur',
      description: 'Effectuer son premier achat en boutique',
      iconUrl: '/achievements/first-purchase.png',
      condition: { type: 'shop_purchase', count: 1 },
      xpReward: 50,
    },
    {
      name: 'Polyvalent',
      description: 'Atteindre le niveau 10 dans toutes les stats',
      iconUrl: '/achievements/all-stats-10.png',
      condition: { type: 'all_stats_level', value: 10 },
      xpReward: 1000,
    },
    {
      name: 'Classe debloquee',
      description: 'Debloquer sa classe',
      iconUrl: '/achievements/class-unlocked.png',
      condition: { type: 'class_unlocked' },
      xpReward: 500,
    },
    {
      name: 'Semaine parfaite x4',
      description: 'Maintenir un streak de 28 jours',
      iconUrl: '/achievements/streak-28.png',
      condition: { type: 'streak', value: 28 },
      xpReward: 800,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: {},
      create: achievement,
    });
  }
  console.log('Achievements seeded');

  console.log('Seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
