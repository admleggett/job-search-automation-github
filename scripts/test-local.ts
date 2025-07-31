#!/usr/bin/env node

/**
 * Local testing CLI for job digest service
 * Demonstrates testing outside GitHub Actions using LocalGitHubAdapter
 */

import { config } from "dotenv";
import { readFileSync } from "fs";
import { ConsoleLogger, LocalGitHubAdapter } from "../src/adapters";
import { JobDigestService } from "../src/services/job-digest.service";
import { realWorldSampleDigestJson } from "../tests/fixtures/real-world-fixtures";

// Load environment variables from .env file
config();

async function main() {
  // Check for required environment variables
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER || "your-username";
  const repo = process.env.GITHUB_REPO || "job-search-repo";
  const debugLogging = process.env.DEBUG_LOGGING === "true";

  if (!token) {
    console.error("❌ GITHUB_TOKEN environment variable required");
    console.error("   Copy .env.example to .env and add your GitHub token");
    console.error("   Get a token from: https://github.com/settings/tokens");
    process.exit(1);
  }

  // Read sample digest data
  const digestFile = process.argv[2];
  let digestJson: string;

  if (digestFile) {
    // Use specified file
    try {
      digestJson = readFileSync(digestFile, "utf8");
    } catch (error) {
      console.error(`❌ Could not read digest file: ${digestFile}`);
      console.error("   Using built-in real-world sample instead");
      digestJson = realWorldSampleDigestJson;
    }
  } else {
    // Use built-in real-world sample that works with tests
    console.log(
      "📋 No digest file specified, using built-in real-world sample"
    );
    digestJson = realWorldSampleDigestJson;
  }

  // Set up adapters for local testing
  const githubAdapter = new LocalGitHubAdapter(token, owner, repo);
  const logger = new ConsoleLogger(debugLogging); // Use .env setting

  // Create service with real adapters (not mocks!)
  const service = new JobDigestService(githubAdapter, logger);

  try {
    console.log("🚀 Starting local digest issue creation...");
    console.log(
      `📁 Using digest: ${digestFile || "built-in real-world sample"}`
    );
    console.log(`🎯 Target repo: ${owner}/${repo}`);
    console.log("");

    // Validate digest first
    const validation = await service.validateDigest(digestJson);
    if (!validation.valid) {
      console.error(`❌ Invalid digest data: ${validation.error}`);
      process.exit(1);
    }

    console.log("✅ Digest validation passed");
    console.log(
      `📊 Summary: ${validation.summary!.totalJobs} jobs (${
        validation.summary!.newJobs
      } new)`
    );
    console.log("");

    // Create the issue
    const result = await service.createDigestIssue(digestJson);

    console.log("");
    console.log("🎉 Success! Issue created:");
    console.log(`   Issue #${result.number}`);
    console.log(`   URL: ${result.url}`);
  } catch (error) {
    console.error("💥 Error creating digest issue:");
    console.error(
      `   ${error instanceof Error ? error.message : String(error)}`
    );
    process.exit(1);
  }
}

// Usage information
if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`
🧪 Local Job Digest Testing CLI

Usage:
  npm run test-local [digest-file.json]

Setup:
  1. Copy .env.example to .env
  2. Add your GITHUB_TOKEN to .env
  3. Optionally customize GITHUB_OWNER and GITHUB_REPO

Environment Variables (.env file):
  GITHUB_TOKEN     - GitHub personal access token (required)
  GITHUB_OWNER     - Repository owner (default: your-username)  
  GITHUB_REPO      - Repository name (default: job-search-repo)
  DEBUG_LOGGING    - Enable debug output (true/false)

Examples:
  # Test with sample digest (uses .env file)
  npm run test-local sample-digest.json
  
  # Test with custom digest file
  npm run test-local my-custom-digest.json

Note: Environment variables can still be set directly if .env file is not used.

This script demonstrates the adapter pattern working outside GitHub Actions!
The same JobDigestService works with LocalGitHubAdapter for real API calls.
`);
  process.exit(0);
}

// Run the script
main().catch(console.error);
