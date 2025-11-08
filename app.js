// Initialize PDF.js
if (typeof pdfjsLib !== 'undefined') {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

// Global state
let cvData = {
    personalInfo: {},
    summary: '',
    experience: [],
    education: [],
    skills: [],
    certifications: [],
    template: 'modern'
};

let apiKey = '';
let aiProvider = 'anthropic';

// Load saved API key
window.addEventListener('DOMContentLoaded', () => {
    const savedKey = localStorage.getItem('cvmaker_api_key');
    const savedProvider = localStorage.getItem('cvmaker_ai_provider');
    if (savedKey) {
        apiKey = savedKey;
        document.getElementById('api-key').value = savedKey;
    }
    if (savedProvider) {
        aiProvider = savedProvider;
        document.getElementById('ai-provider').value = savedProvider;
    }
});

// Method Switching
document.querySelectorAll('.method-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.method-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.input-section').forEach(s => s.classList.remove('active'));

        this.classList.add('active');
        const method = this.dataset.method;
        document.getElementById(`${method}-section`).classList.add('active');
    });
});

// Template Selection
document.querySelectorAll('.template-option').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.template-option').forEach(o => o.classList.remove('active'));
        this.classList.add('active');
        cvData.template = this.dataset.template;
    });
});

// PDF Upload Handling
const uploadArea = document.getElementById('upload-area');
const pdfUpload = document.getElementById('pdf-upload');

uploadArea.addEventListener('click', () => pdfUpload.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        handlePDFUpload(file);
    }
});

pdfUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handlePDFUpload(file);
    }
});

// Handle PDF Upload and Extraction
async function handlePDFUpload(file) {
    const statusDiv = document.getElementById('extraction-status');
    statusDiv.style.display = 'block';
    statusDiv.className = 'status-message loading';
    statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Extracting text from PDF...';

    try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        statusDiv.className = 'status-message loading';
        statusDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Parsing CV data with AI...';

        // Parse the extracted text with AI
        await parseCVWithAI(fullText);

        statusDiv.className = 'status-message success';
        statusDiv.innerHTML = '<i class="fas fa-check-circle"></i> CV extracted successfully! Review and edit the information below.';

        // Switch to manual section to show extracted data
        document.querySelector('[data-method="manual"]').click();
    } catch (error) {
        console.error('Error processing PDF:', error);
        statusDiv.className = 'status-message error';
        statusDiv.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error processing PDF. Please try manual input or check the file.';
    }
}

// Parse CV text with AI
async function parseCVWithAI(text) {
    if (!apiKey) {
        // Fallback to basic parsing if no API key
        basicParsing(text);
        return;
    }

    try {
        const prompt = `Extract structured information from this CV/resume text and return ONLY valid JSON with this exact structure:
{
  "personalInfo": {
    "fullName": "",
    "email": "",
    "phone": "",
    "location": "",
    "linkedin": "",
    "portfolio": ""
  },
  "summary": "",
  "experience": [
    {
      "jobTitle": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "description": ""
    }
  ],
  "education": [
    {
      "degree": "",
      "field": "",
      "institution": "",
      "gradYear": ""
    }
  ],
  "skills": [],
  "certifications": [
    {
      "name": "",
      "organization": "",
      "date": ""
    }
  ]
}

CV Text:
${text}

Return ONLY the JSON, no markdown, no explanation.`;

        const response = await callAI(prompt);
        const jsonMatch = response.match(/\{[\s\S]*\}/);

        if (jsonMatch) {
            const parsedData = JSON.parse(jsonMatch[0]);
            populateFormWithData(parsedData);
        } else {
            basicParsing(text);
        }
    } catch (error) {
        console.error('AI parsing error:', error);
        basicParsing(text);
    }
}

// Basic parsing fallback
function basicParsing(text) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const linkedinRegex = /linkedin\.com\/in\/[\w-]+/;

    const email = text.match(emailRegex);
    const phone = text.match(phoneRegex);
    const linkedin = text.match(linkedinRegex);

    if (email) document.getElementById('email').value = email[0];
    if (phone) document.getElementById('phone').value = phone[0];
    if (linkedin) document.getElementById('linkedin').value = 'https://' + linkedin[0];

    // Extract skills (common tech skills)
    const commonSkills = ['JavaScript', 'Python', 'Java', 'C++', 'React', 'Node.js', 'AWS', 'Docker', 'SQL', 'Git'];
    const foundSkills = commonSkills.filter(skill =>
        text.toLowerCase().includes(skill.toLowerCase())
    );
    if (foundSkills.length > 0) {
        document.getElementById('skills').value = foundSkills.join(', ');
    }
}

