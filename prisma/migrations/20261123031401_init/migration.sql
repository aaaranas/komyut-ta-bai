-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "subject_hash" TEXT NOT NULL,
    "email_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pseudonym" (
    "pseudonym" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "user_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pseudonym_pkey" PRIMARY KEY ("pseudonym")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "stop_id" TEXT NOT NULL,
    "route_id" TEXT,
    "details" JSONB NOT NULL,
    "contributor" TEXT NOT NULL,
    "observed_at" TIMESTAMPTZ(3) NOT NULL,
    "submitted_at" TIMESTAMPTZ(3) NOT NULL,
    "distance_to_stop_m" INTEGER,
    "withdrawn_at" TIMESTAMPTZ(3),
    "replay" JSONB,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Label" (
    "report_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "basis" TEXT NOT NULL,
    "labeled_at" TIMESTAMPTZ(3) NOT NULL,
    "note" TEXT,
    "split" TEXT NOT NULL DEFAULT 'dev',

    CONSTRAINT "Label_pkey" PRIMARY KEY ("report_id")
);

-- CreateTable
CREATE TABLE "Official" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "area" JSONB NOT NULL,
    "reading" JSONB,
    "observed_at" TIMESTAMPTZ(3) NOT NULL,
    "valid_until" TIMESTAMPTZ(3),
    "connection" TEXT NOT NULL,
    "replay" JSONB,

    CONSTRAINT "Official_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "from_stop_id" TEXT NOT NULL,
    "to_stop_id" TEXT NOT NULL,
    "minutes" DOUBLE PRECISION NOT NULL,
    "observed_at" TIMESTAMPTZ(3) NOT NULL,
    "contributor" TEXT NOT NULL,
    "trace_id" TEXT NOT NULL,
    "replay" JSONB,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trace" (
    "id" TEXT NOT NULL,
    "contributor" TEXT NOT NULL,
    "route_id" TEXT NOT NULL,
    "submitted_at" TIMESTAMPTZ(3) NOT NULL,
    "points_total" INTEGER NOT NULL,
    "points_used" INTEGER NOT NULL,
    "accepted_segments" INTEGER NOT NULL,
    "rejected_segments" INTEGER NOT NULL,

    CONSTRAINT "Trace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Validation" (
    "id" TEXT NOT NULL,
    "origin_id" TEXT NOT NULL,
    "destination_id" TEXT NOT NULL,
    "depart_at" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "observed_mins" DOUBLE PRECISION NOT NULL,
    "baseline_mins" DOUBLE PRECISION,
    "enriched_mins" DOUBLE PRECISION,
    "recorded_at" TIMESTAMPTZ(3) NOT NULL,
    "note" TEXT,

    CONSTRAINT "Validation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropagationMark" (
    "event_id" TEXT NOT NULL,
    "source_at" TIMESTAMPTZ(3) NOT NULL,
    "first_route_response_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "PropagationMark_pkey" PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_subject_hash_key" ON "User"("subject_hash");

-- CreateIndex
CREATE UNIQUE INDEX "Pseudonym_nickname_key" ON "Pseudonym"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "Pseudonym_user_id_key" ON "Pseudonym"("user_id");

-- CreateIndex
CREATE INDEX "Report_contributor_idx" ON "Report"("contributor");

-- CreateIndex
CREATE INDEX "Report_submitted_at_idx" ON "Report"("submitted_at");

-- CreateIndex
CREATE INDEX "Segment_route_id_from_stop_id_to_stop_id_idx" ON "Segment"("route_id", "from_stop_id", "to_stop_id");

-- AddForeignKey
ALTER TABLE "Pseudonym" ADD CONSTRAINT "Pseudonym_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
