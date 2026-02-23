import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ECareNavBar from '../Components/eCareNavBar';
import './css/reportExplainer.css';

const ReportExplainer = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [uploadedImage, setUploadedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [ocrText, setOcrText] = useState('');
    const [explainedText, setExplainedText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [step, setStep] = useState(1); // 1: upload, 2: review OCR, 3: results

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileInput = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPEG, PNG, etc.)');
            return;
        }
        setUploadedImage(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleExtractText = async () => {
        setIsExtracting(true);
        try {
            const formData = new FormData();
            formData.append('file', uploadedImage);

            const response = await fetch('http://localhost:8000/api/ocr', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (data.text) {
                setOcrText(data.text);
                setStep(2);
            } else {
                alert('Cant extract text.');
            }
        } catch (error) {
            console.error('OCR Error:', error);
            alert('Cant connect to server.');
        }
        setIsExtracting(false);
    };

    const handleAnalyze = async () => {
        if (!ocrText.trim()) return;
        setIsAnalyzing(true);
        try {
            const response = await fetch('http://localhost:8000/api/explain', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: ocrText }),
            });

            const data = await response.json();
            if (data.explanation) {
                setExplainedText(data.explanation);
                setStep(3);
            } else {
                alert('Cant explain text.');
            }
        } catch (error) {
            console.error('AI Error:', error);
            alert('Cant connect to server.');
        }
        setIsAnalyzing(false);
    };

    const handleReset = () => {
        setUploadedImage(null);
        setImagePreview(null);
        setOcrText('');
        setExplainedText('');
        setStep(1);
        setIsAnalyzing(false);
        setIsExtracting(false);
    };

    const renderSimpleMarkdown = (text) => {
        return text.split('\n').map((line, i) => {
            // Headers
            if (line.startsWith('### ')) {
                return <h4 key={i} className="re-md-h4">{line.replace('### ', '')}</h4>;
            }
            if (line.startsWith('## ')) {
                return <h3 key={i} className="re-md-h3">{line.replace('## ', '')}</h3>;
            }
            // List items
            if (line.match(/^\d+\.\s/)) {
                return <p key={i} className="re-md-list-item">{renderBold(line)}</p>;
            }
            if (line.startsWith('- ')) {
                return <p key={i} className="re-md-list-item re-md-bullet">{renderBold(line.replace('- ', ''))}</p>;
            }
            // Italic disclaimer
            if (line.startsWith('*') && line.endsWith('*')) {
                return <p key={i} className="re-md-disclaimer">{line.replace(/\*/g, '')}</p>;
            }
            // Empty lines
            if (line.trim() === '') {
                return <br key={i} />;
            }
            // Normal paragraphs
            return <p key={i} className="re-md-paragraph">{renderBold(line)}</p>;
        });
    };

    const renderBold = (text) => {
        const parts = text.split(/(\*\*[^*]+\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.replace(/\*\*/g, '')}</strong>;
            }
            return part;
        });
    };

    return (
        <div className="re-page">
            <ECareNavBar />

            <main className="re-main">
                {/* Hero Header */}
                <section className="re-hero">
                    <div className="re-hero-glow"></div>
                    <div className="re-hero-content">
                        <div className="re-hero-badge">
                            <span className="re-badge-dot"></span>
                            AI Powered Analysis
                        </div>
                        <h1>AI Report Explainer</h1>
                        <p>Upload your medical reports and get instant AI-powered explanations in simple, easy-to-understand language.</p>
                    </div>

                    {/* Steps Indicator */}
                    <div className="re-steps">
                        <div className={`re-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                            <div className="re-step-number">
                                {step > 1 ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                ) : '1'}
                            </div>
                            <span>Upload Report</span>
                        </div>
                        <div className="re-step-line"></div>
                        <div className={`re-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                            <div className="re-step-number">
                                {step > 2 ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                ) : '2'}
                            </div>
                            <span>Review Text</span>
                        </div>
                        <div className="re-step-line"></div>
                        <div className={`re-step ${step >= 3 ? 'active' : ''}`}>
                            <div className="re-step-number">3</div>
                            <span>AI Explanation</span>
                        </div>
                    </div>
                </section>

                {/* Main Content Area */}
                <section className="re-content">
                    <div className="re-content-grid">
                        {/* Left Panel — Upload & Image Preview */}
                        <div className="re-panel re-upload-panel">
                            <div className="re-panel-header">
                                <div className="re-panel-icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                                    </svg>
                                </div>
                                <h2>Medical Report</h2>
                            </div>

                            {!imagePreview ? (
                                <div
                                    className={`re-dropzone ${dragActive ? 'drag-active' : ''}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileInput}
                                        hidden
                                    />
                                    <div className="re-dropzone-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                                        </svg>
                                    </div>
                                    <h3>Drop your report image here</h3>
                                    <p>or click to browse files</p>
                                    <span className="re-dropzone-formats">Supports: JPEG, PNG, WebP, BMP</span>
                                </div>
                            ) : (
                                <div className="re-image-preview">
                                    <img src={imagePreview} alt="Uploaded report" />
                                    <div className="re-image-overlay">
                                        <button className="re-btn-change" onClick={() => fileInputRef.current?.click()}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                                            </svg>
                                            Change Image
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileInput}
                                            hidden
                                        />
                                    </div>
                                    {step === 1 && (
                                        <button className="re-btn-extract" onClick={handleExtractText} disabled={isExtracting}>
                                            {isExtracting ? (
                                                <>
                                                    <div className="re-spinner"></div>
                                                    Extracting Text...
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                                    </svg>
                                                    Extract Text from Image
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right Panel — OCR Text / Results */}
                        <div className="re-panel re-text-panel">
                            {step === 1 && !ocrText && (
                                <div className="re-empty-state">
                                    <div className="re-empty-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                                        </svg>
                                    </div>
                                    <h3>No Report Uploaded Yet</h3>
                                    <p>Upload a medical report image to begin. The AI will extract and analyze the text for you.</p>
                                </div>
                            )}

                            {(step === 2 || (step >= 2 && ocrText)) && (
                                <div className="re-ocr-section">
                                    <div className="re-panel-header">
                                        <div className="re-panel-icon re-panel-icon-teal">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                            </svg>
                                        </div>
                                        <h2>Extracted Text</h2>
                                        <span className="re-editable-badge">Editable</span>
                                    </div>
                                    <p className="re-ocr-hint">Review and edit the extracted text below. Make corrections if needed before analyzing.</p>
                                    <textarea
                                        className="re-ocr-textarea"
                                        value={ocrText}
                                        onChange={(e) => setOcrText(e.target.value)}
                                        placeholder="Extracted text will appear here..."
                                        rows={12}
                                    />
                                    <div className="re-ocr-actions">
                                        <button className="re-btn re-btn-secondary" onClick={handleReset}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0112 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                                            </svg>
                                            Start Over
                                        </button>
                                        <button
                                            className="re-btn re-btn-primary"
                                            onClick={handleAnalyze}
                                            disabled={isAnalyzing || !ocrText.trim()}
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <div className="re-spinner re-spinner-white"></div>
                                                    Analyzing...
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                                                    </svg>
                                                    Analyze with AI
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 3 && explainedText && (
                                <div className="re-results-section">
                                    <div className="re-panel-header">
                                        <div className="re-panel-icon re-panel-icon-green">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
                                            </svg>
                                        </div>
                                        <h2>AI Explanation</h2>
                                    </div>
                                    <div className="re-results-content">
                                        {renderSimpleMarkdown(explainedText)}
                                    </div>
                                    <div className="re-results-actions">
                                        <button className="re-btn re-btn-secondary" onClick={() => setStep(2)}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
                                            </svg>
                                            Edit Text & Re-analyze
                                        </button>
                                        <button className="re-btn re-btn-secondary" onClick={handleReset}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                                            </svg>
                                            Upload New Report
                                        </button>
                                        <button className="re-btn re-btn-outline" onClick={() => navigate('/eCare')}>
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                                            </svg>
                                            Back to eCare
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="re-footer">
                <div className="re-footer-content">
                    <p>&copy; 2026 NCC eCare - Narammala Channeling Center. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default ReportExplainer;
