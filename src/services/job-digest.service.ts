import { GitHubClient, IssueResult, Logger } from "../interfaces";
import { DigestProcessor } from "./digest-processor";
import { IssueFormatter } from "./issue-formatter";

/**
 * Platform-agnostic service for creating job digest issues
 * No dependencies on GitHub Actions - uses dependency injection
 */
export class JobDigestService {
  constructor(private githubClient: GitHubClient, private logger: Logger) {}

  /**
   * Create a GitHub issue from job digest JSON data
   */
  async createDigestIssue(digestJson: string): Promise<IssueResult> {
    try {
      this.logger.info("Starting digest issue creation...");
      this.logger.debug(`Digest data length: ${digestJson.length} characters`);

      // Parse and validate digest data using pure business logic
      const processor = new DigestProcessor();
      const digest = processor.parse(digestJson);

      const stats = processor.getSummaryStats(digest);
      this.logger.info(
        `Processed digest: ${stats.totalJobs} jobs (${
          stats.newJobs
        } new) from ${stats.sources.join(", ")}`
      );

      // Format issue content using pure business logic
      const formatter = new IssueFormatter();
      const issueContent = formatter.format(digest);

      this.logger.debug(`Issue title: ${issueContent.title}`);
      this.logger.debug(
        `Issue body length: ${issueContent.body.length} characters`
      );

      // Create issue using injected GitHub client
      const issue = await this.githubClient.createIssue({
        title: issueContent.title,
        body: issueContent.body,
        labels: [
          "job-digest",
          "automated",
          `jobs-${digest.summary.total_jobs_found}`,
          ...(digest.summary.new_jobs > 0 ? ["new-jobs"] : []),
          ...(digest.summary.total_jobs_found === 0 ? ["no-results"] : []),
        ],
      });

      this.logger.info(`✅ Created issue #${issue.number}: ${issue.url}`);
      this.logger.info(
        `📊 Summary: ${stats.totalJobs} jobs, avg match score: ${stats.avgMatchScore}`
      );

      return issue;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error(`Failed to create digest issue: ${errorMessage}`);
      throw error;
    }
  }

  /**
   * Validate digest JSON without creating an issue (useful for testing)
   */
  async validateDigest(
    digestJson: string
  ): Promise<{ valid: boolean; summary?: any; error?: string }> {
    try {
      const processor = new DigestProcessor();
      const digest = processor.parse(digestJson);
      const stats = processor.getSummaryStats(digest);

      return {
        valid: true,
        summary: {
          totalJobs: stats.totalJobs,
          newJobs: stats.newJobs,
          sources: stats.sources,
          avgMatchScore: stats.avgMatchScore,
        },
      };
    } catch (error) {
      return {
        valid: false,
        error:
          error instanceof Error ? error.message : "Unknown validation error",
      };
    }
  }
}
