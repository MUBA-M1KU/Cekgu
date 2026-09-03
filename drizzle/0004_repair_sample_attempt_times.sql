-- Repairs the persisted sample attempt timestamps (#119). #106 corrected attemptTimes() in
-- src/server/sample.ts, but seedSample() returns early when a sample record already exists, so a
-- redeploy never reaches the rows that were written before that fix. On production all 42 sample
-- attempts carried finished_at four milliseconds BEFORE started_at, with an elapsed delta
-- unrelated to the latency_ms the benchmark actually measured.
--
-- The fixture carries no timestamps, only latency_ms, so this reproduces exactly what a fresh
-- seed of the same fixture produces: finished_at = started_at + latency_ms. The duration is the
-- measured number; the instants remain a reconstruction, which is what sample.ts already says.
--
-- Scoped to is_sample = true so it can never touch a real account's attempts, and predicated on
-- the defect so re-running it is a no-op and a fresh database matches nothing.
UPDATE "attempts" AS a
SET "finished_at" = a."started_at" + (COALESCE(a."latency_ms", 0) || ' milliseconds')::interval
WHERE a."started_at" IS NOT NULL
  AND a."finished_at" IS NOT NULL
  AND a."finished_at" < a."started_at"
  AND a."item_id" IN (
    SELECT i."id"
    FROM "items" i
    JOIN "records" r ON r."id" = i."record_id"
    WHERE r."is_sample" = true
  );
