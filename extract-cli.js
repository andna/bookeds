// Node.js CLI script to extract content from Draft.js HTML
// Usage: node extract-cli.js input.html output.html

const fs = require('fs');
const { JSDOM } = require('jsdom');

function getBlockType(element) {
    const classList = element.classList;
    const tagName = element.tagName.toLowerCase();
    
    // Check for headers
    if (classList.contains('longform-header-two') || tagName === 'h2') {
        return { tag: 'h2' };
    }
    if (classList.contains('longform-header-three') || tagName === 'h3') {
        return { tag: 'h3' };
    }
    
    // Check for blockquote
    if (classList.contains('longform-blockquote') || tagName === 'blockquote') {
        return { tag: 'blockquote' };
    }
    
    // Check for lists
    if (classList.contains('longform-ordered-list-item')) {
        return { tag: 'li', listType: 'ol' };
    }
    if (classList.contains('longform-unordered-list-item')) {
        return { tag: 'li', listType: 'ul' };
    }
    
    // Check for section/separator
    if (tagName === 'section' || element.querySelector('[role="separator"]')) {
        return { tag: 'hr' };
    }
    
    // Default to paragraph
    if (classList.contains('longform-unstyled')) {
        return { tag: 'p' };
    }
    
    return { tag: 'div' };
}

function getTextContent(element) {
    // Get text content while preserving some structure
    let text = element.textContent || '';
    
    // Clean up extra whitespace
    text = text.replace(/\s+/g, ' ').trim();
    return text;
}

function processBlocks(container) {
    const blocks = container.querySelectorAll('[data-block="true"]');
    const result = [];
    let currentList = null;
    let currentListType = null;
    
    blocks.forEach(block => {
        const blockInfo = getBlockType(block);
        const content = getTextContent(block);
        
        if (!content.trim()) return;
        
        // Escape HTML entities
        const escapedContent = content
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
        
        if (blockInfo.tag === 'li') {
            // Handle list items
            if (currentListType !== blockInfo.listType) {
                if (currentList !== null) {
                    result.push(`</${currentListType}>`);
                }
                result.push(`<${blockInfo.listType}>`);
                currentListType = blockInfo.listType;
                currentList = [];
            }
            result.push(`  <li>${escapedContent}</li>`);
        } else {
            // Close any open list
            if (currentList !== null) {
                result.push(`</${currentListType}>`);
                currentList = null;
                currentListType = null;
            }
            
            if (blockInfo.tag === 'hr') {
                result.push('<hr>');
            } else {
                result.push(`<${blockInfo.tag}>${escapedContent}</${blockInfo.tag}>`);
            }
        }
    });
    
    // Close final list if open
    if (currentList !== null) {
        result.push(`</${currentListType}>`);
    }
    
    return result.join('\n');
}

function extractFromFile(inputFile, outputFile) {
    try {
        // Read the input file
        const html = fs.readFileSync(inputFile, 'utf8');
        
        // Parse with JSDOM
        const dom = new JSDOM(html);
        const document = dom.window.document;
        
        // Find the main container
        const container = document.querySelector('[data-contents="true"]') || 
                         document.querySelector('.container') ||
                         document.body;
        
        // Extract clean content
        const cleanHTML = processBlocks(container);
        
        // Create a complete HTML document
        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Extracted Content</title>
    <style>
        body {
            font-family: Georgia, serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        h2 {
            color: #333;
            margin-top: 2em;
            margin-bottom: 0.5em;
        }
        blockquote {
            border-left: 4px solid #ccc;
            margin: 1.5em 0;
            padding-left: 1em;
            font-style: italic;
            color: #666;
        }
        hr {
            border: none;
            border-top: 1px solid #ddd;
            margin: 2em 0;
        }
        ol, ul {
            margin: 1em 0;
            padding-left: 2em;
        }
        li {
            margin: 0.5em 0;
        }
    </style>
</head>
<body>
${cleanHTML}
</body>
</html>`;
        
        // Write to output file
        fs.writeFileSync(outputFile, fullHTML, 'utf8');
        
        console.log(`✅ Success! Extracted content saved to: ${outputFile}`);
        console.log(`   Processed ${container.querySelectorAll('[data-block="true"]').length} blocks`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// CLI usage
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('Usage: node extract-cli.js <input.html> [output.html]');
        console.log('');
        console.log('Example:');
        console.log('  node extract-cli.js index.html clean.html');
        console.log('');
        console.log('If output file is not specified, it will use "extracted.html"');
        process.exit(1);
    }
    
    const inputFile = args[0];
    const outputFile = args[1] || 'extracted.html';
    
    if (!fs.existsSync(inputFile)) {
        console.error(`❌ Error: Input file "${inputFile}" not found`);
        process.exit(1);
    }
    
    extractFromFile(inputFile, outputFile);
}

module.exports = { extractFromFile, processBlocks };
