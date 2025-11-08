# Professional CV Maker

A modern, AI-powered CV/Resume builder that allows you to create professional resumes by either uploading a PDF or manually entering your details.

## Features

### Dual Input Methods
- **PDF Upload**: Upload your existing resume and let AI extract and parse the information
- **Manual Input**: Fill in a comprehensive form with all your professional details

### AI-Powered
- **Smart PDF Parsing**: Automatically extracts personal info, experience, education, skills, and certifications
- **Content Improvement**: Use AI to enhance your professional summary and make it more compelling
- **Intelligent Extraction**: Recognizes common patterns and formats in resumes

### Professional Templates
- **Modern Template**: Contemporary design with gradient headers
- **Professional Template**: Classic business style
- **Creative Template**: Stand out with a unique design

### Export Options
- **PDF Download**: Generate high-quality PDF resumes
- **Live Preview**: See your CV in real-time before downloading

## How to Use

### Getting Started

1. **Open the Application**
   - Simply open `index.html` in a modern web browser
   - No installation or build process required!

2. **Choose Your Input Method**
   - Click "Upload PDF Resume" to parse an existing CV
   - Click "Manual Input" to fill in your details from scratch

### Using PDF Upload

1. Click the "Upload PDF Resume" button or drag and drop your PDF
2. Wait for AI to extract the information
3. Review the extracted data in the manual input form
4. Make any necessary corrections or additions
5. Choose your template
6. Preview and download

### Using Manual Input

1. Fill in your personal information (name, email, phone, etc.)
2. Write your professional summary (use AI to improve it!)
3. Add work experience entries
4. Add education details
5. List your skills (comma-separated)
6. Add certifications (optional)
7. Choose a template
8. Preview and download

### AI Features

To use AI features (PDF parsing and content improvement):

1. Click on any "Improve with AI" button
2. You'll be prompted to enter your API key
3. Choose your AI provider:
   - **Anthropic Claude** (recommended)
   - **OpenAI GPT-4**
4. Enter your API key
5. Click Save

**Getting API Keys:**
- Anthropic: https://console.anthropic.com/
- OpenAI: https://platform.openai.com/api-keys

**Note:** API keys are stored locally in your browser and never sent to any server except the AI provider.

## Technical Details

### Technologies Used
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **PDF Parsing**: PDF.js
- **PDF Generation**: jsPDF + html2canvas
- **AI Integration**: Anthropic Claude API / OpenAI API
- **Styling**: Custom CSS with modern design patterns

### Browser Compatibility
- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6+ support

### No Backend Required
This is a fully client-side application. Everything runs in your browser:
- No data is sent to external servers (except AI API calls)
- No database needed
- No server-side processing
- Your data stays private

## File Structure

```
CVmaker/
├── index.html       # Main HTML file
├── styles.css       # All styling
├── app.js          # Application logic
└── README.md       # This file
```

## Privacy & Security

- **Local Storage**: API keys are stored in browser localStorage
- **No Tracking**: We don't track, collect, or store any of your data
- **Client-Side**: All processing happens in your browser
- **Secure**: No data sent to third parties (except AI APIs when you use AI features)

## Features Breakdown

### Personal Information
- Full Name
- Email Address
- Phone Number
- Location
- LinkedIn Profile
- Portfolio/Website

### Professional Summary
- Rich text area for your summary
- AI-powered improvement suggestions

### Work Experience
- Job Title
- Company Name
- Start/End Dates
- Current Position checkbox
- Detailed description
- Add multiple positions

### Education
- Degree
- Field of Study
- Institution Name
- Graduation Year
- Add multiple entries

### Skills
- Comma-separated skill list
- Displayed as tags in CV

### Certifications
- Certification Name
- Issuing Organization
- Date Obtained
- Add multiple certifications

## Customization

### Templates
The application includes three pre-designed templates:
- Modern (gradient purple/blue)
- Professional (gradient blue)
- Creative (gradient green)

### Styling
You can customize the appearance by editing `styles.css`:
- Change color schemes in CSS variables
- Modify fonts
- Adjust spacing and layouts

## Tips for Best Results

1. **PDF Upload**: Use well-formatted PDFs for best extraction results
2. **Summary**: Keep it concise (under 150 words)
3. **Experience**: Use bullet points and quantify achievements
4. **Skills**: List relevant skills for your target job
5. **AI Improvement**: Review AI suggestions before accepting

## Troubleshooting

### PDF Not Parsing Correctly
- Ensure PDF is text-based (not scanned image)
- Try manual input instead
- Check that the PDF isn't password-protected

### AI Features Not Working
- Verify your API key is correct
- Check your internet connection
- Ensure you have API credits available
- Try switching AI providers

### Download Not Working
- Make sure you've filled in at least your name
- Check browser pop-up settings
- Try a different browser

## Development

### Running Locally
```bash
# No build process needed!
# Just open index.html in your browser
open index.html
```

### For Local Development Server (Optional)
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Then open http://localhost:8000
```

## Future Enhancements

Potential features for future versions:
- More templates
- Multi-language support
- ATS (Applicant Tracking System) optimization
- Cover letter generator
- LinkedIn integration
- Multiple export formats (Word, Markdown)

## License

This project is open source and available for personal and commercial use.

## Support

For issues, questions, or suggestions:
1. Check the troubleshooting section
2. Review the documentation
3. Open an issue on GitHub

## Acknowledgments

- PDF.js by Mozilla
- jsPDF library
- html2canvas
- Anthropic Claude AI
- OpenAI GPT

---

**Made with ❤️ for job seekers everywhere**

Start building your professional CV today!
