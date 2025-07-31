import {
  CreateIssueParams,
  GitHubClient,
  IssueResult,
  Logger,
} from "../../../src/interfaces";
import { JobDigestService } from "../../../src/services/job-digest.service";
import {
  emptyDigestResult,
  invalidDigestSamples,
  multipleJobsDigestResult,
  validDigestResult,
} from "../../fixtures/digest-fixtures";

// Mock implementations
class MockGitHubClient implements GitHubClient {
  public createIssueCalls: CreateIssueParams[] = [];
  public mockResult: IssueResult = {
    number: 123,
    url: "https://github.com/test/repo/issues/123",
  };
  public shouldThrow: boolean = false;
  public throwError: Error = new Error("GitHub API error");

  async createIssue(params: CreateIssueParams): Promise<IssueResult> {
    this.createIssueCalls.push(params);

    if (this.shouldThrow) {
      throw this.throwError;
    }

    return this.mockResult;
  }

  // Test helpers
  reset() {
    this.createIssueCalls = [];
    this.shouldThrow = false;
    this.mockResult = {
      number: 123,
      url: "https://github.com/test/repo/issues/123",
    };
  }

  getLastCall(): CreateIssueParams | undefined {
    return this.createIssueCalls[this.createIssueCalls.length - 1];
  }
}

class MockLogger implements Logger {
  public infoCalls: string[] = [];
  public debugCalls: string[] = [];
  public errorCalls: string[] = [];

  info(message: string): void {
    this.infoCalls.push(message);
  }

  debug(message: string): void {
    this.debugCalls.push(message);
  }

  error(message: string): void {
    this.errorCalls.push(message);
  }

  // Test helpers
  reset() {
    this.infoCalls = [];
    this.debugCalls = [];
    this.errorCalls = [];
  }

  getAllLogs(): { level: string; message: string }[] {
    return [
      ...this.infoCalls.map((msg) => ({ level: "info", message: msg })),
      ...this.debugCalls.map((msg) => ({ level: "debug", message: msg })),
      ...this.errorCalls.map((msg) => ({ level: "error", message: msg })),
    ];
  }
}

