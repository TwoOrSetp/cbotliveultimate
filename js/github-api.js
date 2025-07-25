class GitHubAPI {
    constructor() {
        this.owner = 'therealsnopphin';
        this.repo = 'cbot';
        this.apiUrl = `https://api.github.com/repos/${this.owner}/${this.repo}/releases/latest`;
        this.fallbackData = this.getFallbackData();
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadRelease());
        } else {
            this.loadRelease();
        }
    }

    async loadRelease() {
        this.showLoading();
        
        try {
            const response = await fetch(this.apiUrl, {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'cbot-website'
                }
            });

            if (!response.ok) {
                throw new Error(`GitHub API responded with status: ${response.status}`);
            }

            const releaseData = await response.json();
            this.displayRelease(releaseData);
            
        } catch (error) {
            console.warn('Failed to fetch from GitHub API:', error);
            this.handleError(error);
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

        releaseTitle.textContent = data.name || 'Latest Release';
        releaseVersion.textContent = data.tag_name || 'v1.0.0';
        
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
    }

    displayFiles(assets, container) {
        container.innerHTML = '';

        if (assets.length === 0) {
            container.innerHTML = `
                <div class="no-files">
                    <p>No download files available for this release.</p>
                    <a href="https://github.com/${this.owner}/${this.repo}/releases" class="btn btn-secondary" target="_blank" rel="noopener">
                        View on GitHub
                    </a>
                </div>
            `;
            return;
        }

        assets.forEach(asset => {
            const fileCard = this.createFileCard(asset);
            container.appendChild(fileCard);
        });
    }

    createFileCard(asset) {
        const card = document.createElement('div');
        card.className = 'download-card file-card';
        
        const fileExtension = this.getFileExtension(asset.name);
        const fileIcon = this.getFileIcon(fileExtension);
        const fileSize = this.formatFileSize(asset.size);
        
        card.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    ${fileIcon}
                </div>
                <div class="file-details">
                    <h3 class="file-name">${asset.name}</h3>
                    <div class="file-meta">
                        <span class="file-size">${fileSize}</span>
                        <span class="download-count">${asset.download_count} downloads</span>
                    </div>
                </div>
            </div>
            <div class="file-actions">
                <a href="${asset.browser_download_url}" 
                   class="download-btn" 
                   download="${asset.name}"
                   data-file-name="${asset.name}">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                    </svg>
                    Download
                </a>
            </div>
        `;

        card.querySelector('.download-btn').addEventListener('click', (e) => {
            this.trackDownload(asset.name);
            this.showDownloadFeedback(e.target);
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

    trackDownload(fileName) {
        const downloads = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
        downloads.push({
            file: fileName,
            timestamp: new Date().toISOString(),
            source: 'github-release'
        });
        
        if (downloads.length > 50) {
            downloads.splice(0, downloads.length - 50);
        }
        
        localStorage.setItem('downloadHistory', JSON.stringify(downloads));
    }

    showDownloadFeedback(button) {
        const originalText = button.innerHTML;
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z"/>
            </svg>
            Downloaded!
        `;
        button.classList.add('download-success');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('download-success');
        }, 3000);
    }

    handleError(error) {
        this.hideLoading();
        this.showError();
        
        setTimeout(() => {
            this.displayFallback();
        }, 2000);
    }

    displayFallback() {
        this.hideError();
        this.displayRelease(this.fallbackData);
    }

    getFallbackData() {
        return {
            name: 'cbot Latest Release',
            tag_name: 'v1.0.0',
            published_at: new Date().toISOString(),
            body: `# cbot v1.0.0

## Features
- Advanced combat modules
- Movement enhancements  
- Visual improvements
- World interaction tools
- Player utilities

## Installation
1. Download the appropriate file for your system
2. Extract to your desired location
3. Follow the installation guide
4. Launch and enjoy!

**Note:** This is fallback content. Visit our GitHub repository for the latest release information.`,
            assets: [
                {
                    name: 'cbot-v1.0.0.jar',
                    size: 2048576,
                    download_count: 1234,
                    browser_download_url: 'https://github.com/therealsnopphin/cbot/releases/download/v1.0.0/cbot-v1.0.0.jar'
                },
                {
                    name: 'cbot-v1.0.0-source.zip',
                    size: 1048576,
                    download_count: 567,
                    browser_download_url: 'https://github.com/therealsnopphin/cbot/releases/download/v1.0.0/cbot-v1.0.0-source.zip'
                }
            ]
        };
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
}

window.githubAPI = new GitHubAPI();
