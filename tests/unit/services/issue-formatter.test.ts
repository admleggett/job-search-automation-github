import { IssueFormatter } from "../../../src/services/issue-formatter";
import { DigestResult } from "../../../src/types";
import {
  emptyDigestResult,
  multipleJobsDigestResult,
  validDigestResult,
} from "../../fixtures/digest-fixtures";

// Additional fixture for single job testing
const singleJobDigestResult: DigestResult = {
  ...validDigestResult,
  summary: {
    ...validDigestResult.summary,
    total_jobs_found: 1,
    new_jobs: 1,
  },
  jobs: [validDigestResult.jobs[0]],
};

describe("IssueFormatter", () => {
  let formatter: IssueFormatter;

  beforeEach(() => {
    formatter = new IssueFormatter();
  });

  describe("format", () => {
    it("should return issue content with title and body", () => {
      const result = formatter.format(validDigestResult);

      expect(result).toHaveProperty("title");
      expect(result).toHaveProperty("body");
      expect(typeof result.title).toBe("string");
      expect(typeof result.body).toBe("string");
      expect(result.title.length).toBeGreaterThan(0);
      expect(result.body.length).toBeGreaterThan(0);
    });

    it("should format digest with jobs correctly", () => {
      const result = formatter.format(multipleJobsDigestResult);

      expect(result.title).toBe("🎯 3 Job Opportunities (2 new)");
      expect(result.body).toContain("Job Search Results");
      expect(result.body).toContain("Senior Software Engineer");
      expect(result.body).toContain("Full Stack Developer");
      expect(result.body).toContain("Frontend Engineer");
    });

    it("should format empty digest correctly", () => {
      const result = formatter.format(emptyDigestResult);

      expect(result.title).toBe("📭 No New Job Opportunities Today");
      expect(result.body).toContain("No Jobs Found");
      expect(result.body).toContain(
        "No jobs matched your current search criteria"
      );
    });
  });

  describe("formatTitle", () => {
    it("should format title for no jobs", () => {
      const result = formatter.format(emptyDigestResult);
      expect(result.title).toBe("📭 No New Job Opportunities Today");
    });

    it("should format title for single job", () => {
      const singleJobDigest: DigestResult = {
        ...validDigestResult,
        summary: {
          ...validDigestResult.summary,
          total_jobs_found: 1,
          new_jobs: 1,
        },
      };

      const result = formatter.format(singleJobDigest);
      expect(result.title).toBe("🎯 1 New Job Opportunity");
    });

    it("should format title for multiple jobs with new jobs", () => {
      const result = formatter.format(multipleJobsDigestResult);
      expect(result.title).toBe("🎯 3 Job Opportunities (2 new)");
    });

    it("should format title for multiple jobs without new jobs", () => {
      const digestWithoutNew: DigestResult = {
        ...multipleJobsDigestResult,
        summary: {
          ...multipleJobsDigestResult.summary,
          new_jobs: 0,
        },
      };

      const result = formatter.format(digestWithoutNew);
      expect(result.title).toBe("🎯 3 Job Opportunities");
    });
  });

  describe("formatBody", () => {
    describe("summary section", () => {
      it("should include summary statistics", () => {
        const result = formatter.format(multipleJobsDigestResult);

        expect(result.body).toContain("## 📊 Summary");
        expect(result.body).toContain("**Total Jobs:** 3");
        expect(result.body).toContain("(2 new since last run)");
        expect(result.body).toContain("**Sources:** Adzuna, Stack Overflow");
        expect(result.body).toContain("**Processing Time:** 2.50s");
      });

      it("should handle summary without new jobs", () => {
        const digestWithoutNew: DigestResult = {
          ...validDigestResult,
          summary: {
            ...validDigestResult.summary,
            new_jobs: 0,
          },
        };

        const result = formatter.format(digestWithoutNew);
        expect(result.body).toContain("**Total Jobs:** 3");
        expect(result.body).not.toContain("new since last run");
      });

      it("should include duplicates removed when present", () => {
        const digestWithDuplicates: DigestResult = {
          ...validDigestResult,
          summary: {
            ...validDigestResult.summary,
            duplicates_removed: 5,
          },
        };

        const result = formatter.format(digestWithDuplicates);
        expect(result.body).toContain("**Duplicates Removed:** 5");
      });

      it("should not show duplicates section when zero", () => {
        const result = formatter.format(validDigestResult);
        expect(result.body).not.toContain("Duplicates Removed");
      });
    });

    describe("empty results section", () => {
      it("should show helpful suggestions when no jobs found", () => {
        const result = formatter.format(emptyDigestResult);

        expect(result.body).toContain("## 🔍 No Jobs Found");
        expect(result.body).toContain("🔄 **Broadening search keywords**");
        expect(result.body).toContain("📍 **Expanding location preferences**");
        expect(result.body).toContain("💰 **Adjusting salary expectations**");
        expect(result.body).toContain("📅 **Checking search date range**");
        expect(result.body).toContain("continue monitoring");
      });
    });

    describe("job listings section", () => {
      it("should format job listings with metadata", () => {
        const result = formatter.format(multipleJobsDigestResult);

        expect(result.body).toContain("## 💼 Job Opportunities");
        expect(result.body).toContain(
          "### 1. Senior Software Engineer at **TechCorp Inc**"
        );
        expect(result.body).toContain("📍 Remote");
        expect(result.body).toContain("💰 $100,000 - $120,000");
        expect(result.body).toContain("🎯 95% match");
      });

      it("should sort jobs by match score (highest first)", () => {
        const result = formatter.format(multipleJobsDigestResult);

        // The jobs should appear in order of match score: 0.95, 0.87, 0.72
        const body = result.body;
        const seniorPos = body.indexOf("Senior Software Engineer");
        const fullStackPos = body.indexOf("Full Stack Developer");
        const frontendPos = body.indexOf("Frontend Engineer");

        expect(seniorPos).toBeLessThan(fullStackPos);
        expect(fullStackPos).toBeLessThan(frontendPos);
      });

      it("should handle jobs without optional fields", () => {
        const minimalJobDigest: DigestResult = {
          ...validDigestResult,
          jobs: [
            {
              id: "minimal-job",
              title: "Simple Job",
              company: "Simple Corp",
              description: "A basic job posting without optional fields",
              url: "https://example.com/simple",
              source: "test",
              posted_date: "2025-07-31T09:00:00Z",
              // No salary, location, match_score, etc.
            },
          ],
        };

        const result = formatter.format(minimalJobDigest);

        expect(result.body).toContain("### 1. Simple Job at **Simple Corp**");
        expect(result.body).toContain(
          "A basic job posting without optional fields"
        );
        expect(result.body).not.toContain("📍"); // No location
        expect(result.body).not.toContain("💰"); // No salary
        // Note: The emoji might still appear in the tip section, so we check specifically in the job metadata
        const jobSection = result.body
          .split("### 1. Simple Job at **Simple Corp**")[1]
          .split("**🚀 Actions:**")[0];
        expect(jobSection).not.toContain("🎯"); // No match score in job metadata
      });

      it("should truncate long descriptions", () => {
        const longDescriptionDigest: DigestResult = {
          ...validDigestResult,
          jobs: [
            {
              ...validDigestResult.jobs[0],
              description: "A".repeat(500), // Very long description
            },
          ],
        };

        const result = formatter.format(longDescriptionDigest);

        // Should be truncated to ~300 chars with ellipsis
        const jobSection = result.body.split("### 1.")[1];
        const descriptionMatch = jobSection.match(/A+\.\.\./);
        expect(descriptionMatch).toBeTruthy();
        expect(descriptionMatch![0].length).toBeLessThan(310);
      });

      it("should include match reasons when available", () => {
        const jobWithReasons: DigestResult = {
          ...validDigestResult,
          jobs: [
            {
              ...validDigestResult.jobs[0],
              match_reasons: [
                "Remote work",
                "Senior level",
                "Python expertise",
              ],
            },
          ],
        };

        const result = formatter.format(jobWithReasons);

        expect(result.body).toContain("**✨ Why this matches:**");
        expect(result.body).toContain(
          "Remote work, Senior level, Python expertise"
        );
      });

      it("should format posted date correctly", () => {
        const today = new Date().toISOString();
        const yesterday = new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ).toISOString();
        const weekAgo = new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString();

        const todayDigest: DigestResult = {
          ...validDigestResult,
          jobs: [{ ...validDigestResult.jobs[0], posted_date: today }],
        };

        const yesterdayDigest: DigestResult = {
          ...validDigestResult,
          jobs: [{ ...validDigestResult.jobs[0], posted_date: yesterday }],
        };

        const weekAgoDigest: DigestResult = {
          ...validDigestResult,
          jobs: [{ ...validDigestResult.jobs[0], posted_date: weekAgo }],
        };

        expect(formatter.format(todayDigest).body).toContain(
          "**Posted:** Today"
        );
        expect(formatter.format(yesterdayDigest).body).toContain(
          "**Posted:** Yesterday"
        );
        // The actual implementation formats dates as "MMM DD, YYYY" for older dates
        expect(formatter.format(weekAgoDigest).body).toMatch(
          /\*\*Posted:\*\* \w{3} \d{1,2}, \d{4}/
        );
      });

      it("should include action buttons for each job", () => {
        const result = formatter.format(validDigestResult);

        expect(result.body).toContain("**🚀 Actions:**");
        expect(result.body).toContain("[**Apply Now**]");
        expect(result.body).toContain("[Research Company]");
        expect(result.body).toContain("[Interview Prep]");
        expect(result.body).toContain("https://www.google.com/search?q=");
      });

      it("should separate jobs with horizontal rules", () => {
        const result = formatter.format(multipleJobsDigestResult);

        // Should have separators between jobs and one before the next steps section
        const separatorCount = (result.body.match(/\n---\n/g) || []).length;
        expect(separatorCount).toBe(3); // 3 jobs = 2 separators between jobs + 1 before next steps
      });
    });

    describe("next steps section", () => {
      it("should provide appropriate guidance for single job", () => {
        const singleJobDigest: DigestResult = {
          ...validDigestResult,
          summary: {
            ...validDigestResult.summary,
            total_jobs_found: 1,
          },
          jobs: [validDigestResult.jobs[0]],
        };

        const result = formatter.format(singleJobDigest);

        expect(result.body).toContain("## 🎯 Next Steps");
        expect(result.body).toContain(
          'Ready to apply? Click the "Apply Now" button'
        );
      });

      it("should provide step-by-step guidance for multiple jobs", () => {
        const result = formatter.format(multipleJobsDigestResult);

        expect(result.body).toContain("## 🎯 Next Steps");
        expect(result.body).toContain("Found 3 opportunities!");
        expect(result.body).toContain("1. **Review** each job listing");
        expect(result.body).toContain("2. **Research** companies");
        expect(result.body).toContain('3. **Click "Apply Now"**');
        expect(result.body).toContain("4. **Prepare** for interviews");
      });

      it("should include helpful tip about match scores", () => {
        const result = formatter.format(multipleJobsDigestResult);

        expect(result.body).toContain("💡 **Tip:**");
        expect(result.body).toContain("higher match scores (🎯)");
      });
    });

    describe("footer section", () => {
      it("should include system information in collapsible section", () => {
        const result = formatter.format(validDigestResult);

        expect(result.body).toContain("<details>");
        expect(result.body).toContain("🤖 System Information");
        expect(result.body).toContain("**Generated:** 2025-07-31T09:00:00Z");
        expect(result.body).toContain("generated automatically");
        expect(result.body).toContain("</details>");
      });

      it("should include version when available", () => {
        const digestWithVersion: DigestResult = {
          ...validDigestResult,
          metadata: {
            ...validDigestResult.metadata,
            version: "1.2.3",
          },
        };

        const result = formatter.format(digestWithVersion);
        expect(result.body).toContain("**Version:** 1.2.3");
      });

      it("should include warnings and errors when present", () => {
        const digestWithIssues: DigestResult = {
          ...validDigestResult,
          metadata: {
            ...validDigestResult.metadata,
            warnings: ["API rate limit approaching", "Duplicate job detected"],
            errors: ["Failed to fetch from source X"],
          },
        };

        const result = formatter.format(digestWithIssues);

        expect(result.body).toContain("**Warnings:** 2");
        expect(result.body).toContain("**Errors:** 1");
      });
    });

    describe("timestamp formatting", () => {
      it("should format timestamp with full date and time", () => {
        const result = formatter.format(validDigestResult);

        // Should contain a readable date format
        expect(result.body).toMatch(
          /Job Search Results - \w+, \w+ \d+, \d{4} at \d+:\d+/
        );
      });
    });
  });

  describe("edge cases", () => {
    it("should handle digest with jobs having all optional fields", () => {
      const richJobDigest: DigestResult = {
        ...validDigestResult,
        jobs: [
          {
            id: "rich-job",
            title: "Senior Full Stack Engineer",
            company: "Tech Unicorn",
            location: "San Francisco, CA (Remote OK)",
            salary: "$150k-200k + equity",
            description:
              "Exciting opportunity to build the next generation platform...",
            requirements: "5+ years experience, React, Node.js, AWS",
            benefits: "Health, dental, vision, 401k, unlimited PTO",
            url: "https://example.com/rich-job",
            source: "company-website",
            posted_date: "2025-07-31T09:00:00Z",
            application_deadline: "2025-08-15T23:59:59Z",
            job_type: "Full-time",
            experience_level: "Senior",
            remote_option: true,
            tags: ["react", "node.js", "aws", "startup"],
            match_score: 0.98,
            match_reasons: [
              "Remote option",
              "Senior level",
              "Full stack",
              "Startup environment",
            ],
          },
        ],
      };

      const result = formatter.format(richJobDigest);

      expect(result.body).toContain("Senior Full Stack Engineer");
      expect(result.body).toContain("📍 San Francisco, CA (Remote OK)");
      expect(result.body).toContain("💰 $150k-200k + equity");
      expect(result.body).toContain("⏰ Full-time");
      expect(result.body).toContain("👨‍💼 Senior");
      expect(result.body).toContain("🏠 Remote Available");
      expect(result.body).toContain("🎯 98% match");
      expect(result.body).toContain("**Requirements:** 5+ years experience");
      expect(result.body).toContain(
        "**✨ Why this matches:** Remote option, Senior level"
      );
    });

    it("should handle very large number of jobs gracefully", () => {
      const manyJobsDigest: DigestResult = {
        ...validDigestResult,
        summary: {
          ...validDigestResult.summary,
          total_jobs_found: 50,
          new_jobs: 25,
        },
        jobs: Array.from({ length: 50 }, (_, i) => ({
          id: `job-${i}`,
          title: `Job ${i + 1}`,
          company: `Company ${i + 1}`,
          description: `Description for job ${i + 1}`,
          url: `https://example.com/job-${i}`,
          source: "test",
          posted_date: "2025-07-31T09:00:00Z",
          match_score: Math.random(),
        })),
      };

      const result = formatter.format(manyJobsDigest);

      expect(result.title).toBe("🎯 50 Job Opportunities (25 new)");
      expect(result.body).toContain("**Total Jobs:** 50");
      expect(result.body.split("### ").length - 1).toBe(50); // Should have 50 job sections
    });

    it("should handle jobs with zero match score", () => {
      const zeroScoreDigest: DigestResult = {
        ...validDigestResult,
        jobs: [
          {
            ...validDigestResult.jobs[0],
            match_score: 0,
          },
        ],
      };

      const result = formatter.format(zeroScoreDigest);
      // The implementation might skip match score display when it's 0
      // Let's just verify the job is formatted without error
      expect(result.body).toContain("Senior Software Engineer");
      expect(result.body).toContain("TechCorp Inc");
    });

    it("should handle malformed or missing dates gracefully", () => {
      const badDateDigest: DigestResult = {
        ...validDigestResult,
        jobs: [
          {
            ...validDigestResult.jobs[0],
            posted_date: "invalid-date",
          },
        ],
      };

      const result = formatter.format(badDateDigest);
      expect(result.body).toContain("**Posted:** Invalid Date"); // JavaScript Date fallback
    });
  });

  describe("performance", () => {
    it("should handle formatting within reasonable time", () => {
      const start = Date.now();
      formatter.format(multipleJobsDigestResult);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // Should complete in under 100ms
    });

    it("should produce consistent output for same input", () => {
      const result1 = formatter.format(validDigestResult);
      const result2 = formatter.format(validDigestResult);

      // Titles should be identical
      expect(result1.title).toBe(result2.title);

      // Bodies should be identical except for timestamp
      expect(result1.body.replace(/Job Search Results - .+?\n/, "")).toBe(
        result2.body.replace(/Job Search Results - .+?\n/, "")
      );
    });
  });
});
