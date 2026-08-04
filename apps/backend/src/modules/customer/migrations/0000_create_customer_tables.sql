CREATE TYPE "public"."customer_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "customer_address" (
	"id" text PRIMARY KEY DEFAULT CONCAT('cuaddr_', REPLACE(gen_random_uuid()::text, '-', '')) NOT NULL,
	"customer_id" text NOT NULL,
	"address_name" text,
	"is_default_shipping" boolean DEFAULT false NOT NULL,
	"is_default_billing" boolean DEFAULT false NOT NULL,
	"company" text,
	"first_name" text,
	"last_name" text,
	"address_1" text,
	"address_2" text,
	"city" text,
	"country_code" text,
	"province" text,
	"postal_code" text,
	"phone" text,
	"metadata" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "customer" (
	"id" text PRIMARY KEY DEFAULT CONCAT('cus_', REPLACE(gen_random_uuid()::text, '-', '')) NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text NOT NULL,
	"status" "customer_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "customer_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "customer_address" ADD CONSTRAINT "customer_address_customer_id_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_customer_address_customer_id" ON "customer_address" USING btree ("customer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_customer_address_unique_customer_billing" ON "customer_address" USING btree ("customer_id") WHERE is_default_billing = true;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_customer_address_unique_customer_shipping" ON "customer_address" USING btree ("customer_id") WHERE is_default_shipping = true;