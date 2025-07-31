import { DigestProcessor } from "../../../src/services/digest-processor";
import {
  emptyDigestResult,
  invalidDigestSamples,
  multipleJobsDigestResult,
  validDigestResult,
} from "../../fixtures/digest-fixtures";

describe("DigestProcessor", () => {
  let processor: DigestProcessor;

  beforeEach(() => {
    processor = new DigestProcessor();
  });

  describe("parse", () => {
    describe("valid data", () => {
      it("should parse valid digest JSON successfully", () => {
        const jsonData = JSON.stringify(validDigestResult);

        const result = processor.parse(jsonData);

        expect(result).toEqual(validDigestResult);
        expect(result.summary.total_jobs_found).toBe(3);
        expect(result.jobs).toHaveLength(1);
        expect(result.jobs[0].title).toBe("Senior Software Engineer");
      });

      it("should parse empty digest result", () => {
        const jsonData = JSON.stringify(emptyDigestResult);

        const result = processor.parse(jsonData);

        expect(result).toEqual(emptyDigestResult);
        expect(result.summary.total_jobs_found).toBe(0);
        expect(result.jobs).toHaveLength(0);
      });

      it("should parse digest with multiple jobs", () => {
        const jsonData = JSON.stringify(multipleJobsDigestResult);

        const result = processor.parse(jsonData);

        expect(result).toEqual(multipleJobsDigestResult);
        expect(result.summary.total_jobs_found).toBe(3);
        expect(result.jobs).toHaveLength(3);
        expect(result.jobs.map((job) => job.title)).toEqual([
          "Senior Software Engineer",
          "Full Stack Developer",
          "Frontend Engineer",
        ]);
      });

      it("should handle jobs with optional fields missing", () => {
        const digestWithMinimalJob = {
          ...validDigestResult,
          jobs: [
            {
              id: "minimal-job",
              title: "Simple Job",
              company: "Simple Corp",
              description: "A simple job posting",
              url: "https://example.com/simple",
              source: "test",
              posted_date: "2025-07-31T09:00:00Z",
              // No optional fields like salary, location, match_score, etc.
            },
          ],
        };

        const jsonData = JSON.stringify(digestWithMinimalJob);

        const result = processor.parse(jsonData);

        expect(result.jobs[0]).toEqual(digestWithMinimalJob.jobs[0]);
        expect(result.jobs[0].salary).toBeUndefined();
        expect(result.jobs[0].location).toBeUndefined();
        expect(result.jobs[0].match_score).toBeUndefined();
      });
    });

    describe("invalid data", () => {
      it("should throw error for invalid JSON", () => {
        expect(() => {
          processor.parse(invalidDigestSamples.invalidJson);
        }).toThrow("Invalid digest data:");
      });

      it("should throw error for missing summary", () => {
        const jsonData = JSON.stringify(invalidDigestSamples.missingSummary);

        expect(() => {
          processor.parse(jsonData);
        }).toThrow("Missing or invalid summary object");
      });

      it("should throw error for invalid summary type", () => {
        const jsonData = JSON.stringify(
          invalidDigestSamples.invalidSummaryType
        );

        expect(() => {
          processor.parse(jsonData);
        }).toThrow("Missing or invalid summary object");
      });

      it("should throw error for missing total_jobs_found", () => {
        const jsonData = JSON.stringify(
          invalidDigestSamples.missingTotalJobsFound
        );

        expect(() => {
          processor.parse(jsonData);
        }).toThrow("Missing or invalid total_jobs_found in summary");
      });

      it("should throw error for invalid jobs array", () => {
        const jsonData = JSON.stringify(invalidDigestSamples.invalidJobsArray);

        expect(() => {
          processor.parse(jsonData);
        }).toThrow("Jobs data must be an array");
      });

      it("should throw error for job missing required fields", () => {
        const jsonData = JSON.stringify(
          invalidDigestSamples.jobMissingRequiredFields
        );

        expect(() => {
          processor.parse(jsonData);
        }).toThrow("Job at index 0: missing or invalid");
      });

      it("should throw error for invalid match score", () => {
        const jsonData = JSON.stringify(invalidDigestSamples.invalidMatchScore);

        expect(() => {
          processor.parse(jsonData);
        }).toThrow("match_score must be a number between 0 and 1");
      });

      it("should throw error for empty string input", () => {
        expect(() => {
          processor.parse("");
        }).toThrow("Invalid digest data:");
      });

      it("should throw error for null input", () => {
        expect(() => {
          processor.parse("null");
        }).toThrow("Invalid digest data:");
      });
    });

    describe("edge cases", () => {
      it("should handle jobs with match_score of 0", () => {
        const digestWithZeroScore = {
          ...validDigestResult,
          jobs: [
            {
              ...validDigestResult.jobs[0],
              match_score: 0,
            },
          ],
        };

        const jsonData = JSON.stringify(digestWithZeroScore);

        const result = processor.parse(jsonData);

        expect(result.jobs[0].match_score).toBe(0);
      });

      it("should handle jobs with match_score of 1", () => {
        const digestWithPerfectScore = {
          ...validDigestResult,
          jobs: [
            {
              ...validDigestResult.jobs[0],
              match_score: 1.0,
            },
          ],
        };

        const jsonData = JSON.stringify(digestWithPerfectScore);

        const result = processor.parse(jsonData);

        expect(result.jobs[0].match_score).toBe(1.0);
      });

      it("should handle empty arrays gracefully", () => {
        const digestWithEmptyArrays = {
          ...validDigestResult,
          summary: {
            ...validDigestResult.summary,
            sources_queried: [],
          },
          jobs: [],
        };

        const jsonData = JSON.stringify(digestWithEmptyArrays);

        const result = processor.parse(jsonData);

        expect(result.summary.sources_queried).toEqual([]);
        expect(result.jobs).toEqual([]);
      });
    });
  });

  describe("getSummaryStats", () => {
    it("should calculate summary stats for digest with jobs", () => {
      const stats = processor.getSummaryStats(multipleJobsDigestResult);

      expect(stats).toEqual({
        totalJobs: 3,
        newJobs: 2,
        sources: ["Adzuna", "Stack Overflow"],
        avgMatchScore: 0.85, // (0.95 + 0.87 + 0.72) / 3 = 0.8467, rounded to 0.85
      });
    });

    it("should handle digest with no jobs", () => {
      const stats = processor.getSummaryStats(emptyDigestResult);

      expect(stats).toEqual({
        totalJobs: 0,
        newJobs: 0,
        sources: ["Adzuna", "Stack Overflow"],
        avgMatchScore: 0,
      });
    });

    it("should handle jobs without match scores", () => {
      const digestWithoutScores = {
        ...validDigestResult,
        jobs: [
          {
            ...validDigestResult.jobs[0],
            match_score: undefined,
          },
        ],
      };

      const stats = processor.getSummaryStats(digestWithoutScores);

      expect(stats.avgMatchScore).toBe(0);
    });

    it("should handle mixed jobs with and without match scores", () => {
      const digestMixedScores = {
        ...multipleJobsDigestResult,
        jobs: [
          { ...multipleJobsDigestResult.jobs[0], match_score: 0.9 },
          { ...multipleJobsDigestResult.jobs[1], match_score: undefined },
          { ...multipleJobsDigestResult.jobs[2], match_score: 0.8 },
        ],
      };

      const stats = processor.getSummaryStats(digestMixedScores);

      expect(stats.avgMatchScore).toBe(0.85); // (0.9 + 0.8) / 2 = 0.85
    });
  });

  describe("error handling", () => {
    it("should provide detailed error messages for validation failures", () => {
      const invalidData = {
        summary: {
          total_jobs_found: "not a number",
          new_jobs: 1,
          sources_queried: ["test"],
        },
        jobs: [],
        metadata: { generated_at: "2025-07-31T09:00:00Z" },
      };

      expect(() => {
        processor.parse(JSON.stringify(invalidData));
      }).toThrow("Missing or invalid total_jobs_found in summary");
    });

    it("should handle JSON parse errors gracefully", () => {
      const malformedJson = '{"summary": {"total_jobs_found": 1,}'; // trailing comma

      expect(() => {
        processor.parse(malformedJson);
      }).toThrow("Invalid digest data:");
    });
  });
});
