# Content Extractor for Draft.js HTML

This toolkit extracts clean, readable content from complex Draft.js HTML structures while preserving the main component types (headings, paragraphs, lists, blockquotes, etc.).

## Files Included

1. **extract-content.js** - Core extraction library
2. **extractor.html** - Browser-based GUI tool
3. **extract-cli.js** - Node.js command-line tool
4. **README-EXTRACTOR.md** - This file

## Method 1: Browser GUI (Easiest)

1. Open `extractor.html` in your web browser
2. Paste your complex HTML into the left textarea
3. Click "Extract Content"
4. Copy the clean HTML from the right textarea

Or click "Load from index.html" to automatically load content from your index.html file.

## Method 2: Browser Console (Quick)

1. Open your HTML page in a browser
2. Open the browser console (F12)
3. Paste this code:

```javascript
// Copy the extract-content.js code here, then run:
const container = document.querySelector('[data-contents="true"]');
const cleanHTML = extractToCleanHTML(container.parentElement.innerHTML);
console.log(cleanHTML);

// To copy to clipboard:
navigator.clipboard.writeText(cleanHTML);
```

## Method 3: Node.js CLI (For automation)

First, install the required dependency:

```bash
npm install jsdom
```

Then run:

```bash
node extract-cli.js index.html output.html
```

This will:
- Read `index.html`
- Extract the clean content
- Save it to `output.html` with basic styling

## What Gets Extracted

The script identifies and preserves:

- **Headings** (h2, h3)
- **Paragraphs** (p)
- **Blockquotes** (blockquote)
- **Ordered Lists** (ol, li)
- **Unordered Lists** (ul, li)
- **Horizontal Rules** (hr)
- **Divs** (div) - for other content

## What Gets Removed

- All Draft.js data attributes
- Nested span elements
- Complex React/Draft.js structure
- Inline styles
- Editor-specific classes

## Output Example

**Input (Complex):**
```html
<div class="longform-unstyled" data-block="true" data-editor="a1e4c">
    <div data-offset-key="cgdtv-0-0" class="public-DraftStyleDefault-block">
        <span data-offset-key="cgdtv-0-0">
            <span data-text="true">If you're anything like me...</span>
        </span>
    </div>
</div>
```

**Output (Clean):**
```html
<p>If you're anything like me...</p>
```

## Customization

You can modify the extraction logic in any of the scripts:

- **getBlockType()** - Define how to identify block types
- **getTextContent()** - Customize text extraction
- **processBlocks()** - Adjust output formatting

## Troubleshooting

**"No content extracted"**
- Make sure your HTML contains elements with `[data-block="true"]`
- Check that the container element exists

**"List formatting is wrong"**
- The script detects lists by CSS classes like `longform-ordered-list-item`
- You may need to adjust the detection logic for your specific HTML

**Node.js "Cannot find module 'jsdom'"**
- Run: `npm install jsdom`

## License

Free to use and modify as needed.
