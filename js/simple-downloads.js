// Simple Download Manager - Direct file downloads
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

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.simpleDownloadManager = new SimpleDownloadManager();
});

// Export for use in other scripts
window.SimpleDownloadManager = SimpleDownloadManager;
