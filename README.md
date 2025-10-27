# RAG Tutorial Project

This project uses the Fumadocs framework for documentation.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Run the development server:
   ```bash
   pnpm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Documentation Structure

- Documentation files are located in `/content/docs/`
- Main layout configuration is in `/app/layout.tsx`
- MDX configuration is in `/source.config.ts`

## How to Access Official Documentation

To learn more about using Fumadocs and its Markdown features:

1. Visit the official Fumadocs documentation: https://fumadocs.dev/docs
2. Key sections to explore:
   - [Markdown Guide](https://fumadocs.dev/docs/ui/markdown)
   - [Math Support](https://fumadocs.dev/docs/ui/markdown/math)
   - [Components](https://fumadocs.dev/docs/ui/components)

For comprehensive guidelines on transferring content from external sources to Fumadocs, see the [Content Transfer Guideline](fumadocs-content-transfer-guideline.md).

## Project Structure

```
.
├── app/                 # Next.js app directory
├── content/
│   └── docs/           # Documentation files (.mdx)
├── lib/                 # Library files
├── source.config.ts     # MDX configuration
└── package.json         # Project dependencies
```

## Adding New Documentation

1. Create a new `.mdx` file in `/content/docs/`
2. Add frontmatter at the top:
   ```yaml
   ---
   title: Your Document Title
   description: Brief description
   ---
   ```
3. Write your content using Markdown and MDX syntax
4. The new page will automatically be available at `/docs/your-filename`

## Math Support

This project is configured with KaTeX for mathematical expressions:
- Inline math: `$$E = mc^2$$`
- Block math: 
  ```
  $$
  \sum_{i=1}^{n} x_i = \frac{n(n+1)}{2}
  $$
  ```

For more details on using math expressions, see the [Math Guide](fumadocs-markdown-guide.md).

## Best Practices for Documentation

When adding new documentation, follow these best practices:

1. **Use proper MDX syntax**: Avoid mixing HTML and MDX syntax. Use Markdown syntax for images (`![alt](src)`) instead of HTML `<img>` tags.

2. **File structure**: Place sub-articles in appropriately named subdirectories under `/content/docs/`.

3. **Frontmatter**: Always include proper frontmatter with title and description.

4. **Image handling**: Copy all referenced images to the `/public/images` directory and reference them using absolute paths (e.g., `/images/filename.webp`).

5. **Inline styles**: When using inline styles in HTML tags within MDX, use JavaScript object syntax (e.g., `<mark style={{backgroundColor: 'red'}}>text</mark>`) instead of CSS string syntax.

6. **Testing**: After adding new content, clean the build cache (`rm -rf .next`) and restart the development server to ensure proper compilation.

7. **Validation**: Verify that both the new content and existing content are accessible through the browser.