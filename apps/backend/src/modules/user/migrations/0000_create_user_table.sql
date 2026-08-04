CREATE TABLE "user" (
	"id" text PRIMARY KEY DEFAULT CONCAT('usr_', REPLACE(gen_random_uuid()::text, '-', '')) NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
