import { config } from "dotenv";
import { ConsoleLogger } from "../../src/adapters/console-logger.adapter";
import { LocalGitHubAdapter } from "../../src/adapters/local-github.adapter";
import { JobDigestService } from "../../src/services/job-digest.service";
import { realWorldSampleDigestJson } from "../fixtures/real-world-fixtures";

// Load environment variables from .env file for testing
config();

describe("LocalGitHubAdapter Integration", () => {
  // Only run if we have a token for real API testing
  const skipReal = !process.env.GITHUB_TOKEN || !process.env.TEST_REPO;

  describe("Local GitHub Adapter", () => {
    it("should implement GitHubClient interface", () => {
      const adapter = new LocalGitHubAdapter("fake-token", "owner", "repo");

      // Verify it has the required method
      expect(typeof adapter.createIssue).toBe("function");
    });

    it("should work with JobDigestService", () => {
      const adapter = new LocalGitHubAdapter("fake-token", "owner", "repo");
      const logger = new ConsoleLogger(false);
      const service = new JobDigestService(adapter, logger);

      // Verify service can be created with real adapters
      expect(service).toBeInstanceOf(JobDigestService);
    });

    (skipReal ? it.skip : it)(
      "should create real GitHub issue",
      async () => {
        // This test only runs if GITHUB_TOKEN and TEST_REPO are set
        const token = process.env.GITHUB_TOKEN!;
        const [owner, repo] = process.env.TEST_REPO!.split("/");

        const adapter = new LocalGitHubAdapter(token, owner, repo);
        const logger = new ConsoleLogger(false);
        const service = new JobDigestService(adapter, logger);

        // Use the same real-world digest that works with npm run test-local
        const result = await service.createDigestIssue(
          realWorldSampleDigestJson
        );

        expect(result.number).toBeGreaterThan(0);
        expect(result.url).toMatch(/https:\/\/github\.com\/.*\/issues\/\d+/);

        console.log(`✅ Created test issue: ${result.url}`);
      },
      10000
    ); // 10 second timeout for API call
  });

  describe("ConsoleLogger", () => {
    it("should implement Logger interface", () => {
      const logger = new ConsoleLogger();

      expect(typeof logger.info).toBe("function");
      expect(typeof logger.debug).toBe("function");
      expect(typeof logger.error).toBe("function");
    });

    it("should work with debug enabled/disabled", () => {
      const debugLogger = new ConsoleLogger(true);
      const prodLogger = new ConsoleLogger(false);

      // Should not throw
      expect(() => {
        debugLogger.debug("debug message");
        prodLogger.debug("debug message");
      }).not.toThrow();
    });
  });
});