describe("JobDigestService", () => {
  let service: JobDigestService;
  let mockGithubClient: MockGitHubClient;
  let mockLogger: MockLogger;

  beforeEach(() => {
    mockGithubClient = new MockGitHubClient();
    mockLogger = new MockLogger();
    service = new JobDigestService(mockGithubClient, mockLogger);
  });

  describe("createDigestIssue", () => {
    describe("successful operations", () => {
      it("should create issue from valid digest with jobs", async () => {
        const digestJson = JSON.stringify(validDigestResult);

        const result = await service.createDigestIssue(digestJson);

        expect(result).toEqual({
          number: 123,
          url: "https://github.com/test/repo/issues/123",
        });

        // Verify GitHub client was called correctly
        expect(mockGithubClient.createIssueCalls).toHaveLength(1);
        const issueCall = mockGithubClient.getLastCall()!;
        expect(issueCall.title).toBe("🎯 3 Job Opportunities (2 new)");
        expect(issueCall.body).toContain("## 📊 Summary");
        expect(issueCall.body).toContain("Senior Software Engineer");
        expect(issueCall.labels).toEqual([
          "job-digest",
          "automated",
          "jobs-3",
          "new-jobs",
        ]);
      });

      it("should create issue from empty digest", async () => {
        const digestJson = JSON.stringify(emptyDigestResult);

        const result = await service.createDigestIssue(digestJson);

        expect(result).toEqual({
          number: 123,
          url: "https://github.com/test/repo/issues/123",
        });

        const issueCall = mockGithubClient.getLastCall()!;
        expect(issueCall.title).toBe("📭 No New Job Opportunities Today");
        expect(issueCall.body).toContain("## 🔍 No Jobs Found");
        expect(issueCall.labels).toEqual([
          "job-digest",
          "automated",
          "jobs-0",
          "no-results",
        ]);
      });

      it("should create issue from multiple jobs digest", async () => {
        const digestJson = JSON.stringify(multipleJobsDigestResult);

        const result = await service.createDigestIssue(digestJson);

        const issueCall = mockGithubClient.getLastCall()!;
        expect(issueCall.title).toBe("🎯 3 Job Opportunities (2 new)");
        expect(issueCall.body).toContain("Senior Software Engineer");
        expect(issueCall.body).toContain("Full Stack Developer");
        expect(issueCall.body).toContain("Frontend Engineer");
        expect(issueCall.labels).toContain("jobs-3");
        expect(issueCall.labels).toContain("new-jobs");
      });

      it("should handle digest with no new jobs correctly", async () => {
        const digestWithoutNew = {
          ...validDigestResult,
          summary: {
            ...validDigestResult.summary,
            new_jobs: 0,
          },
        };
        const digestJson = JSON.stringify(digestWithoutNew);

        await service.createDigestIssue(digestJson);

        const issueCall = mockGithubClient.getLastCall()!;
        expect(issueCall.title).toBe("🎯 3 Job Opportunities");
        expect(issueCall.labels).toEqual(["job-digest", "automated", "jobs-3"]);
        expect(issueCall.labels).not.toContain("new-jobs");
      });
    });

    describe("logging behavior", () => {
      it("should log the complete process flow", async () => {
        const digestJson = JSON.stringify(validDigestResult);

        await service.createDigestIssue(digestJson);

        // Check info logs
        expect(mockLogger.infoCalls).toContain(
          "Starting digest issue creation..."
        );
        expect(mockLogger.infoCalls).toContain(
          "Processed digest: 3 jobs (2 new) from Adzuna, Stack Overflow"
        );
        expect(mockLogger.infoCalls).toContain(
          "✅ Created issue #123: https://github.com/test/repo/issues/123"
        );
        expect(
          mockLogger.infoCalls.some((log) =>
            log.includes("📊 Summary: 3 jobs, avg match score:")
          )
        ).toBe(true);

        // Check debug logs
        expect(
          mockLogger.debugCalls.some((log) =>
            log.startsWith("Digest data length:")
          )
        ).toBe(true);
        expect(
          mockLogger.debugCalls.some((log) => log.startsWith("Issue title:"))
        ).toBe(true);
        expect(
          mockLogger.debugCalls.some((log) =>
            log.startsWith("Issue body length:")
          )
        ).toBe(true);

        // No error logs
        expect(mockLogger.errorCalls).toHaveLength(0);
      });

      it("should log detailed statistics", async () => {
        const digestJson = JSON.stringify(multipleJobsDigestResult);

        await service.createDigestIssue(digestJson);

        const processedLog = mockLogger.infoCalls.find((log) =>
          log.includes("Processed digest:")
        );
        expect(processedLog).toContain("3 jobs (2 new)");
        expect(processedLog).toContain("Adzuna, Stack Overflow");
      });
    });

    describe("error handling", () => {
      it("should handle invalid JSON gracefully", async () => {
        const invalidJson = "{ invalid json }";

        await expect(service.createDigestIssue(invalidJson)).rejects.toThrow(
          "Invalid digest data:"
        );

        expect(mockLogger.errorCalls).toHaveLength(1);
        expect(mockLogger.errorCalls[0]).toContain(
          "Failed to create digest issue:"
        );
        expect(mockGithubClient.createIssueCalls).toHaveLength(0);
      });

      it("should handle missing summary fields", async () => {
        const invalidDigest = JSON.stringify(
          invalidDigestSamples.missingSummary
        );

        await expect(service.createDigestIssue(invalidDigest)).rejects.toThrow(
          "Invalid digest data:"
        );

        expect(mockLogger.errorCalls).toHaveLength(1);
        expect(mockGithubClient.createIssueCalls).toHaveLength(0);
      });

      it("should handle GitHub API errors", async () => {
        mockGithubClient.shouldThrow = true;
        mockGithubClient.throwError = new Error(
          "GitHub API rate limit exceeded"
        );
        const digestJson = JSON.stringify(validDigestResult);

        await expect(service.createDigestIssue(digestJson)).rejects.toThrow(
          "GitHub API rate limit exceeded"
        );

        expect(mockLogger.errorCalls).toHaveLength(1);
        expect(mockLogger.errorCalls[0]).toContain(
          "Failed to create digest issue:"
        );
        expect(mockLogger.errorCalls[0]).toContain(
          "GitHub API rate limit exceeded"
        );
      });

      it("should handle unknown errors", async () => {
        mockGithubClient.shouldThrow = true;
        mockGithubClient.throwError = new Error("");
        const digestJson = JSON.stringify(validDigestResult);

        await expect(service.createDigestIssue(digestJson)).rejects.toThrow();

        expect(mockLogger.errorCalls).toHaveLength(1);
        expect(mockLogger.errorCalls[0]).toContain(
          "Failed to create digest issue:"
        );
      });
    });

    describe("label generation", () => {
      it("should generate correct labels for various job counts", async () => {
        // Single job
        const singleJobDigest = {
          ...validDigestResult,
          summary: {
            ...validDigestResult.summary,
            total_jobs_found: 1,
            new_jobs: 1,
          },
          jobs: [validDigestResult.jobs[0]],
        };

        await service.createDigestIssue(JSON.stringify(singleJobDigest));
        let labels = mockGithubClient.getLastCall()!.labels!;
        expect(labels).toContain("jobs-1");
        expect(labels).toContain("new-jobs");

        mockGithubClient.reset();

        // Large number of jobs
        const manyJobsDigest = {
          ...validDigestResult,
          summary: {
            ...validDigestResult.summary,
            total_jobs_found: 50,
            new_jobs: 0,
          },
        };

        await service.createDigestIssue(JSON.stringify(manyJobsDigest));
        labels = mockGithubClient.getLastCall()!.labels!;
        expect(labels).toContain("jobs-50");
        expect(labels).not.toContain("new-jobs");
        expect(labels).not.toContain("no-results");
      });

      it("should always include base labels", async () => {
        const digestJson = JSON.stringify(validDigestResult);

        await service.createDigestIssue(digestJson);

        const labels = mockGithubClient.getLastCall()!.labels!;
        expect(labels).toContain("job-digest");
        expect(labels).toContain("automated");
      });
    });

    describe("integration with internal services", () => {
      it("should properly coordinate DigestProcessor and IssueFormatter", async () => {
        const digestJson = JSON.stringify(multipleJobsDigestResult);

        await service.createDigestIssue(digestJson);

        const issueCall = mockGithubClient.getLastCall()!;

        // Verify DigestProcessor output is used
        expect(issueCall.title).toContain("3 Job Opportunities");

        // Verify IssueFormatter output structure
        expect(issueCall.body).toContain("## 📊 Summary");
        expect(issueCall.body).toContain("## 💼 Job Opportunities");
        expect(issueCall.body).toContain("### 1. Senior Software Engineer");
        expect(issueCall.body).toContain("🎯 Next Steps");
        expect(issueCall.body).toContain("<details>");
      });
    });
  });

  describe("validateDigest", () => {
    it("should validate correct digest and return summary", async () => {
      const digestJson = JSON.stringify(validDigestResult);

      const result = await service.validateDigest(digestJson);

      expect(result.valid).toBe(true);
      expect(result.summary).toEqual({
        totalJobs: 3,
        newJobs: 2,
        sources: ["Adzuna", "Stack Overflow"],
        avgMatchScore: 0.95,
      });
      expect(result.error).toBeUndefined();
    });

    it("should validate empty digest", async () => {
      const digestJson = JSON.stringify(emptyDigestResult);

      const result = await service.validateDigest(digestJson);

      expect(result.valid).toBe(true);
      expect(result.summary!.totalJobs).toBe(0);
      expect(result.summary!.newJobs).toBe(0);
    });

    it("should return validation error for invalid digest", async () => {
      const invalidJson = "{ invalid json }";

      const result = await service.validateDigest(invalidJson);

      expect(result.valid).toBe(false);
      expect(result.summary).toBeUndefined();
      expect(result.error).toContain("Invalid digest data:");
    });

    it("should return validation error for missing required fields", async () => {
      const invalidDigest = JSON.stringify(invalidDigestSamples.missingSummary);

      const result = await service.validateDigest(invalidDigest);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid digest data:");
    });

    it("should not call GitHub client during validation", async () => {
      const digestJson = JSON.stringify(validDigestResult);

      await service.validateDigest(digestJson);

      expect(mockGithubClient.createIssueCalls).toHaveLength(0);
    });

    it("should not log during validation", async () => {
      const digestJson = JSON.stringify(validDigestResult);

      await service.validateDigest(digestJson);

      expect(mockLogger.infoCalls).toHaveLength(0);
      expect(mockLogger.debugCalls).toHaveLength(0);
      expect(mockLogger.errorCalls).toHaveLength(0);
    });
  });

  describe("dependency injection", () => {
    it("should use injected GitHub client", async () => {
      const customClient = new MockGitHubClient();
      customClient.mockResult = { number: 999, url: "https://custom.url" };
      const customService = new JobDigestService(customClient, mockLogger);

      const result = await customService.createDigestIssue(
        JSON.stringify(validDigestResult)
      );

      expect(result).toEqual({ number: 999, url: "https://custom.url" });
      expect(customClient.createIssueCalls).toHaveLength(1);
      expect(mockGithubClient.createIssueCalls).toHaveLength(0);
    });

    it("should use injected logger", async () => {
      const customLogger = new MockLogger();
      const customService = new JobDigestService(
        mockGithubClient,
        customLogger
      );

      await customService.createDigestIssue(JSON.stringify(validDigestResult));

      expect(customLogger.infoCalls.length).toBeGreaterThan(0);
      expect(mockLogger.infoCalls).toHaveLength(0);
    });
  });

  describe("performance", () => {
    it("should complete within reasonable time", async () => {
      const digestJson = JSON.stringify(multipleJobsDigestResult);
      const start = Date.now();

      await service.createDigestIssue(digestJson);

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should handle large digest efficiently", async () => {
      const largeDigest = {
        ...validDigestResult,
        summary: { ...validDigestResult.summary, total_jobs_found: 100 },
        jobs: Array.from({ length: 100 }, (_, i) => ({
          ...validDigestResult.jobs[0],
          id: `job-${i}`,
          title: `Job ${i + 1}`,
        })),
      };

      const start = Date.now();
      await service.createDigestIssue(JSON.stringify(largeDigest));
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200); // Should handle 100 jobs in under 200ms
      expect(mockGithubClient.getLastCall()!.labels).toContain("jobs-100");
    });
  });
});
