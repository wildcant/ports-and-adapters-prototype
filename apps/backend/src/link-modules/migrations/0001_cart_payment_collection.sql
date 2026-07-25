CREATE TABLE "cart_payment_collection" (
	"id" text PRIMARY KEY DEFAULT CONCAT('cartpaycol_', REPLACE(gen_random_uuid()::text, '-', '')) NOT NULL,
	"cart_id" text NOT NULL,
	"payment_collection_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_cart_payment_collection" ON "cart_payment_collection" USING btree ("cart_id","payment_collection_id") WHERE deleted_at IS NULL;