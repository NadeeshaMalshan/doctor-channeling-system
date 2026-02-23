import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ECareNavBar from '../Components/eCareNavBar';
import './css/smartDocSuggestion.css';

const SYMPTOM_QUESTIONS = [
    { id: 'headache', label: 'Do you have a headache or migraine?', icon: '🧠' },
    { id: 'chest_pain', label: 'Do you experience chest pain or discomfort?', icon: '❤️' },
    { id: 'cough', label: 'Do you have a persistent cough or breathing difficulty?', icon: '🫁' },
    { id: 'stomach', label: 'Do you have stomach pain, nausea, or vomiting?', icon: '🤢' },
    { id: 'skin', label: 'Do you have skin rashes, itching, or irritation?', icon: '🩹' },
    { id: 'joint', label: 'Do you have joint pain or body aches?', icon: '🦴' },
    { id: 'fever', label: 'Do you have a fever or chills?', icon: '🌡️' },
    { id: 'fatigue', label: 'Do you feel excessive tiredness or fatigue?', icon: '😴' },
    { id: 'vision', label: 'Do you have blurry vision or eye problems?', icon: '👁️' },
    { id: 'anxiety', label: 'Do you experience anxiety, stress, or depression?', icon: '🧘' },
];

const SmartDocSuggestion = () => {
    const navigate = useNavigate();
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('');
    const [answers, setAnswers] = useState({});
    const [step, setStep] = useState(1); // 1: info, 2: symptoms, 3: results
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState(null);

    const handleAnswer = (symptomId, value) => {
        setAnswers(prev => ({ ...prev, [symptomId]: value }));
    };

    const allAnswered = Object.keys(answers).length === SYMPTOM_QUESTIONS.length;

    const handleSubmitInfo = () => {
        if (!age || !gender) return;
        setStep(2);
    };

    const handleSubmitSymptoms = async () => {
        if (!allAnswered) return;
        setIsLoading(true);

        try {
            // Get selected symptoms
            const selectedSymptoms = SYMPTOM_QUESTIONS
                .filter(q => answers[q.id] === 'yes')
                .map(q => q.label.replace(/Do you have |Do you experience |Do you feel /g, '').replace('?', ''));

            const symptomText = selectedSymptoms.length > 0
                ? selectedSymptoms.join(', ')
                : 'general health checkup';

            // Call doctor suggestion API
            const specialization = detectSpecialization(selectedSymptoms);
            const response = await fetch(`http://localhost:8000/api/suggest-doctor?specialization=${specialization}`);
            const data = await response.json();

            setResults({
                symptoms: selectedSymptoms,
                specialization: specialization,
                doctors: data.doctors || [],
                age: age,
                gender: gender
            });
            setStep(3);
        } catch (error) {
            console.error('Error:', error);
            alert('Cant connect to server.');
        }
        setIsLoading(false);
    };

    const detectSpecialization = (symptoms) => {
        const text = symptoms.join(' ').toLowerCase();
        if (text.includes('headache') || text.includes('migraine')) return 'Neurology';
        if (text.includes('chest') || text.includes('heart')) return 'Cardiology';
        if (text.includes('cough') || text.includes('breathing')) return 'Pulmonology';
        if (text.includes('stomach') || text.includes('nausea') || text.includes('vomiting')) return 'Gastroenterology';
        if (text.includes('skin') || text.includes('rash') || text.includes('itching')) return 'Dermatology';
        if (text.includes('joint') || text.includes('body ache')) return 'Orthopedics';
        if (text.includes('vision') || text.includes('eye')) return 'Ophthalmology';
        if (text.includes('anxiety') || text.includes('stress') || text.includes('depression')) return 'Psychiatry';
        if (text.includes('fatigue') || text.includes('tiredness')) return 'Endocrinology';
        if (text.includes('fever')) return 'General';
        return 'General';
    };

    const handleReset = () => {
        setAge('');
        setGender('');
        setAnswers({});
        setStep(1);
        setResults(null);
        setIsLoading(false);
    };

    return (
        <div className="sds-page">
            <ECareNavBar />

            <main className="sds-main">
                {/* Hero */}
                <section className="sds-hero">
                    <div className="sds-hero-glow"></div>
                    <div className="sds-hero-content">
                        <div className="sds-hero-badge">
                            <span className="sds-badge-dot"></span>
                            AI Smart Suggestion
                        </div>
                        <h1>Smart Doctor Suggestion</h1>
                        <p>Answer a few questions about your symptoms and we'll suggest the right specialist for you.</p>
                    </div>

                    {/* Steps */}
                    <div className="sds-steps">
                        <div className={`sds-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
                            <div className="sds-step-number">{step > 1 ? '✓' : '1'}</div>
                            <span>Your Info</span>
                        </div>
                        <div className="sds-step-line"></div>
                        <div className={`sds-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
                            <div className="sds-step-number">{step > 2 ? '✓' : '2'}</div>
                            <span>Symptoms</span>
                        </div>
                        <div className="sds-step-line"></div>
                        <div className={`sds-step ${step >= 3 ? 'active' : ''}`}>
                            <div className="sds-step-number">3</div>
                            <span>Results</span>
                        </div>
                    </div>
                </section>

                {/* Content */}
                <section className="sds-content">

                    {/* Step 1: Patient Info */}
                    {step === 1 && (
                        <div className="sds-card sds-info-card">
                            <div className="sds-card-header">
                                <div className="sds-card-icon">👤</div>
                                <h2>Patient Information</h2>
                            </div>
                            <div className="sds-card-body">
                                <div className="sds-form-group">
                                    <label>Age</label>
                                    <input
                                        type="number"
                                        className="sds-input"
                                        placeholder="Enter your age"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        min="1"
                                        max="120"
                                    />
                                </div>
                                <div className="sds-form-group">
                                    <label>Gender</label>
                                    <div className="sds-gender-options">
                                        {['Male', 'Female', 'Other'].map(g => (
                                            <button
                                                key={g}
                                                className={`sds-gender-btn ${gender === g ? 'active' : ''}`}
                                                onClick={() => setGender(g)}
                                            >
                                                {g === 'Male' ? '👨' : g === 'Female' ? '👩' : '🧑'} {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    className="sds-btn sds-btn-primary"
                                    onClick={handleSubmitInfo}
                                    disabled={!age || !gender}
                                >
                                    Continue to Symptoms →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Symptom Questions */}
                    {step === 2 && (
                        <div className="sds-card sds-symptoms-card">
                            <div className="sds-card-header">
                                <div className="sds-card-icon">🩺</div>
                                <h2>Symptom Assessment</h2>
                                <span className="sds-progress-badge">
                                    {Object.keys(answers).length}/{SYMPTOM_QUESTIONS.length}
                                </span>
                            </div>
                            <div className="sds-card-body">
                                <p className="sds-hint">Please answer Yes or No for each symptom below:</p>
                                <div className="sds-questions-list">
                                    {SYMPTOM_QUESTIONS.map((q, index) => (
                                        <div key={q.id} className={`sds-question ${answers[q.id] ? 'answered' : ''}`}>
                                            <div className="sds-question-left">
                                                <span className="sds-question-num">{index + 1}</span>
                                                <span className="sds-question-icon">{q.icon}</span>
                                                <span className="sds-question-text">{q.label}</span>
                                            </div>
                                            <div className="sds-radio-group">
                                                <label className={`sds-radio ${answers[q.id] === 'yes' ? 'sds-radio-yes' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name={q.id}
                                                        value="yes"
                                                        checked={answers[q.id] === 'yes'}
                                                        onChange={() => handleAnswer(q.id, 'yes')}
                                                    />
                                                    <span className="sds-radio-label">Yes</span>
                                                </label>
                                                <label className={`sds-radio ${answers[q.id] === 'no' ? 'sds-radio-no' : ''}`}>
                                                    <input
                                                        type="radio"
                                                        name={q.id}
                                                        value="no"
                                                        checked={answers[q.id] === 'no'}
                                                        onChange={() => handleAnswer(q.id, 'no')}
                                                    />
                                                    <span className="sds-radio-label">No</span>
                                                </label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="sds-actions">
                                    <button className="sds-btn sds-btn-secondary" onClick={() => setStep(1)}>
                                        ← Back
                                    </button>
                                    <button
                                        className="sds-btn sds-btn-primary"
                                        onClick={handleSubmitSymptoms}
                                        disabled={!allAnswered || isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="sds-spinner"></div>
                                                Finding Doctor...
                                            </>
                                        ) : (
                                            'Find My Doctor →'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Results */}
                    {step === 3 && results && (
                        <div className="sds-card sds-results-card">
                            <div className="sds-card-header">
                                <div className="sds-card-icon">✅</div>
                                <h2>Recommendation</h2>
                            </div>
                            <div className="sds-card-body">
                                {/* Summary */}
                                <div className="sds-result-summary">
                                    <div className="sds-result-item">
                                        <span className="sds-result-label">Age</span>
                                        <span className="sds-result-value">{results.age}</span>
                                    </div>
                                    <div className="sds-result-item">
                                        <span className="sds-result-label">Gender</span>
                                        <span className="sds-result-value">{results.gender}</span>
                                    </div>
                                    <div className="sds-result-item sds-result-highlight">
                                        <span className="sds-result-label">Recommended Specialist</span>
                                        <span className="sds-result-value">{results.specialization}</span>
                                    </div>
                                </div>

                                {/* Symptoms */}
                                {results.symptoms.length > 0 && (
                                    <div className="sds-symptoms-summary">
                                        <h3>Your Symptoms</h3>
                                        <div className="sds-symptom-tags">
                                            {results.symptoms.map((s, i) => (
                                                <span key={i} className="sds-symptom-tag">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Doctors */}
                                <div className="sds-doctors-section">
                                    <h3>Available Doctors</h3>
                                    {results.doctors.length > 0 ? (
                                        <div className="sds-doctors-list">
                                            {results.doctors.map(doc => (
                                                <div key={doc.id} className="sds-doctor-card">
                                                    <div className="sds-doctor-avatar">👨‍⚕️</div>
                                                    <div className="sds-doctor-info">
                                                        <h4>{doc.name}</h4>
                                                        <p className="sds-doctor-spec">{doc.specialization}</p>
                                                        {doc.hospital && <p className="sds-doctor-hospital">🏥 {doc.hospital}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="sds-no-doctors">
                                            <p>No doctors found for {results.specialization}. Please visit a general physician.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="sds-disclaimer">
                                    ⚕️ This is an AI-based suggestion and not a professional medical diagnosis. Please consult a qualified doctor for proper examination.
                                </div>

                                <div className="sds-actions">
                                    <button className="sds-btn sds-btn-secondary" onClick={handleReset}>
                                        Start Over
                                    </button>
                                    <button className="sds-btn sds-btn-outline" onClick={() => navigate('/eCare')}>
                                        ← Back to eCare
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </section>
            </main>

            <footer className="sds-footer">
                <p>&copy; 2026 NCC eCare - Narammala Channeling Center. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default SmartDocSuggestion;