// Populate form with parsed data
function populateFormWithData(data) {
    // Personal Info
    if (data.personalInfo) {
        document.getElementById('fullName').value = data.personalInfo.fullName || '';
        document.getElementById('email').value = data.personalInfo.email || '';
        document.getElementById('phone').value = data.personalInfo.phone || '';
        document.getElementById('location').value = data.personalInfo.location || '';
        document.getElementById('linkedin').value = data.personalInfo.linkedin || '';
        document.getElementById('portfolio').value = data.personalInfo.portfolio || '';
    }

    // Summary
    if (data.summary) {
        document.getElementById('summary').value = data.summary;
    }

    // Experience
    if (data.experience && data.experience.length > 0) {
        const container = document.getElementById('experience-container');
        container.innerHTML = '';
        data.experience.forEach(exp => {
            addExperience();
            const items = container.querySelectorAll('.experience-item');
            const item = items[items.length - 1];
            item.querySelector('.job-title').value = exp.jobTitle || '';
            item.querySelector('.company').value = exp.company || '';
            item.querySelector('.start-date').value = exp.startDate || '';
            item.querySelector('.end-date').value = exp.endDate || '';
            item.querySelector('.current-job').checked = exp.current || false;
            item.querySelector('.job-description').value = exp.description || '';
        });
    }

    // Education
    if (data.education && data.education.length > 0) {
        const container = document.getElementById('education-container');
        container.innerHTML = '';
        data.education.forEach(edu => {
            addEducation();
            const items = container.querySelectorAll('.education-item');
            const item = items[items.length - 1];
            item.querySelector('.degree').value = edu.degree || '';
            item.querySelector('.field').value = edu.field || '';
            item.querySelector('.institution').value = edu.institution || '';
            item.querySelector('.grad-year').value = edu.gradYear || '';
        });
    }

    // Skills
    if (data.skills && data.skills.length > 0) {
        document.getElementById('skills').value = Array.isArray(data.skills)
            ? data.skills.join(', ')
            : data.skills;
    }

    // Certifications
    if (data.certifications && data.certifications.length > 0) {
        const container = document.getElementById('certification-container');
        container.innerHTML = '';
        data.certifications.forEach(cert => {
            addCertification();
            const items = container.querySelectorAll('.certification-item');
            const item = items[items.length - 1];
            item.querySelector('.cert-name').value = cert.name || '';
            item.querySelector('.cert-org').value = cert.organization || '';
            item.querySelector('.cert-date').value = cert.date || '';
        });
    }
}

// Add Experience Item
function addExperience() {
    const container = document.getElementById('experience-container');
    const template = `
        <div class="experience-item">
            <div class="form-grid">
                <div class="form-group">
                    <label>Job Title</label>
                    <input type="text" class="job-title" placeholder="e.g., Senior Software Engineer">
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" class="company" placeholder="e.g., Tech Corp">
                </div>
                <div class="form-group">
                    <label>Start Date</label>
                    <input type="month" class="start-date">
                </div>
                <div class="form-group">
                    <label>End Date</label>
                    <input type="month" class="end-date">
                    <label class="checkbox-label">
                        <input type="checkbox" class="current-job"> Current Position
                    </label>
                </div>
                <div class="form-group full-width">
                    <label>Description</label>
                    <textarea class="job-description" rows="3" placeholder="Describe your key responsibilities and achievements..."></textarea>
                </div>
            </div>
            <button type="button" class="btn btn-remove" onclick="removeExperience(this)">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', template);
}

function removeExperience(btn) {
    btn.closest('.experience-item').remove();
}

// Add Education Item
function addEducation() {
    const container = document.getElementById('education-container');
    const template = `
        <div class="education-item">
            <div class="form-grid">
                <div class="form-group">
                    <label>Degree</label>
                    <input type="text" class="degree" placeholder="e.g., Bachelor of Science">
                </div>
                <div class="form-group">
                    <label>Field of Study</label>
                    <input type="text" class="field" placeholder="e.g., Computer Science">
                </div>
                <div class="form-group">
                    <label>Institution</label>
                    <input type="text" class="institution" placeholder="e.g., University Name">
                </div>
                <div class="form-group">
                    <label>Graduation Year</label>
                    <input type="number" class="grad-year" placeholder="2024" min="1950" max="2030">
                </div>
            </div>
            <button type="button" class="btn btn-remove" onclick="removeEducation(this)">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', template);
}

