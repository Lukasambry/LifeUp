/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `achievements` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stat,name]` on the table `talent_trees` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,is_predefined]` on the table `tasks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "achievements_name_key" ON "achievements"("name");

-- CreateIndex
CREATE UNIQUE INDEX "talent_trees_stat_name_key" ON "talent_trees"("stat", "name");

-- CreateIndex
CREATE UNIQUE INDEX "tasks_name_is_predefined_key" ON "tasks"("name", "is_predefined");
