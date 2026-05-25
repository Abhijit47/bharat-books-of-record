CREATE TABLE `posts` (
	`id` text PRIMARY KEY NOT NULL,
	`full_picture` text DEFAULT '',
	`attachments_image_src` text DEFAULT '',
	`attachments_url` text DEFAULT '',
	`attachments_height` integer DEFAULT 0,
	`attachments_width` integer DEFAULT 0,
	`attachments_media_type` text DEFAULT '',
	`attachments_type` text DEFAULT '',
	`attachments_description` text DEFAULT '',
	`permalink_url` text DEFAULT '',
	`message` text DEFAULT '',
	`is_published` integer DEFAULT false,
	`is_hidden` integer DEFAULT false,
	`is_live_clip` integer DEFAULT false,
	`is_spherical` integer DEFAULT false,
	`is_popular` integer DEFAULT false,
	`created_time` integer DEFAULT (unixepoch())
);
