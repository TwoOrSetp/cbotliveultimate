class GitHubAPI {
    constructor() {
        this.owner = 'therealsnopphin';
        this.repo = 'CBot';
        this.apiUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/releases/latest`;
        this.fallbackUrl = `https://github.com/${this.owner}/${this.repo}/releases`;
        this.init();
    }
    init() {
        console.log('GitHub API initializing...');
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                console.log('DOM loaded, loading release...');
                this.loadRelease();
            });
        } else {
            console.log('DOM already loaded, loading release...');
            this.loadRelease();
        }
    }
    async loadRelease() {
        this.showLoading();
        try {
            console.log('Fetching from GitHub API:', this.apiUrl);
            const response = await fetch(this.apiUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'cbot-website'
                }
            });
            console.log('GitHub API Response Status:', response.status);
            if (!response.ok) {
                if (response.status === 404) {
                    console.log('Repository or releases not found, using fallback data');
                    this.displayFallbackRelease();
                    return;
                } else if (response.status === 403) {
                    throw new Error('GitHub API rate limit exceeded');
                } else {
                    throw new Error(`GitHub API responded with status: ${response.status}`);
                }
            }
            const releaseData = await response.json();
            console.log('GitHub API Response:', releaseData);
            if (!releaseData || !releaseData.tag_name) {
                console.log('Invalid release data, using fallback');
                this.displayFallbackRelease();
                return;
            }
            this.displayRelease(releaseData);
        } catch (error) {
            console.error('Failed to fetch from GitHub API:', error);
            console.log('Using fallback release data');
            this.displayFallbackRelease();
        }
    }
    displayRelease(data) {
        this.hideLoading();
        this.hideError();
        const releaseContent = document.getElementById('release-content');
        const releaseTitle = document.getElementById('release-title');
        const releaseVersion = document.getElementById('release-version');
        const releaseDate = document.getElementById('release-date');
        const releaseDescription = document.getElementById('release-description');
        const filesGrid = document.getElementById('files-grid');
        if (!releaseContent) return;
        releaseTitle.textContent = data.name || `${this.repo} ${data.tag_name}`;
        releaseVersion.textContent = data.tag_name || 'Latest';
        const publishedDate = new Date(data.published_at);
        releaseDate.textContent = `Released on ${publishedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })}`;
        const description = this.parseMarkdown(data.body || 'No description available.');
        releaseDescription.innerHTML = description;
        this.displayFiles(data.assets || [], filesGrid);
        releaseContent.style.display = 'block';
        this.fetchAllReleaseStats();
        console.log(`Loaded release: ${data.tag_name} with ${data.assets.length} assets`);
    }
    displayFiles(assets, container) {
        container.innerHTML = '';
        if (assets.length === 0) {
            container.innerHTML = `
                <div class="no-files">
                    <p>No download files available for this release.</p>
                    <p>Check back later or visit the GitHub repository for updates.</p>
                    <div class="no-files-actions">
                        <a href="${this.fallbackUrl}" class="btn btn-primary" target="_blank" rel="noopener">
                            View GitHub Releases
                        </a>
                        <button class="btn btn-secondary" onclick="window.githubAPI.loadRelease()">
                            Retry
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        console.log(`Displaying ${assets.length} download files from GitHub`);
        assets.forEach(asset => {
            const fileCard = this.createFileCard(asset);
            container.appendChild(fileCard);
        });
    }
    createFileCard(asset) {
        const card = document.createElement('div');
        card.className = 'download-card file-card github-download';
        const fileExtension = this.getFileExtension(asset.name);
        const fileIcon = this.getFileIcon(fileExtension);
        const fileSize = this.formatFileSize(asset.size);
        const uploadDate = new Date(asset.updated_at).toLocaleDateString();
        card.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    ${fileIcon}
                </div>
                <div class="file-details">
                    <h3 class="file-name">${asset.name}</h3>
                    <p class="file-description">Official release from GitHub</p>
                    <div class="file-meta">
                        <span class="file-size">${fileSize}</span>
                        <span class="download-count real-download-count" data-count="${asset.download_count}">
                            ${asset.download_count.toLocaleString()} downloads
                        </span>
                        <span class="upload-date">Updated ${uploadDate}</span>
                    </div>
                </div>
            </div>
            <div class="file-actions">
                <a href="${asset.browser_download_url}"
                   class="download-btn github-download-btn"
                   target="_blank"
                   rel="noopener"
                   data-file-name="${asset.name}"
                   data-file-size="${asset.size}">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                    </svg>
                    <span>Download</span>
                </a>
            </div>
        `;
        const downloadBtn = card.querySelector('.download-btn');
        downloadBtn.addEventListener('click', (e) => {
            if (downloadBtn.disabled || downloadBtn.classList.contains('disabled')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
            
            downloadBtn.disabled = true;
            downloadBtn.classList.add('disabled');
            
            this.trackDownload(asset);
            this.showDownloadFeedback(downloadBtn);
            this.incrementDownloadCount(card, asset.name);
            console.log(`Download started: ${asset.name} (${fileSize})`);
            
            setTimeout(() => {
                downloadBtn.disabled = false;
                downloadBtn.classList.remove('disabled');
            }, 3000);
        });
        return card;
    }
    getFileIcon(extension) {
        const icons = {
            'zip': '<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>',
            'jar': '<path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>',
            'exe': '<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>',
            'default': '<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>'
        };
        return `<svg viewBox="0 0 24 24" fill="currentColor">${icons[extension] || icons.default}</svg>`;
    }
    getFileExtension(filename) {
        return filename.split('.').pop().toLowerCase();
    }
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    parseMarkdown(markdown) {
        return markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/\n/gim, '<br>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    }
    trackDownload(asset) {
        const downloads = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
        downloads.push({
            file: asset.name,
            size: asset.size,
            downloadCount: asset.download_count,
            url: asset.browser_download_url,
            timestamp: new Date().toISOString(),
            source: 'github-release'
        });
        if (downloads.length > 100) {
            downloads.splice(0, downloads.length - 100);
        }
        localStorage.setItem('downloadHistory', JSON.stringify(downloads));
        const sessionDownloads = JSON.parse(sessionStorage.getItem('sessionDownloads') || '[]');
        sessionDownloads.push(asset.name);
        sessionStorage.setItem('sessionDownloads', JSON.stringify(sessionDownloads));
    }
    showDownloadFeedback(button) {
        const originalText = button.innerHTML;
        const fileName = button.getAttribute('data-file-name');
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z"/>
            </svg>
            <span>Downloading...</span>
        `;
        button.classList.add('download-success');
        this.showNotification(`Downloading ${fileName}`, 'success');
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('download-success');
        }, 3000);
    }
    handleError(error) {
        this.hideLoading();
        this.hideError();
        console.error('GitHub API Error:', error);
        this.displayFallbackRelease();
    }
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 100);
        setTimeout(() => this.hideNotification(notification), 5000);
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });
    }
    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    showLoading() {
        const loadingState = document.getElementById('loading-state');
        if (loadingState) loadingState.style.display = 'block';
    }
    hideLoading() {
        const loadingState = document.getElementById('loading-state');
        if (loadingState) loadingState.style.display = 'none';
    }
    showError() {
        const errorState = document.getElementById('error-state');
        if (errorState) errorState.style.display = 'block';
    }
    hideError() {
        const errorState = document.getElementById('error-state');
        if (errorState) errorState.style.display = 'none';
    }
    displayFallbackRelease() {
        this.hideLoading();
        this.hideError();
        const fallbackData = {
            name: 'cbot v3.1',
            tag_name: 'v3.1',
            published_at: '2025-07-24T00:00:00Z',
            body: `# cbot v3.1
## 🎯 Latest Features
- Fixed always showing cursor
- Autoupdate system implemented
- Improved combat modules stability
- Enhanced movement algorithms
- Optimized visual rendering
- Better world interaction performance
## 📦 Installation
1. Download the JAR file below
2. Place in your Minecraft mods folder
3. Launch Minecraft with Forge/Fabric
4. Configure settings in-game
## 🔗 Links
- **Discord**: https://discord.gg/cpZpH75ajv
- **YouTube**: https://youtube.com/@snopphin
- **GitHub**: https://github.com/therealsnopphin
*Note: This is demo content. Visit our GitHub repository for the latest releases.*`,
            assets: [
                {
                    name: 'cbot-v3.1.jar',
                    size: 2457600,
                    download_count: 1247,
                    updated_at: '2025-07-24T00:00:00Z',
                    browser_download_url: 'https://github.com/therealsnopphin/CBot/releases/download/v3.1.0/cbot-v3.1.jar'
                },
                {
                    name: 'cbot-installer.exe',
                    size: 5242880,
                    download_count: 892,
                    updated_at: '2025-07-24T00:00:00Z',
                    browser_download_url: 'https://github.com/therealsnopphin/CBot/releases/download/v3.1.0/cbot-installer.exe'
                },
                {
                    name: 'cbot-v3.1-source.zip',
                    size: 1572864,
                    download_count: 456,
                    updated_at: '2025-07-24T00:00:00Z',
                    browser_download_url: 'https://github.com/therealsnopphin/CBot/releases/download/v3.1.0/cbot-v3.1-source.zip'
                },
                {
                    name: 'cbot-documentation.pdf',
                    size: 3145728,
                    download_count: 234,
                    updated_at: '2025-07-24T00:00:00Z',
                    browser_download_url: 'https://github.com/therealsnopphin/CBot/releases/download/v3.1.0/cbot-documentation.pdf'
                }
            ]
        };
        console.log('Displaying fallback release data');
        this.displayRelease(fallbackData);
        setTimeout(() => {
            this.showNotification('Showing demo content. Visit GitHub for latest releases.', 'info');
        }, 1000);
    }
    async fetchAllReleaseStats() {
        try {
            const allReleasesUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/releases`;
            const response = await fetch(allReleasesUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'cbot-website'
                }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch all releases: ${response.status}`);
            }
            const releases = await response.json();
            let totalDownloads = 0;
            let totalReleases = releases.length;
            let totalAssets = 0;
            releases.forEach(release => {
                release.assets.forEach(asset => {
                    totalDownloads += asset.download_count;
                    totalAssets++;
                });
            });
            this.displayGlobalStats({
                totalDownloads,
                totalReleases,
                totalAssets,
                latestRelease: releases[0]?.tag_name || 'N/A'
            });
            console.log(`Total downloads across all releases: ${totalDownloads}`);
            return { totalDownloads, totalReleases, totalAssets };
        } catch (error) {
            console.error('Failed to fetch release statistics:', error);
            return null;
        }
    }
    displayGlobalStats(stats) {
        let statsContainer = document.getElementById('global-stats');
        if (!statsContainer) {
            statsContainer = document.createElement('div');
            statsContainer.id = 'global-stats';
            statsContainer.className = 'global-stats';
            const releaseTitle = document.getElementById('release-title');
            if (releaseTitle && releaseTitle.parentNode) {
                releaseTitle.parentNode.insertBefore(statsContainer, releaseTitle.nextSibling);
            }
        }
        statsContainer.innerHTML = `
            <div class="stats-grid">
                <div class="stat-item">
                    <div class="stat-number">${stats.totalDownloads.toLocaleString()}</div>
                    <div class="stat-label">Total Downloads</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.totalReleases}</div>
                    <div class="stat-label">Releases</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.totalAssets}</div>
                    <div class="stat-label">Files</div>
                </div>
                <div class="stat-item">
                    <div class="stat-number">${stats.latestRelease}</div>
                    <div class="stat-label">Latest Version</div>
                </div>
            </div>
        `;
    }
    incrementDownloadCount(card, fileName) {
        const downloadCountElement = card.querySelector('.real-download-count');
        if (downloadCountElement) {
            const currentCount = parseInt(downloadCountElement.getAttribute('data-count')) || 0;
            const newCount = currentCount + 1;
            downloadCountElement.setAttribute('data-count', newCount);
            downloadCountElement.textContent = `${newCount.toLocaleString()} downloads`;
            downloadCountElement.style.animation = 'none';
            setTimeout(() => {
                downloadCountElement.style.animation = 'downloadCountPulse 3s ease-in-out infinite';
            }, 10);
            this.updateGlobalDownloadCount();
            console.log(`Updated download count for ${fileName}: ${newCount}`);
        }
    }
    updateGlobalDownloadCount() {
        const globalStats = document.getElementById('global-stats');
        if (globalStats) {
            const totalDownloadElement = globalStats.querySelector('.stat-number');
            if (totalDownloadElement) {
                const currentTotal = parseInt(totalDownloadElement.textContent.replace(/,/g, '')) || 0;
                const newTotal = currentTotal + 1;
                totalDownloadElement.textContent = newTotal.toLocaleString();
                totalDownloadElement.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    totalDownloadElement.style.transform = 'scale(1)';
                }, 300);
            }
        }
    }
    getDownloadStatistics() {
        const downloadCounts = {};
        const downloadElements = document.querySelectorAll('.real-download-count');
        downloadElements.forEach(element => {
            const fileName = element.closest('.download-card').querySelector('.file-name').textContent;
            const count = parseInt(element.getAttribute('data-count')) || 0;
            downloadCounts[fileName] = count;
        });
        return downloadCounts;
    }
    startPeriodicRefresh(intervalMinutes = 5) {
        setInterval(async () => {
            try {
                console.log('Refreshing download counts from GitHub...');
                const response = await fetch(this.apiUrl, {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'User-Agent': 'cbot-website'
                    }
                });
                if (response.ok) {
                    const releaseData = await response.json();
                    this.updateDownloadCounts(releaseData.assets);
                    this.fetchAllReleaseStats(); 
                }
            } catch (error) {
                console.warn('Failed to refresh download counts:', error);
            }
        }, intervalMinutes * 60 * 1000);
    }
    updateDownloadCounts(assets) {
        assets.forEach(asset => {
            const downloadCards = document.querySelectorAll('.download-card');
            downloadCards.forEach(card => {
                const fileName = card.querySelector('.file-name').textContent;
                if (fileName === asset.name) {
                    const downloadCountElement = card.querySelector('.real-download-count');
                    if (downloadCountElement) {
                        const currentCount = parseInt(downloadCountElement.getAttribute('data-count')) || 0;
                        const actualCount = asset.download_count;
                        if (actualCount > currentCount) {
                            downloadCountElement.setAttribute('data-count', actualCount);
                            downloadCountElement.textContent = `${actualCount.toLocaleString()} downloads`;
                            downloadCountElement.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
                            setTimeout(() => {
                                downloadCountElement.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                            }, 2000);
                        }
                    }
                }
            });
        });
    }
}
window.githubAPI = new GitHubAPI();
setTimeout(() => {
    if (window.githubAPI) {
        window.githubAPI.startPeriodicRefresh(5);
    }
}, 10000); 
