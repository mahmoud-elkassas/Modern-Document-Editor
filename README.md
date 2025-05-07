# Modern Document Editor

A feature-rich, web-based document editor built with React and TypeScript. This application provides a modern interface for creating, editing, and managing documents with support for various file formats.

## Features

- 📝 Rich text editing with formatting options
- 📂 Import/Export support for multiple formats (.doc, .docx, .pdf)
- 📄 Header and footer management
- 🖨️ Print functionality
- 🎨 Modern, responsive UI
- 🔔 Toast notifications
- 📱 Mobile-friendly design

## Tech Stack

- React
- TypeScript
- Radix UI
- TipTap Editor
- PDF.js
- Mammoth (for Word document processing)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd [project-directory]
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Start the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/         # React components
│   ├── ui/            # UI components
│   └── toolbar.tsx    # Main toolbar component
├── hooks/             # Custom React hooks
├── lib/               # Utility functions and services
│   ├── word-processor.ts
│   └── document-export.ts
└── styles/            # Global styles
```

## Key Features

### Document Import

- Support for .doc, .docx, and .pdf files
- Preserves document metadata
- Handles headers and footers
- Progress tracking during import
- Error handling with user feedback

### Document Export

- Export to multiple formats
- Preserves document formatting
- Maintains metadata

### Rich Text Editing

- Text formatting (bold, italic, underline)
- Font size and family controls
- Text alignment
- Lists and tables
- Image insertion
- Link management

### Header and Footer

- Different headers/footers for first page
- Different headers/footers for odd/even pages
- Customizable content
- Visibility controls

## Usage

### Basic Editing

1. Open the editor
2. Start typing or import an existing document
3. Use the toolbar for formatting
4. Save or export your document

### Importing Documents

1. Click the "Import" button in the toolbar
2. Select a file (.doc, .docx, or .pdf)
3. Wait for the import to complete
4. Edit the imported document

### Exporting Documents

1. Click the "Export" button in the toolbar
2. Choose the desired format
3. Select the export location
4. Download the exported file

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Radix UI](https://www.radix-ui.com/) for accessible components
- [TipTap](https://tiptap.dev/) for the rich text editor
- [PDF.js](https://mozilla.github.io/pdf.js/) for PDF processing
- [Mammoth](https://github.com/maladr0it/mammoth.js) for Word document processing

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Roadmap

- [ ] Add support for more file formats
- [ ] Implement collaborative editing
- [ ] Add document versioning
- [ ] Enhance mobile experience
- [ ] Add more export options
- [ ] Implement document templates
