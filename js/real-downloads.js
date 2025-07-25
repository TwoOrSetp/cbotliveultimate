class SimpleDownloadManager {
    constructor() {
        this.downloads = [
            {
                name: "cbot v3.1",
                description: "Main cbot client for Minecraft",
                filename: "cbot-v3.1.jar",
                size: "2.4 MB",
                url: "assets/downloads/cbot-v3.1.jar"
            },
            {
                name: "cbot Installer",
                description: "Easy installation wizard for Windows",
                filename: "cbot-installer.ps1",
                size: "5.1 MB",
                url: "assets/downloads/cbot-installer.ps1"
            },
            {
                name: "Source Code",
                description: "Complete source code and documentation",
                filename: "cbot-v3.1-source.zip",
                size: "1.8 MB",
                url: "assets/downloads/cbot-v3.1-source.zip"
            },
            {
                name: "Documentation",
                description: "Complete user guide and API documentation",
                filename: "cbot-documentation.pdf",
                size: "3.2 MB",
                url: "assets/downloads/cbot-documentation.pdf"
            }
        ];
        this.init();
    }

    init() {
        this.createDownloadCards();
        this.bindDownloadEvents();
    }

    createDownloadCards() {
        const container = document.getElementById('files-grid');
        if (!container) return;

        container.innerHTML = '';

        this.downloads.forEach((download, index) => {
            const card = this.createDownloadCard(download, index);
            container.appendChild(card);
        });
    }

    createDownloadCard(download, index) {
        const card = document.createElement('div');
        card.className = 'download-card file-card';

        card.innerHTML = `
            <div class="file-info">
                <div class="file-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    </svg>
                </div>
                <div class="file-details">
                    <h3 class="file-name">${download.name}</h3>
                    <p class="file-description">${download.description}</p>
                    <div class="file-meta">
                        <span class="file-size">${download.size}</span>
                    </div>
                </div>
            </div>
            <div class="file-actions">
                <a href="${download.url}" download="${download.filename}" class="download-btn">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>
                    </svg>
                    <span>Download</span>
                </a>
            </div>
        `;

        return card;
    }

    bindDownloadEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.download-btn')) {
                const button = e.target.closest('.download-btn');
                this.showDownloadFeedback(button);
            }
        });
    }

    showDownloadFeedback(button) {
        const originalText = button.innerHTML;
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z"/>
            </svg>
            <span>Downloaded!</span>
        `;
        button.classList.add('download-success');

        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('download-success');
        }, 2000);
    }
}



    generateDemoFile(download, button, card) {
        this.showDownloadProgress(card, true);
        this.updateDownloadButton(button, 'generating');

        // Generate demo content based on file type
        let content, mimeType;
        
        switch (download.type) {
            case 'application/java-archive':
                content = this.createDemoJarContent(download);
                mimeType = 'application/java-archive';
                break;
            case 'application/zip':
                content = this.createDemoZipContent(download);
                mimeType = 'application/zip';
                break;
            case 'application/pdf':
                content = this.createDemoPDFContent(download);
                mimeType = 'application/pdf';
                break;
            case 'application/x-msdownload':
                content = this.createDemoExeContent(download);
                mimeType = 'application/octet-stream';
                break;
            default:
                content = this.createDemoTextContent(download);
                mimeType = 'text/plain';
        }

        this.simulateDownloadProgress(card, () => {
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = download.filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            
            this.updateDownloadButton(button, 'completed');
            this.showNotification(`${download.name} downloaded successfully!`, 'success');
            
            setTimeout(() => {
                this.resetDownloadButton(button);
                this.hideDownloadProgress(card);
            }, 3000);
        });
    }

    simulateDownloadProgress(card, onComplete) {
        const progressFill = card.querySelector('.progress-fill');
        const progressText = card.querySelector('.progress-text');
        let progress = 0;
        
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                setTimeout(onComplete, 500);
            }
            
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `${Math.round(progress)}%`;
        }, 200);
    }

    createDemoJarContent(download) {
        return `Demo JAR file for ${download.name}

This is a demonstration file. The actual cbot client would contain:
- Compiled Java classes
- Module implementations
- Configuration files
- Resource assets

To use the real cbot client:
1. Download from official releases
2. Place in Minecraft mods folder
3. Launch Minecraft with mod loader
4. Configure settings in-game

Generated: ${new Date().toISOString()}
Version: ${this.downloadConfig.version}`;
    }

    createDemoZipContent(download) {
        return `Demo ZIP archive for ${download.name}

Contents would include:
- Source code files
- Documentation
- Build scripts
- Configuration examples
- Installation instructions

This is a demonstration file.
For the complete source code, visit the official repository.

Generated: ${new Date().toISOString()}`;
    }

    createDemoPDFContent(download) {
        return `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT/F1 12 Tf 72 720 Td(Demo ${download.name}) Tj ET
endstream endobj
xref 0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer<</Size 5/Root 1 0 R>>
startxref 300
%%EOF`;
    }

    createDemoExeContent(download) {
        return `Demo installer for ${download.name}

This would be a Windows executable installer containing:
- cbot client files
- Installation wizard
- System requirements check
- Automatic configuration
- Desktop shortcuts

This is a demonstration file.
The real installer would handle complete setup and configuration.

Generated: ${new Date().toISOString()}`;
    }

    createDemoTextContent(download) {
        return `${download.name} - Demo File

Description: ${download.description}
Version: ${this.downloadConfig.version}
Platform: ${download.platform || 'Cross-platform'}
Size: ${download.size}

This is a demonstration download.
For the actual file, please visit the official release page.

Generated: ${new Date().toLocaleString()}`;
    }

    showDownloadProgress(card, show) {
        const progress = card.querySelector('.download-progress');
        if (progress) {
            progress.style.display = show ? 'block' : 'none';
        }
    }

    hideDownloadProgress(card) {
        this.showDownloadProgress(card, false);
        const progressFill = card.querySelector('.progress-fill');
        const progressText = card.querySelector('.progress-text');
        if (progressFill) progressFill.style.width = '0%';
        if (progressText) progressText.textContent = '0%';
    }

    updateDownloadButton(button, state) {
        const span = button.querySelector('span');
        const svg = button.querySelector('svg');
        
        switch (state) {
            case 'downloading':
                span.textContent = 'Downloading...';
                button.disabled = true;
                button.classList.add('downloading');
                break;
            case 'generating':
                span.textContent = 'Preparing...';
                button.disabled = true;
                button.classList.add('downloading');
                break;
            case 'completed':
                span.textContent = 'Downloaded!';
                button.classList.remove('downloading');
                button.classList.add('completed');
                svg.innerHTML = '<path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z"/>';
                break;
        }
    }

    resetDownloadButton(button) {
        const span = button.querySelector('span');
        const svg = button.querySelector('svg');
        
        span.textContent = 'Download';
        button.disabled = false;
        button.classList.remove('downloading', 'completed');
        svg.innerHTML = '<path d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"/>';
    }

    getFileIcon(type) {
        const icons = {
            'application/java-archive': '<path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z"/>',
            'application/zip': '<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>',
            'application/pdf': '<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>',
            'application/x-msdownload': '<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>',
            'default': '<path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>'
        };

        return `<svg viewBox="0 0 24 24" fill="currentColor">${icons[type] || icons.default}</svg>`;
    }

    setupDownloadTracking() {
        // Track download statistics
        this.downloadStats = JSON.parse(localStorage.getItem('downloadStats') || '{}');
    }

    trackDownload(download) {
        const stats = JSON.parse(localStorage.getItem('downloadStats') || '{}');
        const today = new Date().toDateString();
        
        if (!stats[today]) {
            stats[today] = {};
        }
        
        if (!stats[today][download.id]) {
            stats[today][download.id] = 0;
        }
        
        stats[today][download.id]++;
        
        localStorage.setItem('downloadStats', JSON.stringify(stats));
        
        // Also track in download history
        const history = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
        history.push({
            id: download.id,
            name: download.name,
            filename: download.filename,
            timestamp: new Date().toISOString(),
            size: download.size
        });
        
        if (history.length > 100) {
            history.splice(0, history.length - 100);
        }
        
        localStorage.setItem('downloadHistory', JSON.stringify(history));
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
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });
        
        setTimeout(() => {
            this.hideNotification(notification);
        }, 5000);
    }

    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    getDownloadHistory() {
        return JSON.parse(localStorage.getItem('downloadHistory') || '[]');
    }

    getDownloadStats() {
        return JSON.parse(localStorage.getItem('downloadStats') || '{}');
    }

    setupSourceToggle() {
        const toggleButtons = document.querySelectorAll('.source-btn');

        toggleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const source = button.getAttribute('data-source');
                this.switchDownloadSource(source);

                // Update active state
                toggleButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
    }

    switchDownloadSource(source) {
        const container = document.getElementById('files-grid');
        if (!container) return;

        if (source === 'local') {
            // Show local downloads
            this.populateDownloadCards();
        } else if (source === 'github') {
            // Trigger GitHub API to populate
            if (window.githubAPI) {
                window.githubAPI.loadRelease();
            }
        }
    }
}

// Initialize the real download manager
document.addEventListener('DOMContentLoaded', () => {
    window.realDownloadManager = new RealDownloadManager();
});

// Export for use in other scripts
window.RealDownloadManager = RealDownloadManager;
