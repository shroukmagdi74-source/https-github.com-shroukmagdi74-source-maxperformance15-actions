-- Add SYSTEM_INCIDENT to whatsapp_notification_logs_eventType, whatsapp_notification_queue_eventType and whatsapp_notification_templates_eventType enums
ALTER TYPE "whatsapp_notification_logs_eventType" ADD VALUE IF NOT EXISTS 'SYSTEM_INCIDENT';
ALTER TYPE "whatsapp_notification_queue_eventType" ADD VALUE IF NOT EXISTS 'SYSTEM_INCIDENT';
ALTER TYPE "whatsapp_notification_templates_eventType" ADD VALUE IF NOT EXISTS 'SYSTEM_INCIDENT';
