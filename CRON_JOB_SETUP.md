# 🕐 Daily Cron Job Setup Guide

## Overview
This guide covers the setup and configuration of the daily GitHub stats update cron job for StackFast. The cron job automatically updates tool popularity scores, activity metrics, and GitHub repository data to ensure our recommendation engine has the most current information.

## 📋 Components

### 1. GitHub Actions Workflow
**File:** `.github/workflows/daily-cron.yml`

- **Schedule:** Runs daily at 05:00 UTC
- **Trigger:** Automatic via cron schedule + manual dispatch
- **Function:** Calls the serverless cron endpoint

### 2. Serverless Cron Endpoint
**File:** `pages/api/cron/update-github-stats.ts`

- **Purpose:** Updates GitHub stats for all tools with repositories
- **Security:** Protected with `CRON_SECRET` bearer token
- **Database:** Uses Firestore with WIF authentication
- **API:** Custom GitHub API client (no external dependencies)

### 3. Test Endpoint
**File:** `pages/api/cron/test.ts`

- **Purpose:** Test and verify cron job configuration
- **Access:** Public GET endpoint for debugging
- **Function:** Shows sample data and environment status

## 🔧 Required Environment Variables

### GitHub Secrets (Repository Settings)
```bash
# Cron job authentication
CRON_SECRET=your-secure-random-secret-here

# GitHub API access (for fetching repository stats)
GITHUB_TOKEN=ghp_your_github_personal_access_token

# Google Cloud Project (already configured for WIF)
GCP_PROJECT_ID=sunny-furnace-461114-s9
```

### Local Development (.env.local)
```bash
# Same variables as above for local testing
CRON_SECRET=your-local-secret
GITHUB_TOKEN=ghp_your_token
GCP_PROJECT_ID=sunny-furnace-461114-s9
```

## 🚀 Setup Instructions

### 1. Create GitHub Personal Access Token
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Generate new token with these permissions:
   - `public_repo` (for public repository access)
   - `repo:status` (for repository metadata)
3. Copy the token for use in secrets

### 2. Generate Cron Secret
```bash
# Generate a secure random secret
openssl rand -base64 32
```

### 3. Add GitHub Repository Secrets
1. Go to your repository settings
2. Navigate to Secrets and variables > Actions
3. Add the following secrets:
   - `CRON_SECRET`: Your generated secret
   - `GITHUB_TOKEN`: Your GitHub personal access token

### 4. Deploy to Vercel
The cron endpoints will be automatically available once deployed:
- `https://your-app.vercel.app/api/cron/update-github-stats`
- `https://your-app.vercel.app/api/cron/test`

## 📊 What the Cron Job Does

### Data Collection
- **Stars:** GitHub stargazers count
- **Forks:** Repository forks count
- **Issues:** Open issues count
- **Last Commit:** Most recent push date
- **Language:** Primary programming language
- **Description:** Repository description

### Calculated Metrics
- **Popularity Score:** Logarithmic scale (0-1) based on stars
- **Activity Score:** Decay function based on last commit date
- **Updated Timestamp:** When the data was last refreshed

### Database Updates
- Updates `live_data` field with fresh GitHub metrics
- Recalculates `popularity_score` and `activity_score`
- Batch updates for efficiency
- Error handling for failed API calls

## 🔍 Testing and Monitoring

### Manual Testing
```bash
# Test the cron job endpoint
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  https://your-app.vercel.app/api/cron/update-github-stats

# Check configuration
curl https://your-app.vercel.app/api/cron/test
```

### Monitoring
- **GitHub Actions:** Check workflow runs in the Actions tab
- **Vercel Logs:** Monitor function execution in Vercel dashboard
- **Firestore:** Verify data updates in Firebase console

## 🛠️ Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check `CRON_SECRET` is correctly set
   - Verify authorization header format

2. **GitHub API Rate Limits**
   - Ensure `GITHUB_TOKEN` is set (increases rate limit)
   - Check token permissions
   - Monitor API usage

3. **Firestore Permission Errors**
   - Verify WIF is properly configured
   - Check service account permissions
   - Ensure `GCP_PROJECT_ID` is correct

### Debug Steps
1. Run the test endpoint to verify configuration
2. Check environment variables are properly set
3. Monitor GitHub Actions workflow logs
4. Review Vercel function logs

## 📈 Performance Optimization

### Current Optimizations
- **Batch Updates:** Single Firestore batch for all updates
- **Rate Limiting:** 100ms delay between GitHub API calls
- **Error Handling:** Continues processing even if some tools fail
- **Efficient Queries:** Fetches only tools with GitHub repositories

### Future Improvements
- **Caching:** Cache GitHub API responses for duplicate repos
- **Incremental Updates:** Only update tools that haven't been updated recently
- **Parallel Processing:** Process multiple tools concurrently
- **Webhook Integration:** Real-time updates for repository changes

## 🔄 Maintenance

### Regular Tasks
- **Monthly:** Review GitHub token expiration
- **Quarterly:** Audit error rates and performance
- **Annually:** Update dependencies and security tokens

### Monitoring Metrics
- **Success Rate:** Percentage of successful updates
- **API Rate Usage:** GitHub API call efficiency
- **Update Latency:** Time to complete all updates
- **Error Types:** Common failure patterns

## 🎯 Expected Impact

### Recommendation Engine Benefits
- **Fresher Data:** Daily updates ensure current popularity metrics
- **Better Scoring:** Activity scores help identify maintained projects
- **Improved Accuracy:** Real-time GitHub stats improve recommendations

### User Experience
- **Relevant Tools:** Recently active tools get higher scores
- **Trust Indicators:** Star counts and activity show project health
- **Better Decisions:** Users can make informed tool choices

---

*Cron Job Setup Complete*  
*Last Updated: January 2025*  
*Status: ✅ Production Ready*
