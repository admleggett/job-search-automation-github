# Environment Setup

## 🔧 **Local Development Setup**

### **1. Copy Environment Template**

```bash
cp .env.example .env
```

### **2. Configure GitHub Token**

Edit `.env` and add your GitHub Personal Access Token:

```bash
# Required: GitHub Personal Access Token
GITHUB_TOKEN=ghp_your_token_here

# Optional: Repository settings
GITHUB_OWNER=your-username
GITHUB_REPO=job-search-repo

# Optional: Enable debug logging
DEBUG_LOGGING=true
```

**Get a GitHub Token:**

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select `repo` scope (needed for creating issues)
4. Copy the token to your `.env` file

### **3. Test Setup**

```bash
# Install dependencies
npm install

# Test with mock adapters (no token needed)
npm test

# Test with real GitHub API (requires .env setup)
npm run test-local sample-digest.json
```

## 🔒 **Security Notes**

- **`.env` file is git-ignored** - your tokens won't be committed
- **Use classic tokens** - fine-grained tokens may have permission issues
- **Minimum scope needed:** `repo` access for creating issues
- **For testing only** - production workflows use `GITHUB_TOKEN` from Actions

## 🚀 **Quick Test**

After setting up `.env`:

```bash
# Test the adapter pattern works outside GitHub Actions
npm run test-local sample-digest.json
```

You should see:

```
🚀 Starting local digest issue creation...
📁 Using digest file: sample-digest.json
🎯 Target repo: your-username/job-search-repo

✅ Digest validation passed
📊 Summary: 2 jobs (1 new)

ℹ️  Starting digest issue creation...
🔍 Digest data length: 1725 characters
ℹ️  Processed digest: 2 jobs (1 new) from Adzuna, Stack Overflow
ℹ️  📊 Summary: 2 jobs, avg match score: 0.92
🔍 Issue title: 🎯 2 Job Opportunities (1 new)
🔍 Issue body length: 1234 characters
ℹ️  ✅ Created issue #123: https://github.com/your-username/job-search-repo/issues/123

🎉 Success! Issue created:
   Issue #123
   URL: https://github.com/your-username/job-search-repo/issues/123
```

This proves the **adapter pattern enables testing outside GitHub Actions**! 🎉
