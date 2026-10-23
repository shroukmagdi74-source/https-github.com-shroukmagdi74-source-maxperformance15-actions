#!/usr/bin/env node

/**
 * backfill-academy-lesson-order.js
 *
 * Idempotently backfills sortOrder for all lessons in flagship course cmuzmwaxs07r2juml2v04xon5
 * (1->12 and 14->25, matching the official title numbers).
 */

const { getSharedPrismaClientAsync, closeSharedDatabase } = require('../services/sharedDatabase');

async function main() {
  console.log('🔄 [backfill-academy-lesson-order] Starting lesson sortOrder backfill...');
  const prisma = await getSharedPrismaClientAsync();
  const courseId = 'cmuzmwaxs07r2juml2v04xon5';

  const lessons = await prisma.academyLesson.findMany({
    where: {
      OR: [
        { courseId },
        { module: { courseId } },
      ],
    },
    select: { id: true, title: true, sortOrder: true, moduleId: true, courseId: true },
  });

  if (!lessons || lessons.length === 0) {
    console.log(`ℹ️ [backfill-academy-lesson-order] No lessons found for course ${courseId}`);
    await closeSharedDatabase();
    return;
  }

  console.log(`ℹ️ [backfill-academy-lesson-order] Found ${lessons.length} lessons for course ${courseId}`);
  let updatedCount = 0;

  for (const lesson of lessons) {
    const match = String(lesson.title || '').match(/الدرس\s+(\d+)/);
    if (match) {
      const order = parseInt(match[1], 10);
      const updateData = {};
      if (lesson.sortOrder !== order) {
        updateData.sortOrder = order;
      }
      if (!lesson.courseId) {
        updateData.courseId = courseId;
      }
      if (Object.keys(updateData).length > 0) {
        await prisma.academyLesson.update({
          where: { id: lesson.id },
          data: updateData,
        });
        console.log(`✅ Updated lesson ${lesson.id} ("${lesson.title.slice(0, 40)}...") ->`, updateData);
        updatedCount++;
      }
    }
  }

  console.log(`✅ [backfill-academy-lesson-order] Finished. Updated ${updatedCount}/${lessons.length} lessons.`);
  await closeSharedDatabase();
}

if (require.main === module) {
  main().catch((err) => {
    console.error('❌ [backfill-academy-lesson-order] Failed:', err);
    process.exit(1);
  });
}

module.exports = { main };
