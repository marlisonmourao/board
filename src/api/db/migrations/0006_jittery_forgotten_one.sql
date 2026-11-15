DELETE FROM "issue_likes" AS duplicate
USING "issue_likes" AS kept
WHERE duplicate."issue_id" = kept."issue_id"
  AND duplicate."user_id" = kept."user_id"
  AND (duplicate."created_at", duplicate."id") > (kept."created_at", kept."id");--> statement-breakpoint
UPDATE "issues" SET "likes" = (SELECT count(*) FROM "issue_likes" WHERE "issue_likes"."issue_id" = "issues"."id");--> statement-breakpoint
CREATE UNIQUE INDEX "issue_likes_issue_user_unique" ON "issue_likes" USING btree ("issue_id","user_id");
