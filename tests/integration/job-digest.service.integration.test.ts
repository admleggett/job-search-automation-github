// Integration tests for JobDigestService orchestrator
// Tests the complete pipeline: JSON parsing → validation → formatting → GitHub issue creation

import {
  CreateIssueParams,
  GitHubClient,
  IssueResult,
  Logger,
} from "../../src/interfaces";
import { JobDigestService } from "../../src/services/job-digest.service";
import { integrationFixtures } from "../fixtures/integration-fixtures";
import { realWorldSampleDigestJson } from "../fixtures/real-world-fixtures";

// More realistic mock implementations for integration testing
class IntegrationGitHubClient implements GitHubClient {
  public apiCalls: CreateIssueParams[] = [];
  public responseDelay: number = 0;
  public shouldSimulateNetworkIssues: boolean = false;
  public networkFailureRate: number = 0.1;

  async createIssue(params: CreateIssueParams): Promise<IssueResult> {
    this.apiCalls.push(params);

    // Simulate network delay
    if (this.responseDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.responseDelay));
    }

    // Simulate occasional network failures
    if (
      this.shouldSimulateNetworkIssues &&
      Math.random() < this.networkFailureRate
    ) {
      throw new Error("GitHub API: Network timeout");
    }

    // Simulate realistic GitHub response
    const issueNumber = 1000 + this.apiCalls.length;
    return {
      number: issueNumber,
      url: `https://github.com/test-org/job-search-repo/issues/${issueNumber}`,
    };
  }

  reset() {
    this.apiCalls = [];
    this.responseDelay = 0;
    this.shouldSimulateNetworkIssues = false;
  }

  getLatestIssue(): CreateIssueParams | undefined {
    return this.apiCalls[this.apiCalls.length - 1];
  }
}

class IntegrationLogger implements Logger {
  public logs: { level: string; message: string; timestamp: string }[] = [];

  info(message: string): void {
    this.logs.push({
      level: "info",
      message,
      timestamp: new Date().toISOString(),
    });
  }

  debug(message: string): void {
    this.logs.push({
      level: "debug",
      message,
      timestamp: new Date().toISOString(),
    });
  }

  error(message: string): void {
    this.logs.push({
      level: "error",
      message,
      timestamp: new Date().toISOString(),
    });
  }

  reset() {
    this.logs = [];
  }

  getLogsByLevel(level: string): string[] {
    return this.logs
      .filter((log) => log.level === level)
      .map((log) => log.message);
  }

  getRecentLogs(count: number = 5): { level: string; message: string }[] {
    return this.logs
      .slice(-count)
      .map(({ level, message }) => ({ level, message }));
  }
}

