import { CreateIssueParams, GitHubClient, IssueResult } from "../interfaces";

/**
 * GitHub adapter for local development and testing with real API
 * Uses direct REST API calls - perfect for testing outside GitHub Actions
 */
export class LocalGitHubAdapter implements GitHubClient {
  private readonly baseUrl: string;

  constructor(
    private readonly token: string,
    private readonly owner: string,
    private readonly repo: string
  ) {
    this.baseUrl = `https://api.github.com/repos/${owner}/${repo}`;
  }

  async createIssue(params: CreateIssueParams): Promise<IssueResult> {
    try {
      const response = await fetch(`${this.baseUrl}/issues`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": "job-search-automation-github/1.0",
        },
        body: JSON.stringify({
          title: params.title,
          body: params.body,
          labels: params.labels || [],
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as any;
        throw new Error(
          `GitHub API error (${response.status}): ${
            errorData.message || response.statusText
          }`
        );
      }

      const issueData = (await response.json()) as any;
      return {
        number: issueData.number,
        url: issueData.html_url,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create GitHub issue: ${error.message}`);
      }
      throw new Error("Failed to create GitHub issue: Unknown error");
    }
  }
}
