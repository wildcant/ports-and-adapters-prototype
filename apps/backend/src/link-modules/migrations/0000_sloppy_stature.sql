CREATE TABLE "product_variant_inventory_item" (
	"id" text PRIMARY KEY DEFAULT CONCAT('pvitem_', REPLACE(gen_random_uuid()::text, '-', '')) NOT NULL,
	"variant_id" text NOT NULL,
	"inventory_item_id" text NOT NULL,
	"required_quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_pvitem_variant_inventory" ON "product_variant_inventory_item" USING btree ("variant_id","inventory_item_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_pvitem_variant_id" ON "product_variant_inventory_item" USING btree ("variant_id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_pvitem_inventory_item_id" ON "product_variant_inventory_item" USING btree ("inventory_item_id") WHERE deleted_at IS NULL;