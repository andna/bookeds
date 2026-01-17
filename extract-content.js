// Script to extract content from Draft.js HTML while preserving main component types
// Usage: Run this in browser console or Node.js with the HTML content

function extractContent(htmlString) {
    // Create a temporary container to parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    
    // Find the main container
    const container = doc.querySelector('[data-contents="true"]') || doc.body;
    
    const result = [];
    
    // Process each top-level block
    const blocks = container.querySelectorAll('[data-block="true"]');
    
    blocks.forEach(block => {
        const blockType = getBlockType(block);
        const content = getTextContent(block);
        
        if (content.trim()) {
            result.push({
                type: blockType.tag,
                content: content,
                html: `<${blockType.tag}${blockType.attrs ? ' ' + blockType.attrs : ''}>${content}</${blockType.tag}>`
            });
        }
    });
    
    return result;
}

function getBlockType(element) {
    const classList = element.classList;
    const tagName = element.tagName.toLowerCase();
    
    // Check for header
    if (classList.contains('longform-header-two') || tagName === 'h2') {
        return { tag: 'h2', attrs: null };
    }
    
    if (classList.contains('longform-header-three') || tagName === 'h3') {
        return { tag: 'h3', attrs: null };
    }
    
    // Check for blockquote
    if (classList.contains('longform-blockquote') || tagName === 'blockquote') {
        return { tag: 'blockquote', attrs: null };
    }
    
    // Check for lists
    if (classList.contains('longform-ordered-list-item') || element.closest('ol')) {
        return { tag: 'li', attrs: null };
    }
    
    if (classList.contains('longform-unordered-list-item') || element.closest('ul')) {
        return { tag: 'li', attrs: null };
    }
    
    // Check for section/separator
    if (tagName === 'section' || element.querySelector('[role="separator"]')) {
        return { tag: 'hr', attrs: null };
    }
    
    // Default to paragraph or div
    if (classList.contains('longform-unstyled')) {
        return { tag: 'p', attrs: null };
    }
    
    return { tag: tagName, attrs: null };
}

function getTextContent(element) {
    // Get all text nodes, preserving basic formatting
    let text = '';
    
    // Check for links
    const links = element.querySelectorAll('a[href]');
    if (links.length > 0) {
        const clone = element.cloneNode(true);
        clone.querySelectorAll('a[href]').forEach((link, index) => {
            const originalLink = links[index];
            link.innerHTML = `<a href="${originalLink.href}">${link.textContent}</a>`;
        });
        text = clone.textContent || clone.innerText;
    } else {
        text = element.textContent || element.innerText;
    }
    
    // Clean up extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    
    return text;
}

function extractToCleanHTML(htmlString) {
    const extracted = extractContent(htmlString);
    let output = [];
    let currentList = null;
    let currentListType = null;
    
    extracted.forEach(item => {
        if (item.type === 'li') {
            // Determine list type based on content or pattern
            const listType = 'ul'; // You might need logic to detect ol vs ul
            
            if (currentListType !== listType) {
                if (currentList) {
                    output.push(`</${currentListType}>`);
                }
                output.push(`<${listType}>`);
                currentListType = listType;
                currentList = [];
            }
            
            output.push(`  <li>${item.content}</li>`);
        } else {
            // Close any open list
            if (currentList !== null) {
                output.push(`</${currentListType}>`);
                currentList = null;
                currentListType = null;
            }
            
            if (item.type === 'hr') {
                output.push('<hr>');
            } else {
                output.push(item.html);
            }
        }
    });
    
    // Close final list if open
    if (currentList !== null) {
        output.push(`</${currentListType}>`);
    }
    
    return output.join('\n');
}

// Browser usage:
// 1. Copy the HTML content you want to extract
// 2. Run: const html = document.querySelector('.container').innerHTML;
// 3. Run: const clean = extractToCleanHTML(html);
// 4. Run: console.log(clean);

// Node.js usage:
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { extractContent, extractToCleanHTML };
}

// Example usage in browser console:
// const container = document.querySelector('[data-contents="true"]');
// const cleanHTML = extractToCleanHTML(container.parentElement.innerHTML);
// console.log(cleanHTML);
// 
// To copy to clipboard:
// navigator.clipboard.writeText(cleanHTML);
