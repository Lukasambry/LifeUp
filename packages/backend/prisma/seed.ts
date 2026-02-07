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
      requiredStatLevel: 1,
      effect: { type: 'xp_bonus', value: 0.05 },
    },
    {
      stat: TaskCategory.INTELLIGENCE,
      tier: 1,
      name: 'Curiosite',
      description: '+5% XP apprentissage',
      requiredStatLevel: 1,
      effect: { type: 'xp_bonus', value: 0.05 },
    },
    {
      stat: TaskCategory.AGILITY,
      tier: 1,
      name: 'Efficacite',
      description: 'Cooldown -10%',
      requiredStatLevel: 1,
      effect: { type: 'cooldown_reduction', value: 0.1 },
    },
    {
      stat: TaskCategory.ENDURANCE,
      tier: 1,
      name: 'Resilience',
      description: '+1 jour de grace streak',
      requiredStatLevel: 1,
      effect: { type: 'streak_grace', value: 1 },
    },
    {
      stat: TaskCategory.CHARISMA,
      tier: 1,
      name: 'Sociable',
      description: '+10 XP nudge ami',
      requiredStatLevel: 1,
      effect: { type: 'nudge_bonus', value: 10 },
    },
    {
      stat: TaskCategory.WISDOM,
      tier: 1,
      name: 'Serenite',
      description: 'Notifications moins stressantes',
      requiredStatLevel: 1,
      effect: { type: 'notification_calm', value: true },
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
