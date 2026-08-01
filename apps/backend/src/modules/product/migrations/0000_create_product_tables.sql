CREATE TABLE "product_image" (
	"id" text PRIMARY KEY DEFAULT CONCAT('img_', REPLACE(gen_random_uuid()::text, '-', '')) NOT NULL,
	"product_id" text NOT NULL,
	"url" text NOT NULL,
	"rank" integer DEFAULT 0 NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "product_option" (
	"id" text PRIMARY KEY DEFAULT CONCAT('opt_', REPLACE(gen_random_uuid()::text, '-', '')) NOT NULL,
	"product_id" text NOT NULL,
	"title" text NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "product_option_value" (
	"id" text PRIMARY KEY DEFAULT CONCAT('optval_', REPLACE(gen_random_uuid()::text, '-', '')) NOT NULL,
	"option_id" text NOT NULL,
	"value" text NOT NULL,
	"rank" integer DEFAULT 0,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "product" (
	"id" text PRIMARY KEY DEFAULT CONCAT('prod_', REPLACE(gen_random_uuid()::text, '-', '')) NOT NULL,
	"title" text NOT NULL,
	"handle" text NOT NULL,
	"subtitle" text,
	"description" text,
	"is_giftcard" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"thumbnail" text,
	"weight" double precision,
	"length" double precision,
	"height" double precision,
	"width" double precision,
	"origin_country" text,
	"hs_code" text,
	"mid_code" text,
	"material" text,
	"discountable" boolean DEFAULT true NOT NULL,
	"external_id" text,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "product_variant" (
	"id" text PRIMARY KEY DEFAULT CONCAT('variant_', REPLACE(gen_random_uuid()::text, '-', '')) NOT NULL,
	"product_id" text NOT NULL,
	"title" text NOT NULL,
	"sku" text,
	"barcode" text,
	"ean" text,
	"upc" text,
	"allow_backorder" boolean DEFAULT false NOT NULL,
	"manage_inventory" boolean DEFAULT true NOT NULL,
	"hs_code" text,
	"origin_country" text,
	"mid_code" text,
	"material" text,
	"weight" double precision,
	"length" double precision,
	"height" double precision,
	"width" double precision,
	"variant_rank" integer DEFAULT 0,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "product_image" ADD CONSTRAINT "product_image_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_option" ADD CONSTRAINT "product_option_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_option_value" ADD CONSTRAINT "product_option_value_option_id_product_option_id_fk" FOREIGN KEY ("option_id") REFERENCES "public"."product_option"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant" ADD CONSTRAINT "product_variant_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_product_image_product_id" ON "product_image" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_image_url" ON "product_image" USING btree ("url");--> statement-breakpoint
CREATE INDEX "idx_product_image_rank_product_id" ON "product_image" USING btree ("rank","product_id");--> statement-breakpoint
CREATE INDEX "idx_product_option_product_id" ON "product_option" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "idx_product_option_value_option_id" ON "product_option_value" USING btree ("option_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_product_option_value_option_id_value" ON "product_option_value" USING btree ("option_id","value") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_product_handle" ON "product" USING btree ("handle") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX "idx_product_variant_product_id" ON "product_variant" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_product_variant_sku" ON "product_variant" USING btree ("sku") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_product_variant_barcode" ON "product_variant" USING btree ("barcode") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_product_variant_ean" ON "product_variant" USING btree ("ean") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_product_variant_upc" ON "product_variant" USING btree ("upc") WHERE deleted_at IS NULL;