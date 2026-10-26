-- AlterTable
ALTER TABLE "lead_follow_up_settings" ADD COLUMN IF NOT EXISTS "templateName" TEXT;
ALTER TABLE "lead_follow_up_settings" ADD COLUMN IF NOT EXISTS "templateLanguage" TEXT DEFAULT 'ar';
ALTER TABLE "lead_follow_up_settings" ADD COLUMN IF NOT EXISTS "templateParams" TEXT;