describe("JobDigestService Integration Tests", () => {
  let service: JobDigestService;
  let githubClient: IntegrationGitHubClient;
  let logger: IntegrationLogger;

  beforeEach(() => {
    githubClient = new IntegrationGitHubClient();
    logger = new IntegrationLogger();
    service = new JobDigestService(githubClient, logger);
  });

  describe("Real-world digest processing", () => {
    it("should handle typical daily job search results", async () => {
      const digestJson = JSON.stringify(integrationFixtures.realWorldDigest);

      const result = await service.createDigestIssue(digestJson);

      // Verify successful issue creation
      expect(result.number).toBe(1001);
      expect(result.url).toContain(
        "github.com/test-org/job-search-repo/issues/1001"
      );

      // Verify issue content
      const issue = githubClient.getLatestIssue()!;
      expect(issue.title).toBe("🎯 15 Job Opportunities (8 new)");

      // Verify comprehensive body content
      expect(issue.body).toContain("## 📊 Summary");
      expect(issue.body).toContain("**Total Jobs:** 15 (8 new since last run)");
      expect(issue.body).toContain("**Processing Time:** 45.67s");
      expect(issue.body).toContain(
        "LinkedIn, Indeed, Stack Overflow, AngelList, Glassdoor"
      );

      // Verify job listings
      expect(issue.body).toContain("Senior Python Engineer - AI/ML Focus");
      expect(issue.body).toContain("TechVision AI");
      expect(issue.body).toContain("$140,000 - $180,000");
      expect(issue.body).toContain("🎯 95% match");
      expect(issue.body).toContain("Perfect salary match");

      // Verify labels
      expect(issue.labels).toContain("job-digest");
      expect(issue.labels).toContain("automated");
      expect(issue.labels).toContain("jobs-15");
      expect(issue.labels).toContain("new-jobs");

      // Verify logging
      const infoLogs = logger.getLogsByLevel("info");
      expect(infoLogs).toContain("Starting digest issue creation...");
      expect(
        infoLogs.some((log) =>
          log.includes("Processed digest: 15 jobs (8 new)")
        )
      ).toBe(true);
      expect(
        infoLogs.some((log) => log.includes("✅ Created issue #1001"))
      ).toBe(true);
    });

    it("should handle high-volume job search results efficiently", async () => {
      const digestJson = JSON.stringify(integrationFixtures.highVolumeDigest);
      const startTime = Date.now();

      const result = await service.createDigestIssue(digestJson);

      const processingTime = Date.now() - startTime;
      expect(processingTime).toBeLessThan(500); // Should handle 147 jobs in under 500ms

      // Verify issue creation
      const issue = githubClient.getLatestIssue()!;
      expect(issue.title).toBe("🎯 147 Job Opportunities (89 new)");
      expect(issue.labels).toContain("jobs-147");

      // Verify body contains job count information
      expect(issue.body).toContain("**Total Jobs:** 147");
      expect(issue.body).toContain("**Processing Time:** 127.89s");

      // Verify performance logging
      const infoLogs = logger.getLogsByLevel("info");
      expect(infoLogs.some((log) => log.includes("147 jobs (89 new)"))).toBe(
        true
      );
    });

    it("should handle partial failure scenarios gracefully", async () => {
      const digestJson = JSON.stringify(
        integrationFixtures.partialFailureDigest
      );

      const result = await service.createDigestIssue(digestJson);

      // Should still create issue despite warnings/errors in metadata
      expect(result.number).toBe(1001);

      const issue = githubClient.getLatestIssue()!;
      expect(issue.title).toBe("🎯 3 Job Opportunities (3 new)");

      // Verify error/warning information is included
      expect(issue.body).toContain("**Errors:** 2");
      expect(issue.body).toContain("**Warnings:** 2");

      // Should still process valid jobs
      expect(issue.body).toContain("Senior Blockchain Engineer");
      expect(issue.body).toContain("DeFi Protocol");
      expect(issue.body).toContain("Web3 Full Stack Developer");
    });

    it("should handle perfect match scenarios", async () => {
      const digestJson = JSON.stringify(integrationFixtures.perfectMatchDigest);

      const result = await service.createDigestIssue(digestJson);

      const issue = githubClient.getLatestIssue()!;
      expect(issue.title).toBe("🎯 2 Job Opportunities (2 new)");

      // Verify high-quality matches are highlighted
      expect(issue.body).toContain("🎯 98% match");
      expect(issue.body).toContain("🎯 96% match");
      expect(issue.body).toContain("Perfect Django specialization match");
      expect(issue.body).toContain("Django Software Foundation");
      expect(issue.body).toContain("Stack Overflow");

      // Verify comprehensive match reasons
      expect(issue.body).toContain("**✨ Why this matches:**");
      expect(issue.body).toContain("100% remote position");
      expect(issue.body).toContain("Open source contribution opportunity");
    });

    it("should handle single job results appropriately", async () => {
      const digestJson = JSON.stringify(integrationFixtures.singleJobDigest);

      const result = await service.createDigestIssue(digestJson);

      const issue = githubClient.getLatestIssue()!;
      expect(issue.title).toBe("🎯 1 New Job Opportunity");
      expect(issue.labels).toContain("jobs-1");

      // Should use single job guidance
      expect(issue.body).toContain(
        'Ready to apply? Click the "Apply Now" button'
      );
      expect(issue.body).toContain("Systems Engineer - Rust");
      expect(issue.body).toContain("Performance Computing Inc");
    });
  });

  describe("End-to-end pipeline validation", () => {
    it("should validate complete processing pipeline", async () => {
      const digestJson = JSON.stringify(integrationFixtures.realWorldDigest);

      // Test validation first
      const validation = await service.validateDigest(digestJson);
      expect(validation.valid).toBe(true);
      expect(validation.summary!.totalJobs).toBe(15);
      expect(validation.summary!.newJobs).toBe(8);
      expect(validation.summary!.sources).toEqual([
        "LinkedIn",
        "Indeed",
        "Stack Overflow",
        "AngelList",
        "Glassdoor",
      ]);

      // Then test full issue creation
      const result = await service.createDigestIssue(digestJson);
      expect(result.number).toBe(1001);

      // Verify no API calls during validation
      expect(githubClient.apiCalls).toHaveLength(1); // Only the createDigestIssue call
    });

    it("should handle the complete data transformation pipeline", async () => {
      const digestJson = JSON.stringify(integrationFixtures.realWorldDigest);

      await service.createDigestIssue(digestJson);

      const issue = githubClient.getLatestIssue()!;

      // Verify DigestProcessor integration
      expect(issue.title).toContain("15 Job Opportunities");

      // Verify IssueFormatter integration
      expect(issue.body).toMatch(
        /^# Job Search Results - \w+, \w+ \d+, \d{4} at \d+:\d+ [AP]M/
      );
      expect(issue.body).toContain("## 📊 Summary");
      expect(issue.body).toContain("## 💼 Job Opportunities");
      expect(issue.body).toContain("## 🎯 Next Steps");
      expect(issue.body).toContain("<details>");
      expect(issue.body).toContain("🤖 System Information");

      // Verify job sorting (by match score)
      const bodyContent = issue.body;
      const aiJobIndex = bodyContent.indexOf(
        "Senior Python Engineer - AI/ML Focus"
      ); // 95% match
      const staffJobIndex = bodyContent.indexOf(
        "Staff Software Engineer - Platform"
      ); // 92% match
      expect(aiJobIndex).toBeLessThan(staffJobIndex);

      // Verify action buttons and research links
      expect(issue.body).toContain("[**Apply Now**]");
      expect(issue.body).toContain("[Research Company]");
      expect(issue.body).toContain("[Interview Prep]");
      expect(issue.body).toContain("https://www.google.com/search?q=");
    });

    it("should provide comprehensive logging throughout pipeline", async () => {
      const digestJson = JSON.stringify(integrationFixtures.realWorldDigest);

      await service.createDigestIssue(digestJson);

      const allLogs = logger.logs;
      expect(allLogs.length).toBeGreaterThan(5);

      // Verify log progression
      const infoLogs = logger.getLogsByLevel("info");
      expect(infoLogs[0]).toBe("Starting digest issue creation...");
      expect(infoLogs.some((log) => log.includes("Processed digest:"))).toBe(
        true
      );
      expect(infoLogs.some((log) => log.includes("✅ Created issue"))).toBe(
        true
      );
      expect(infoLogs.some((log) => log.includes("📊 Summary:"))).toBe(true);

      const debugLogs = logger.getLogsByLevel("debug");
      expect(
        debugLogs.some((log) => log.startsWith("Digest data length:"))
      ).toBe(true);
      expect(debugLogs.some((log) => log.startsWith("Issue title:"))).toBe(
        true
      );
      expect(
        debugLogs.some((log) => log.startsWith("Issue body length:"))
      ).toBe(true);

      // No errors for successful operation
      expect(logger.getLogsByLevel("error")).toHaveLength(0);
    });
  });

  describe("Network resilience and error handling", () => {
    it("should handle GitHub API network delays", async () => {
      githubClient.responseDelay = 100; // 100ms delay
      const digestJson = JSON.stringify(integrationFixtures.singleJobDigest);

      const startTime = Date.now();
      const result = await service.createDigestIssue(digestJson);
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeGreaterThanOrEqual(100);
      expect(result.number).toBe(1001);

      // Should still log success despite delay
      const infoLogs = logger.getLogsByLevel("info");
      expect(infoLogs.some((log) => log.includes("✅ Created issue"))).toBe(
        true
      );
    });

    it("should handle GitHub API failures gracefully", async () => {
      githubClient.shouldSimulateNetworkIssues = true;
      githubClient.networkFailureRate = 1.0; // Always fail
      const digestJson = JSON.stringify(integrationFixtures.singleJobDigest);

      await expect(service.createDigestIssue(digestJson)).rejects.toThrow(
        "GitHub API: Network timeout"
      );

      // Should log the error
      const errorLogs = logger.getLogsByLevel("error");
      expect(errorLogs).toHaveLength(1);
      expect(errorLogs[0]).toContain("Failed to create digest issue:");
      expect(errorLogs[0]).toContain("Network timeout");
    });

    it("should handle malformed JSON gracefully in integration context", async () => {
      const malformedJson = '{"query": {"keywords": "test"}, "summary": {'; // Incomplete

      await expect(service.createDigestIssue(malformedJson)).rejects.toThrow(
        "Invalid digest data:"
      );

      // Should not attempt GitHub API call
      expect(githubClient.apiCalls).toHaveLength(0);

      // Should log parsing error
      const errorLogs = logger.getLogsByLevel("error");
      expect(errorLogs[0]).toContain("Failed to create digest issue:");
    });
  });

  describe("Performance and scalability", () => {
    it("should maintain performance with realistic data volumes", async () => {
      const testCases = [
        {
          name: "small",
          fixture: integrationFixtures.singleJobDigest,
          expectedTime: 50,
        },
        {
          name: "medium",
          fixture: integrationFixtures.realWorldDigest,
          expectedTime: 100,
        },
        {
          name: "large",
          fixture: integrationFixtures.highVolumeDigest,
          expectedTime: 300,
        },
      ];

      for (const testCase of testCases) {
        githubClient.reset();
        logger.reset();

        const digestJson = JSON.stringify(testCase.fixture);
        const startTime = Date.now();

        await service.createDigestIssue(digestJson);

        const processingTime = Date.now() - startTime;
        expect(processingTime).toBeLessThan(testCase.expectedTime);

        // Verify successful processing
        expect(githubClient.apiCalls).toHaveLength(1);
        expect(logger.getLogsByLevel("error")).toHaveLength(0);
      }
    });

    it("should handle concurrent digest processing", async () => {
      const digestPromises = [
        service.createDigestIssue(
          JSON.stringify(integrationFixtures.singleJobDigest)
        ),
        service.createDigestIssue(
          JSON.stringify(integrationFixtures.realWorldDigest)
        ),
        service.createDigestIssue(
          JSON.stringify(integrationFixtures.perfectMatchDigest)
        ),
      ];

      const results = await Promise.all(digestPromises);

      // All should succeed
      expect(results).toHaveLength(3);
      results.forEach((result, index) => {
        expect(result.number).toBe(1001 + index);
        expect(result.url).toContain(`issues/${1001 + index}`);
      });

      // Should have made 3 API calls
      expect(githubClient.apiCalls).toHaveLength(3);

      // Verify different issue titles
      const [singleJob, realWorld, perfectMatch] = githubClient.apiCalls;
      expect(singleJob.title).toBe("🎯 1 New Job Opportunity");
      expect(realWorld.title).toBe("🎯 15 Job Opportunities (8 new)");
      expect(perfectMatch.title).toBe("🎯 2 Job Opportunities (2 new)");
    });
  });

  describe("Data quality and content validation", () => {
    it("should preserve all critical job information", async () => {
      const digestJson = JSON.stringify(integrationFixtures.realWorldDigest);

      await service.createDigestIssue(digestJson);

      const issue = githubClient.getLatestIssue()!;
      const body = issue.body;

      // Verify all jobs are included
      expect(body).toContain("Senior Python Engineer - AI/ML Focus");
      expect(body).toContain("Staff Software Engineer - Platform Engineering");
      expect(body).toContain("Senior Backend Engineer");
      expect(body).toContain("Founding Engineer - Python/Data");
      expect(body).toContain("Senior Software Engineer - DevOps");

      // Verify job details are preserved
      expect(body).toContain("TechVision AI");
      expect(body).toContain("$140,000 - $180,000");
      expect(body).toContain("Remote (US)");
      expect(body).toContain("Perfect salary match");

      // Verify metadata preservation
      expect(body).toContain("**Generated:** 2025-07-31T12:00:00Z");
      expect(body).toContain("**Version:** 2.1.4");
      expect(body).toContain("**Warnings:** 2");
    });

    it("should generate appropriate labels for different scenarios", async () => {
      const testCases = [
        {
          name: "empty results",
          fixture: {
            ...integrationFixtures.singleJobDigest,
            summary: {
              ...integrationFixtures.singleJobDigest.summary,
              total_jobs_found: 0,
              new_jobs: 0, // Explicitly set new_jobs to 0
            },
            jobs: [],
          },
          expectedLabels: ["job-digest", "automated", "jobs-0", "no-results"],
        },
        {
          name: "single job",
          fixture: integrationFixtures.singleJobDigest,
          expectedLabels: ["job-digest", "automated", "jobs-1", "new-jobs"],
        },
        {
          name: "multiple jobs with new",
          fixture: integrationFixtures.realWorldDigest,
          expectedLabels: ["job-digest", "automated", "jobs-15", "new-jobs"],
        },
        {
          name: "multiple jobs without new",
          fixture: {
            ...integrationFixtures.realWorldDigest,
            summary: {
              ...integrationFixtures.realWorldDigest.summary,
              new_jobs: 0,
            },
          },
          expectedLabels: ["job-digest", "automated", "jobs-15"],
        },
      ];

      for (const testCase of testCases) {
        githubClient.reset();

        const digestJson = JSON.stringify(testCase.fixture);
        await service.createDigestIssue(digestJson);

        const issue = githubClient.getLatestIssue()!;
        testCase.expectedLabels.forEach((label) => {
          expect(issue.labels).toContain(label);
        });

        if (!testCase.expectedLabels.includes("new-jobs")) {
          expect(issue.labels).not.toContain("new-jobs");
        }
        if (!testCase.expectedLabels.includes("no-results")) {
          expect(issue.labels).not.toContain("no-results");
        }
      }
    });
  });

  describe("Service coordination and state management", () => {
    it("should maintain service isolation and state", async () => {
      // Process multiple different digests
      await service.createDigestIssue(
        JSON.stringify(integrationFixtures.singleJobDigest)
      );
      await service.createDigestIssue(
        JSON.stringify(integrationFixtures.realWorldDigest)
      );

      // Each should be processed independently
      expect(githubClient.apiCalls).toHaveLength(2);

      const [firstIssue, secondIssue] = githubClient.apiCalls;
      expect(firstIssue.title).toBe("🎯 1 New Job Opportunity");
      expect(secondIssue.title).toBe("🎯 15 Job Opportunities (8 new)");

      // Should have independent issue numbers
      expect(githubClient.apiCalls.map((call) => call.title)).toEqual([
        "🎯 1 New Job Opportunity",
        "🎯 15 Job Opportunities (8 new)",
      ]);
    });

    it("should validate service lifecycle methods", async () => {
      const digestJson = JSON.stringify(integrationFixtures.perfectMatchDigest);

      // Test validation-only workflow
      const validation = await service.validateDigest(digestJson);
      expect(validation.valid).toBe(true);
      expect(githubClient.apiCalls).toHaveLength(0);
      expect(logger.logs).toHaveLength(0);

      // Test full creation workflow
      const result = await service.createDigestIssue(digestJson);
      expect(result.number).toBe(1001);
      expect(githubClient.apiCalls).toHaveLength(1);
      expect(logger.logs.length).toBeGreaterThan(0);

      // Validation and creation should produce consistent results
      expect(validation.summary!.totalJobs).toBe(2);
      const issue = githubClient.getLatestIssue()!;
      expect(issue.title).toContain("2 Job Opportunities");
    });
  });

  describe("Real-World Sample Digest", () => {
    it("should process the working sample digest from local testing", async () => {
      const githubClient = new IntegrationGitHubClient();
      const logger = new IntegrationLogger();
      const service = new JobDigestService(githubClient, logger);

      // This is the same digest that works with the local testing script
      const result = await service.createDigestIssue(realWorldSampleDigestJson);

      expect(result.number).toBeGreaterThan(0);
      expect(result.url).toMatch(/https:\/\/github\.com/);

      // Verify issue content matches expected format
      const issue = githubClient.getLatestIssue()!;
      expect(issue.title).toBe("🎯 2 Job Opportunities (1 new)");
      expect(issue.body).toContain("## 📊 Summary");
      expect(issue.body).toContain("Senior TypeScript Developer");
      expect(issue.body).toContain("Full Stack Engineer - JavaScript Focus");
      expect(issue.body).toContain("TechCorp Solutions");
      expect(issue.body).toContain("StartupXYZ");

      // Verify labels
      expect(issue.labels).toContain("job-digest");
      expect(issue.labels).toContain("automated");
      expect(issue.labels).toContain("jobs-2");
      expect(issue.labels).toContain("new-jobs");
    });

    it("should validate the working sample digest structure", async () => {
      const githubClient = new IntegrationGitHubClient();
      const logger = new IntegrationLogger();
      const service = new JobDigestService(githubClient, logger);

      const validation = await service.validateDigest(
        realWorldSampleDigestJson
      );

      expect(validation.valid).toBe(true);
      expect(validation.summary).toBeDefined();
      expect(validation.summary!.totalJobs).toBe(2);
      expect(validation.summary!.newJobs).toBe(1);
      expect(validation.summary!.sources).toEqual(["Adzuna", "Stack Overflow"]);
      expect(validation.error).toBeUndefined();
    });

    it("should match local testing behavior exactly", async () => {
      const githubClient = new IntegrationGitHubClient();
      const logger = new IntegrationLogger();
      const service = new JobDigestService(githubClient, logger);

      // Process the same digest used in npm run test-local
      const result = await service.createDigestIssue(realWorldSampleDigestJson);

      // Should produce the same results as local testing
      const issue = githubClient.getLatestIssue()!;

      // Title should match the format from local test
      expect(issue.title).toBe("🎯 2 Job Opportunities (1 new)");

      // Body should contain both jobs
      expect(issue.body).toContain("Senior TypeScript Developer");
      expect(issue.body).toContain("$90,000 - $120,000");
      expect(issue.body).toContain("Full Stack Engineer - JavaScript Focus");
      expect(issue.body).toContain("$85,000 - $110,000");

      // Should have expected statistics
      expect(issue.body).toContain("**Total Jobs:** 2");
      expect(issue.body).toContain("(1 new since last run)");
      expect(issue.body).toContain("**Sources:** Adzuna, Stack Overflow");
    });
  });
});
