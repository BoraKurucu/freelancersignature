// GitHub Profile Parser
// Note: Direct browser fetch is blocked by CORS, so we provide manual input option

export const parseGitHubProfile = async (githubUrl) => {
  if (!githubUrl || !githubUrl.trim()) {
    throw new Error('GitHub URL is required');
  }

  // Extract username from URL
  let username = githubUrl.trim();
  
  // Remove protocol and domain
  username = username.replace(/^https?:\/\//, '');
  username = username.replace(/^www\./, '');
  username = username.replace(/^github\.com\//, '');
  username = username.replace(/\/$/, '');
  username = username.split('/')[0]; // Get first part (username)

  if (!username) {
    throw new Error('Invalid GitHub URL');
  }

  // Since direct fetch is blocked by CORS, we'll use GitHub's public API
  // This doesn't require authentication for public profiles
  try {
    const apiUrl = `https://api.github.com/users/${username}`;
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('GitHub profile not found. Please check the username.');
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Get public repos count
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100&type=public`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      }
    });
    
    let repoCount = data.public_repos || 0;
    let totalStars = 0;
    
    if (reposResponse.ok) {
      const repos = await reposResponse.json();
      repoCount = repos.length;
      totalStars = repos.reduce((sum, repo) => sum + (repo.stargazers_count || 0), 0);
    }

    return {
      username: data.login,
      name: data.name || data.login,
      bio: data.bio || '',
      repoCount: repoCount,
      totalStars: totalStars,
      formatted: `${repoCount} repos • ${formatNumber(totalStars)} stars`,
      profileUrl: data.html_url,
      avatarUrl: data.avatar_url
    };
  } catch (error) {
    // If API fails, provide helpful error message
    if (error.message.includes('not found') || error.message.includes('404')) {
      throw new Error(`GitHub profile "${username}" not found. Please check the username and try again.`);
    }
    
    if (error.message.includes('CORS') || error.message.includes('fetch')) {
      throw new Error('Unable to fetch GitHub data. Please enter your stats manually below.');
    }
    
    throw error;
  }
};

export const parseProjectUrl = async (url) => {
  if (!url || !url.trim()) {
    return { domain: '', title: '' };
  }

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const domain = urlObj.hostname.replace('www.', '');
    return { domain, title: domain };
  } catch {
    return { domain: url, title: url };
  }
};

const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};