function removeEducation(btn) {
    btn.closest('.education-item').remove();
}

// Add Certification Item
function addCertification() {
    const container = document.getElementById('certification-container');
    const template = `
        <div class="certification-item">
            <div class="form-grid">
                <div class="form-group">
                    <label>Certification Name</label>
                    <input type="text" class="cert-name" placeholder="e.g., AWS Certified Solutions Architect">
                </div>
                <div class="form-group">
                    <label>Issuing Organization</label>
                    <input type="text" class="cert-org" placeholder="e.g., Amazon Web Services">
                </div>
                <div class="form-group">
                    <label>Date Obtained</label>
                    <input type="month" class="cert-date">
                </div>
            </div>
            <button type="button" class="btn btn-remove" onclick="removeCertification(this)">
                <i class="fas fa-trash"></i> Remove
            </button>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', template);
}

function removeCertification(btn) {
    btn.closest('.certification-item').remove();
}

// Improve with AI
async function improveWithAI(fieldId) {
    if (!apiKey) {
        document.getElementById('ai-modal').style.display = 'block';
        return;
    }

    const field = document.getElementById(fieldId);
    const originalText = field.value;

    if (!originalText.trim()) {
        alert('Please enter some text first');
        return;
    }

    field.disabled = true;
    const originalValue = field.value;
    field.value = 'Improving with AI...';

    try {
        const prompt = `Improve this professional summary for a CV/resume. Make it more compelling, concise, and professional. Keep it under 150 words. Return ONLY the improved text, no explanations:

${originalText}`;

        const improved = await callAI(prompt);
        field.value = improved.trim();
    } catch (error) {
        console.error('AI improvement error:', error);
        alert('Error improving text with AI. Please try again.');
        field.value = originalValue;
    } finally {
        field.disabled = false;
    }
}

// Call AI API
async function callAI(prompt) {
    if (aiProvider === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 2000,
                messages: [{
                    role: 'user',
                    content: prompt
                }]
            })
        });

        if (!response.ok) {
            throw new Error('AI API request failed');
        }

        const data = await response.json();
        return data.content[0].text;
    } else if (aiProvider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [{
                    role: 'user',
                    content: prompt
                }],
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            throw new Error('AI API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }
}

// AI Modal Functions
function closeAIModal() {
    document.getElementById('ai-modal').style.display = 'none';
}

function saveAPIKey() {
    const key = document.getElementById('api-key').value;
    const provider = document.getElementById('ai-provider').value;

    if (key) {
        apiKey = key;
        aiProvider = provider;
        localStorage.setItem('cvmaker_api_key', key);
        localStorage.setItem('cvmaker_ai_provider', provider);
        closeAIModal();
        alert('API key saved successfully!');
    }
}

// Collect form data
function collectFormData() {
    cvData.personalInfo = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        location: document.getElementById('location').value,
        linkedin: document.getElementById('linkedin').value,
        portfolio: document.getElementById('portfolio').value
    };

    cvData.summary = document.getElementById('summary').value;

    // Experience
    cvData.experience = [];
    document.querySelectorAll('.experience-item').forEach(item => {
        const exp = {
            jobTitle: item.querySelector('.job-title').value,
            company: item.querySelector('.company').value,
            startDate: item.querySelector('.start-date').value,
            endDate: item.querySelector('.end-date').value,
            current: item.querySelector('.current-job').checked,
            description: item.querySelector('.job-description').value
        };
        if (exp.jobTitle || exp.company) {
            cvData.experience.push(exp);
        }
    });

    // Education
    cvData.education = [];
    document.querySelectorAll('.education-item').forEach(item => {
        const edu = {
            degree: item.querySelector('.degree').value,
            field: item.querySelector('.field').value,
            institution: item.querySelector('.institution').value,
            gradYear: item.querySelector('.grad-year').value
        };
        if (edu.degree || edu.institution) {
            cvData.education.push(edu);
        }
    });

    // Skills
    const skillsText = document.getElementById('skills').value;
    cvData.skills = skillsText ? skillsText.split(',').map(s => s.trim()) : [];

    // Certifications
    cvData.certifications = [];
    document.querySelectorAll('.certification-item').forEach(item => {
        const cert = {
            name: item.querySelector('.cert-name').value,
            organization: item.querySelector('.cert-org').value,
            date: item.querySelector('.cert-date').value
        };
        if (cert.name) {
            cvData.certifications.push(cert);
        }
    });
}

// Generate Preview
function generatePreview() {
    collectFormData();

    const preview = document.getElementById('cv-preview');
    const templateClass = cvData.template;

    let html = `
        <div class="cv-${cvData.template}">
            <div class="cv-header ${cvData.template}">
                <h1>${cvData.personalInfo.fullName || 'Your Name'}</h1>
                <div class="contact-info">
                    ${cvData.personalInfo.email ? `<span><i class="fas fa-envelope"></i> ${cvData.personalInfo.email}</span>` : ''}
                    ${cvData.personalInfo.phone ? `<span><i class="fas fa-phone"></i> ${cvData.personalInfo.phone}</span>` : ''}
                    ${cvData.personalInfo.location ? `<span><i class="fas fa-map-marker-alt"></i> ${cvData.personalInfo.location}</span>` : ''}
                    ${cvData.personalInfo.linkedin ? `<span><i class="fab fa-linkedin"></i> LinkedIn</span>` : ''}
                    ${cvData.personalInfo.portfolio ? `<span><i class="fas fa-globe"></i> Portfolio</span>` : ''}
                </div>
            </div>

            ${cvData.summary ? `
                <div class="cv-section">
                    <h2>Professional Summary</h2>
                    <p>${cvData.summary}</p>
                </div>
            ` : ''}

            ${cvData.experience.length > 0 ? `
                <div class="cv-section">
                    <h2>Work Experience</h2>
                    ${cvData.experience.map(exp => `
                        <div style="margin-bottom: 1.5rem;">
                            <h3>${exp.jobTitle} at ${exp.company}</h3>
                            <p class="date">${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}</p>
                            <p>${exp.description}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${cvData.education.length > 0 ? `
                <div class="cv-section">
                    <h2>Education</h2>
                    ${cvData.education.map(edu => `
                        <div style="margin-bottom: 1rem;">
                            <h3>${edu.degree} in ${edu.field}</h3>
                            <p>${edu.institution} - ${edu.gradYear}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${cvData.skills.length > 0 ? `
                <div class="cv-section">
                    <h2>Skills</h2>
                    <div class="skills-list">
                        ${cvData.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}

            ${cvData.certifications.length > 0 ? `
                <div class="cv-section">
                    <h2>Certifications</h2>
                    ${cvData.certifications.map(cert => `
                        <div style="margin-bottom: 1rem;">
                            <h3>${cert.name}</h3>
                            <p>${cert.organization} - ${formatDate(cert.date)}</p>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;

    preview.innerHTML = html;
    document.getElementById('preview-section').style.display = 'block';
    document.getElementById('preview-section').scrollIntoView({ behavior: 'smooth' });
}

// Format Date
function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month] = dateString.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[parseInt(month) - 1]} ${year}`;
}

// Edit CV
function editCV() {
    document.getElementById('preview-section').style.display = 'none';
    document.getElementById('manual-section').scrollIntoView({ behavior: 'smooth' });
}

// Download CV as PDF
async function downloadCV() {
    collectFormData();

    if (!cvData.personalInfo.fullName) {
        alert('Please fill in at least your name before downloading');
        return;
    }

    // Make sure preview is generated
    if (document.getElementById('preview-section').style.display === 'none') {
        generatePreview();
    }

    const element = document.getElementById('cv-preview');
    const { jsPDF } = window.jspdf;

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            logging: false,
            useCORS: true
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_CV.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('ai-modal');
    if (event.target === modal) {
        closeAIModal();
    }
}
