CREATE TABLE `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`key` text NOT NULL,
	`revoked` integer DEFAULT false NOT NULL,
	`last_used_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_key_unique` ON `api_keys` (`key`);--> statement-breakpoint
CREATE TABLE `audit_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text,
	`user_email` text,
	`action` text NOT NULL,
	`target` text,
	`detail` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `carrier_applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`city` text NOT NULL,
	`vehicle` text NOT NULL,
	`capacity_m3` real,
	`siret` text,
	`message` text,
	`status` text DEFAULT 'nouveau' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `chat_leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text,
	`phone` text,
	`email` text,
	`topic` text DEFAULT 'general' NOT NULL,
	`transcript` text,
	`channel` text DEFAULT 'site_chat' NOT NULL,
	`locale` text DEFAULT 'fr' NOT NULL,
	`handled` integer DEFAULT false NOT NULL,
	`forwarded_at` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contacts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`subject` text NOT NULL,
	`message` text NOT NULL,
	`handled` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `driver_jobs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`driver_id` integer NOT NULL,
	`tracking_number` text NOT NULL,
	`pickup_address` text NOT NULL,
	`drop_address` text NOT NULL,
	`recipient_name` text,
	`recipient_phone` text,
	`scheduled_at` integer,
	`status` text DEFAULT 'a_recuperer' NOT NULL,
	`payout_cents` integer,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `drivers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`code` text NOT NULL,
	`vehicle` text,
	`city` text,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `drivers_email_unique` ON `drivers` (`email`);--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_id` integer NOT NULL,
	`label` text NOT NULL,
	`detail` text,
	`quantity` real DEFAULT 1 NOT NULL,
	`unit` text DEFAULT 'forfait' NOT NULL,
	`unit_price_cents` integer DEFAULT 0 NOT NULL,
	`total_cents` integer DEFAULT 0 NOT NULL,
	`position` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`number` text NOT NULL,
	`quote_ref` text,
	`user_id` text,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text,
	`customer_company` text,
	`customer_address` text,
	`subject` text DEFAULT 'Prestation de transport' NOT NULL,
	`subtotal_cents` integer DEFAULT 0 NOT NULL,
	`vat_rate` real DEFAULT 20 NOT NULL,
	`vat_cents` integer DEFAULT 0 NOT NULL,
	`total_cents` integer DEFAULT 0 NOT NULL,
	`currency` text DEFAULT 'EUR' NOT NULL,
	`status` text DEFAULT 'en_attente_paiement' NOT NULL,
	`payment_method` text,
	`payment_reference` text,
	`paid_at` integer,
	`due_at` integer,
	`notes` text,
	`locale` text DEFAULT 'fr' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_number_unique` ON `invoices` (`number`);--> statement-breakpoint
CREATE TABLE `payments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`quote_ref` text NOT NULL,
	`provider` text DEFAULT 'virement' NOT NULL,
	`amount_cents` integer NOT NULL,
	`status` text DEFAULT 'en_attente' NOT NULL,
	`reference` text,
	`payer_email` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `quotes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ref` text NOT NULL,
	`kind` text DEFAULT 'colis' NOT NULL,
	`service` text DEFAULT 'standard' NOT NULL,
	`zone` text DEFAULT 'france' NOT NULL,
	`customer_name` text NOT NULL,
	`customer_email` text NOT NULL,
	`customer_phone` text,
	`company` text,
	`from_address` text NOT NULL,
	`to_address` text NOT NULL,
	`weight_kg` real,
	`length_cm` real,
	`width_cm` real,
	`height_cm` real,
	`volume_m3` real,
	`pieces` integer DEFAULT 1,
	`floors` integer DEFAULT 0,
	`elevator` integer DEFAULT false,
	`insurance` integer DEFAULT false,
	`home_pickup` integer DEFAULT false,
	`packing` integer DEFAULT false,
	`fragile` integer DEFAULT false,
	`declared_value` real,
	`goods_description` text,
	`message` text,
	`price_cents` integer NOT NULL,
	`breakdown` text,
	`eta_min` integer,
	`eta_max` integer,
	`status` text DEFAULT 'nouveau' NOT NULL,
	`tracking_number` text,
	`user_id` text,
	`invoice_id` integer,
	`decision` text,
	`decision_reason` text,
	`decided_at` integer,
	`locale` text DEFAULT 'fr' NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `quotes_ref_unique` ON `quotes` (`ref`);--> statement-breakpoint
CREATE TABLE `site_settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL,
	`group` text DEFAULT 'general' NOT NULL,
	`label` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tracking_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tracking_number` text NOT NULL,
	`status` text NOT NULL,
	`label_fr` text NOT NULL,
	`label_en` text NOT NULL,
	`location` text,
	`occurred_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tracking_locations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tracking_number` text NOT NULL,
	`driver_id` integer,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`accuracy` real,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `trackings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tracking_number` text NOT NULL,
	`quote_id` integer,
	`recipient_name` text,
	`origin` text NOT NULL,
	`destination` text NOT NULL,
	`status` text DEFAULT 'cree' NOT NULL,
	`service` text DEFAULT 'standard' NOT NULL,
	`carrier` text DEFAULT 'LBG Express' NOT NULL,
	`external_carrier` text,
	`weight_kg` real,
	`eta` integer,
	`driver_id` integer,
	`source` text DEFAULT 'site' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `trackings_tracking_number_unique` ON `trackings` (`tracking_number`);--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`secret` text NOT NULL,
	`events` text DEFAULT 'tracking.updated' NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`last_status` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`role` text DEFAULT 'client',
	`account_status` text DEFAULT 'actif',
	`phone` text,
	`company` text,
	`must_change_password` integer DEFAULT false
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);