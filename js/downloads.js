class DownloadManager {
    constructor() {
        this.downloads = new Map();
        this.initializeDownloads();
        this.bindEvents();
    }

    initializeDownloads() {
        this.downloads.set('tools.zip', {
            name: 'Professional Tools',
            size: '15.2 MB',
            description: 'Advanced utilities for enhanced productivity',
            url: 'assets/downloads/tools.zip',
            type: 'application/zip'
        });

        this.downloads.set('resources.zip', {
            name: 'Resource Pack',
            size: '28.7 MB',
            description: 'Comprehensive collection of premium assets',
            url: 'assets/downloads/resources.zip',
            type: 'application/zip'
        });

        this.downloads.set('docs.pdf', {
            name: 'Documentation',
            size: '5.1 MB',
            description: 'Complete guides and documentation',
            url: 'assets/downloads/docs.pdf',
            type: 'application/pdf'
        });
    }

    bindEvents() {
        const downloadButtons = document.querySelectorAll('.download-btn');
        downloadButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const fileName = button.getAttribute('data-file');
                this.handleDownload(fileName, button);
            });
        });
    }

    async handleDownload(fileName, button) {
        const downloadInfo = this.downloads.get(fileName);
        
        if (!downloadInfo) {
            this.showNotification('File not found', 'error');
            return;
        }

        try {
            button.disabled = true;
            button.classList.add('downloading');
            
            const originalText = button.textContent;
            button.innerHTML = `
                <svg class="download-spinner" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"/>
                </svg>
                Preparing...
            `;

            await this.simulateDownloadPreparation();

            if (await this.checkFileExists(downloadInfo.url)) {
                this.startDirectDownload(downloadInfo, button);
            } else {
                this.generateDemoFile(downloadInfo, button);
            }

            this.trackDownload(fileName);
            
        } catch (error) {
            console.error('Download error:', error);
            this.showNotification('Download failed. Please try again.', 'error');
        } finally {
            setTimeout(() => {
                button.disabled = false;
                button.classList.remove('downloading');
                button.textContent = 'Download Now';
            }, 2000);
        }
    }

    async checkFileExists(url) {
        try {
            const response = await fetch(url, { method: 'HEAD' });
            return response.ok;
        } catch {
            return false;
        }
    }

    startDirectDownload(downloadInfo, button) {
        const link = document.createElement('a');
        link.href = downloadInfo.url;
        link.download = downloadInfo.name;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z"/>
            </svg>
            Downloaded!
        `;
        
        this.showNotification(`${downloadInfo.name} downloaded successfully!`, 'success');
    }

    generateDemoFile(downloadInfo, button) {
        let content, mimeType, extension;
        
        switch (downloadInfo.type) {
            case 'application/zip':
                content = this.createDemoZipContent(downloadInfo.name);
                mimeType = 'application/octet-stream';
                extension = '.zip';
                break;
            case 'application/pdf':
                content = this.createDemoPDFContent(downloadInfo.name);
                mimeType = 'application/pdf';
                extension = '.pdf';
                break;
            default:
                content = this.createDemoTextContent(downloadInfo.name);
                mimeType = 'text/plain';
                extension = '.txt';
        }
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadInfo.name.replace(/\s+/g, '_') + extension;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(url);
        
        button.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M9,16.17L4.83,12L3.41,13.41L9,19L21,7L19.59,5.59L9,16.17Z"/>
            </svg>
            Downloaded!
        `;
        
        this.showNotification(`${downloadInfo.name} downloaded successfully!`, 'success');
    }

    createDemoZipContent(name) {
        return `Demo ${name} Package\n\nThis is a demonstration file for ${name}.\n\nContents:\n- Sample utilities\n- Documentation\n- Configuration files\n\nFor the full version, please contact support.\n\nGenerated: ${new Date().toISOString()}`;
    }

    createDemoPDFContent(name) {
        return `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
>>
endobj

4 0 obj
<<
/Length 44
>>
stream
BT
/F1 12 Tf
72 720 Td
(Demo ${name}) Tj
ET
endstream
endobj

xref
0 5
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000206 00000 n 
trailer
<<
/Size 5
/Root 1 0 R
>>
startxref
300
%%EOF`;
    }

    createDemoTextContent(name) {
        return `${name} - Demo Version

This is a demonstration file for ${name}.

Features:
- Professional quality tools
- Easy to use interface
- Comprehensive documentation
- Regular updates

For the full version with all features, please visit our website.

Generated: ${new Date().toLocaleString()}
Version: Demo 1.0
`;
    }

    async simulateDownloadPreparation() {
        return new Promise(resolve => {
            setTimeout(resolve, 1000 + Math.random() * 1000);
        });
    }

    trackDownload(fileName) {
        const downloads = JSON.parse(localStorage.getItem('downloadHistory') || '[]');
        downloads.push({
            file: fileName,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        
        if (downloads.length > 50) {
            downloads.splice(0, downloads.length - 50);
        }
        
        localStorage.setItem('downloadHistory', JSON.stringify(downloads));
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

    clearDownloadHistory() {
        localStorage.removeItem('downloadHistory');
    }
}

const notificationStyles = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--background-card);
        border: 1px solid var(--border-color);
        border-radius: 0.5rem;
        padding: 1rem;
        max-width: 400px;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification-success {
        border-left: 4px solid #10b981;
    }
    
    .notification-error {
        border-left: 4px solid #ef4444;
    }
    
    .notification-info {
        border-left: 4px solid var(--primary-color);
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }
    
    .notification-message {
        color: var(--text-primary);
        font-weight: 500;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
    }
    
    .notification-close:hover {
        background-color: var(--background-secondary);
    }
    
    .download-spinner {
        width: 16px;
        height: 16px;
        margin-right: 0.5rem;
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .downloading {
        opacity: 0.7;
        cursor: not-allowed;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

document.addEventListener('DOMContentLoaded', () => {
    new DownloadManager();
});
