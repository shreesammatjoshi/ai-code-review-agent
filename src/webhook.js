const express = require("express");
const crypto = require("crypto");
const { buildReviewGraph } = require("./graph");

const router = express.Router();

/**
 * Verify the GitHub webhook signature (HMAC-SHA256).
 * Set GITHUB_WEBHOOK_SECRET in .env to enable verification.
 */
function verifySignature(req) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;
  if (!secret) return true; // Skip if no secret configured

  const sig = req.headers["x-hub-signature-256"];
  if (!sig) return false;

  const hmac = crypto.createHmac("sha256", secret);
  const digest =
    "sha256=" + hmac.update(JSON.stringify(req.body)).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(digest));
}

router.post("/webhook", async (req, res) => {
  const event = req.headers["x-github-event"];
  const payload = req.body;

  console.log(`\n📦 GitHub Event: ${event}`);

  // Verify webhook signature
  if (!verifySignature(req)) {
    console.warn("⚠️  Invalid webhook signature — rejected");
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Only handle pull_request events
  if (event !== "pull_request") {
    return res.status(200).json({ status: "ignored", event });
  }

  const { action, pull_request, repository } = payload;

  // Only review on open/update, not close/label/etc.
  if (!["opened", "synchronize"].includes(action)) {
    return res.status(200).json({ status: "ignored", action });
  }

  // Respond to GitHub immediately — processing happens async
  res.status(202).json({ status: "accepted", pr: pull_request.number });

  // Build PR metadata
  const metadata = {
    action,
    pr_number: pull_request.number,
    pr_title: pull_request.title,
    author: pull_request.user.login,
    repo: repository.full_name,
    base_branch: pull_request.base.ref,
    head_branch: pull_request.head.ref,
    diff_url: pull_request.diff_url,
    commits: pull_request.commits,
    changed_files: pull_request.changed_files,
  };

  console.log("✅ PR Metadata:", metadata);

  // Run the full LangGraph review pipeline
  try {
    const graph = buildReviewGraph();

    const finalState = await graph.invoke(
      { metadata },
      {
        metadata: {
          repo: metadata.repo,
          pr_number: metadata.pr_number,
          author: metadata.author,
          base_branch: metadata.base_branch,
        },
      },
    );

    if (finalState.error) {
      console.error("❌ Pipeline error:", finalState.error);
    } else {
      console.log(
        "✅ Review complete. Comment posted:",
        finalState.postResult?.html_url,
      );
    }
  } catch (err) {
    console.error("❌ Unexpected pipeline failure:", err);
  }
});

module.exports = router;
