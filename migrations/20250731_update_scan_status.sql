ALTER TABLE "scan_status" DROP CONSTRAINT scan_status_pkey;
ALTER TABLE "scan_status" ADD COLUMN "id" uuid DEFAULT gen_random_uuid() NOT NULL;
ALTER TABLE "scan_status" ADD COLUMN "created_at" timestamp DEFAULT now();
ALTER TABLE "scan_status" ADD COLUMN "updated_at" timestamp DEFAULT now();
ALTER TABLE "scan_status" ADD PRIMARY KEY ("id");

