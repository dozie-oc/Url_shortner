// static/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const shortLink = document.querySelector('.short-url-container a');
    
    if (shortLink) {
        shortLink.addEventListener('click', async (e) => {
            if (navigator.clipboard) {
                try {
                    await navigator.clipboard.writeText(shortLink.href);
                    const originalText = shortLink.textContent;
                    shortLink.textContent = '✅ Copied!';
                    setTimeout(() => {
                        shortLink.textContent = originalText;
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy', err);
                }
            }
        });
    }
});