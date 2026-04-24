CREATE TABLE `address` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`postal_code` varchar(7) NOT NULL,
	`default_address` text NOT NULL,
	`detail_address` text,
	`extra_address` text,
	`is_main` boolean NOT NULL DEFAULT false,
	`is_valid` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `pk_address` PRIMARY KEY(`id`),
	CONSTRAINT `uq_main_address` UNIQUE(
       (
        CASE
          WHEN `is_main` = true THEN `user_id`
          ELSE NULL
        END
      )
      )
);
--> statement-breakpoint
CREATE TABLE `native_user` (
	`id` bigint NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	CONSTRAINT `pk_native_user` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `refresh_token` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`token` varchar(255) NOT NULL,
	`expires_at` timestamp NOT NULL,
	CONSTRAINT `pk_refresh_token` PRIMARY KEY(`id`),
	CONSTRAINT `uq_active_refresh_token` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `social_provider` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`provider_name` varchar(255) NOT NULL,
	CONSTRAINT `pk_social_provider` PRIMARY KEY(`id`),
	CONSTRAINT `uq_social_provider_name` UNIQUE(`provider_name`)
);
--> statement-breakpoint
CREATE TABLE `social_user` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_id` bigint NOT NULL,
	`provider_id` bigint NOT NULL,
	`provider_user_name` varchar(255) NOT NULL,
	CONSTRAINT `pk_social_user` PRIMARY KEY(`id`),
	CONSTRAINT `uq_social_user_provider` UNIQUE(`user_id`,`provider_id`,`provider_user_name`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` bigint AUTO_INCREMENT NOT NULL,
	`user_name` varchar(255) NOT NULL,
	`auth_type` varchar(10) NOT NULL,
	`auth_role` varchar(10) NOT NULL DEFAULT 'USER',
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	`deleted_at` timestamp,
	CONSTRAINT `pk_user` PRIMARY KEY(`id`),
	CONSTRAINT `uq_active_user_name` UNIQUE(
      (
        CASE
          WHEN (`auth_type` <> 'SOCIAL') AND (`auth_role` <> 'LEFT') THEN `user_name`
          ELSE NULL
        END
      )
      ),
	CONSTRAINT `ch_auth_type` CHECK(`user`.`auth_type` IN('NATIVE','SOCIAL','CROSS')),
	CONSTRAINT `ck_auth_role` CHECK(`user`.`auth_role` IN('USER','ADMIN','LEFT'))
);
--> statement-breakpoint
ALTER TABLE `address` ADD CONSTRAINT `fk_address_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `native_user` ADD CONSTRAINT `fk_native_user` FOREIGN KEY (`id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `refresh_token` ADD CONSTRAINT `fk_refresh_token_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_user` ADD CONSTRAINT `fk_social_user` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `social_user` ADD CONSTRAINT `fk_social_provider` FOREIGN KEY (`provider_id`) REFERENCES `social_provider`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `ix_refresh_token_user` ON `refresh_token` (`user_id`);--> statement-breakpoint
CREATE INDEX `ix_refresh_token_expire` ON `refresh_token` (`expires_at`);--> statement-breakpoint
CREATE INDEX `ix_user_created` ON `user` (`user_name`,`created_at`);--> statement-breakpoint
CREATE INDEX `ix_user_deleted` ON `user` (`user_name`,`deleted_at`);