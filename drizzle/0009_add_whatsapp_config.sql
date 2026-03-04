-- Add WhatsApp fields to botConfig table
ALTER TABLE `botConfig` 
ADD COLUMN `whatsappToken` VARCHAR(500) AFTER `telegramGroupId`,
ADD COLUMN `whatsappPhoneNumberId` VARCHAR(100) AFTER `whatsappToken`;
