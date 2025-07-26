# Downloads Directory

This directory contains downloadable files for the website.

## Available Files

- `tools.zip` - Professional Tools Package
- `resources.zip` - Resource Pack Collection  
- `docs.pdf` - Complete Documentation

## File Structure

```
assets/
└── downloads/
    ├── tools.zip
    ├── resources.zip
    ├── docs.pdf
    └── README.md
```

## Adding New Files

1. Place your files in this directory
2. Update the download configuration in `js/downloads.js`
3. Add corresponding download cards in `index.html`

## File Size Recommendations

- Keep files under 50MB for optimal download experience
- Compress files when possible
- Provide file size information in the download cards

## Security Notes

- All files are served directly from this directory
- Ensure files are safe and virus-free before uploading
- Consider implementing file integrity checks for sensitive downloads
