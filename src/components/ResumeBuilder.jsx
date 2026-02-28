import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Link, useBlocker } from 'react-router-dom';
import axios from 'axios';
import html2canvas from 'html2canvas';
import { Plus, Trash2, Wand2, Download, Image as ImageIcon, ChevronLeft, ChevronRight, Zap, ZoomIn, FileText, Check, X, Layout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Modern from './templates/Modern';
import Sidebar from './templates/Sidebar';
import Executive from './templates/Executive';

const API_BASE = (import.meta.env.VITE_API_URL || 'https://resume-ai-backend-mu.vercel.app/api').replace(/\/$/, '');
const SECTIONS = ['Header', 'Education', 'Skills', 'Experience', 'Additional Details', 'Summary'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = Array.from({ length: 50 }, (_, i) => (new Date().getFullYear() - i).toString());

function ResumeBuilder() {
    const [currentSection, setCurrentSection] = useState(0);
    const [resumeTemplate, setResumeTemplate] = useState('modern');
    const [zoom, setZoom] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [loading, setLoading] = useState({});
    const [skillInput, setSkillInput] = useState('');
    const [visitedSections, setVisitedSections] = useState(new Set([0]));

    const [data, setData] = useState({
        personal: {
            firstName: '',
            surname: '',
            fullName: '',
            jobTitle: '',
            cityState: '',
            postalCode: '',
            country: '',
            phone: '',
            email: '',
            profilePicture: null
        },
        summary: '',
        skills: [],
        additionalDetails: [
            { id: Date.now(), title: '', content: '' }
        ],
        experience: [
            { id: Date.now(), title: '', company: '', startMonth: '', startYear: '', endMonth: '', endYear: '', isPresent: false, bullets: [''] }
        ],
        education: [
            { id: Date.now() + 1, degree: '', institution: '', startYear: '', endYear: '' }
        ]
    });

    const resumeRef = useRef();
    const printRef = useRef();

    const handleDownloadPDF = async () => {
        const element = printRef.current;
        const wrapper = element.parentElement;

        // Show off-screen at A4 width
        wrapper.style.display = 'block';
        wrapper.style.position = 'absolute';
        wrapper.style.left = '-9999px';
        wrapper.style.top = '0';
        wrapper.style.width = '794px';

        element.style.width = '794px';
        element.style.minHeight = '0';
        element.style.maxHeight = 'none';
        element.style.overflow = 'visible';
        element.style.transform = 'none';

        // Force layout
        void element.offsetHeight;

        // Measure content
        const contentHeight = element.scrollHeight;
        const a4HeightPx = 1123;

        // Scale down if needed
        if (contentHeight > a4HeightPx) {
            const scale = a4HeightPx / contentHeight;
            element.style.transform = `scale(${scale})`;
            element.style.transformOrigin = 'top left';
            void element.offsetHeight;
        }

        // Ensure template fills exact A4 height (no gap at bottom)
        element.style.minHeight = `${a4HeightPx}px`;
        element.style.maxHeight = `${a4HeightPx}px`;
        element.style.overflow = 'hidden';

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                letterRendering: true,
                width: 794,
                height: a4HeightPx,
                windowWidth: 794
            });

            const { jsPDF } = await import('jspdf');
            const pdf = new jsPDF('portrait', 'mm', 'a4');
            const imgData = canvas.toDataURL('image/jpeg', 0.98);
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
            pdf.save(`${data.personal.firstName || 'Resume'}_${data.personal.surname || ''}.pdf`);
        } catch (err) {
            console.error('PDF generation error:', err);
        }

        // Cleanup
        wrapper.style.display = 'none';
        wrapper.style.position = '';
        wrapper.style.left = '';
        wrapper.style.top = '';
        wrapper.style.width = '';
        element.style.width = '';
        element.style.minHeight = '';
        element.style.maxHeight = '';
        element.style.overflow = '';
        element.style.transform = '';
        element.style.transformOrigin = '';
    };

    const updatePersonal = (field, value) => {
        setData(prev => {
            const newPersonal = { ...prev.personal, [field]: value };
            if (field === 'firstName' || field === 'surname') {
                newPersonal.fullName = `${newPersonal.firstName} ${newPersonal.surname}`.trim();
            }
            return { ...prev, personal: newPersonal };
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updatePersonal('profilePicture', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const updateExperience = (id, field, value) => {
        setData(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
        }));
    };

    const updateBullet = (expId, bulletIdx, value) => {
        setData(prev => ({
            ...prev,
            experience: prev.experience.map(exp => exp.id === expId ? {
                ...exp,
                bullets: exp.bullets.map((b, i) => i === bulletIdx ? value : b)
            } : exp)
        }));
    };

    const improveBullet = async (expId, bulletIdx) => {
        const bulletText = data.experience.find(e => e.id === expId).bullets[bulletIdx];
        if (!bulletText) return;

        const key = `bullet-${expId}-${bulletIdx}`;
        setLoading(prev => ({ ...prev, [key]: true }));
        try {
            const res = await axios.post(`${API_BASE}/rewrite`, {
                text: bulletText,
                context: `Experience bullet point for a ${data.personal.jobTitle} position`
            });
            updateBullet(expId, bulletIdx, res.data.rewritten);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const improveDetail = async (detailId) => {
        const detail = data.additionalDetails.find(d => d.id === detailId);
        if (!detail || !detail.content.trim()) return;

        const key = `detail-${detailId}`;
        setLoading(prev => ({ ...prev, [key]: true }));
        try {
            const res = await axios.post(`${API_BASE}/rewrite`, {
                text: detail.content,
                context: `Additional resume detail for ${detail.title || 'personal information'}`
            });
            setData(prev => ({
                ...prev,
                additionalDetails: prev.additionalDetails.map(d =>
                    d.id === detailId ? { ...d, content: res.data.rewritten } : d
                )
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(prev => ({ ...prev, [key]: false }));
        }
    };

    const generateSummary = async () => {
        if (!data.personal.jobTitle) return;
        setLoading(prev => ({ ...prev, summary: true }));
        try {
            const expSummary = data.experience
                .map(exp => `${exp.title} at ${exp.company}: ${exp.bullets.join(', ')}`)
                .join('; ');

            const res = await axios.post(`${API_BASE}/ai/generate`, {
                role: data.personal.jobTitle,
                skills: data.skills.join(', '),
                experience: expSummary || "No experience listed yet"
            });

            setData(prev => ({ ...prev, summary: res.data.summary }));
        } catch (err) {
            console.error('Summary generation failed:', err);
        } finally {
            setLoading(prev => ({ ...prev, summary: false }));
        }
    };

    const addSkill = () => {
        const input = skillInput.trim();
        if (!input) return;

        const newSkills = input.split(',')
            .map(s => s.trim())
            .filter(s => s && !data.skills.includes(s));

        if (newSkills.length > 0) {
            setData(prev => ({ ...prev, skills: [...prev.skills, ...newSkills] }));
        }
        setSkillInput('');
    };

    const removeSkill = (skillToRemove) => {
        setData(prev => ({
            ...prev,
            skills: prev.skills.filter(s => s !== skillToRemove)
        }));
    };

    const nextSection = () => {
        if (currentSection < SECTIONS.length - 1) setCurrentSection(prev => prev + 1);
    };

    const prevSection = () => {
        if (currentSection > 0) setCurrentSection(prev => prev - 1);
    };

    const defaults = {
        personal: {
            fullName: 'ALEENA ABIDI',
            jobTitle: 'Senior Software Engineer',
            email: 'aleena.abidi@example.com',
            phone: '+92 300 1234567',
            location: 'Islamabad, Pakistan',
            profilePicture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150'
        },
        summary: 'Innovative Software Engineer with 5+ years of experience in building scalable web applications. Expert in React, Node.js, and cloud architecture with a passion for clean code and user-centric design.',
        skills: 'React.js, Node.js, TypeScript, AWS, Docker, GraphQL, Tailwind CSS, System Design',
        experience: [
            { id: 1, title: 'Senior Developer', company: 'TechFlow Solutions', duration: '2021 - Present', bullets: ['Architected a high-traffic microservices platform reducing latency by 40%', 'Led a team of 6 engineers to deliver a flagship SaaS product on time'] },
            { id: 2, title: 'Full Stack Engineer', company: 'DataSystems Inc.', duration: '2018 - 2021', bullets: ['Developed responsive UI components using React and Redux', 'Implemented automated CI/CD pipelines increasing deployment frequency'] }
        ],
        education: [
            { id: 1, degree: 'MS in Computer Science', institution: 'National University', year: '2018' },
            { id: 2, degree: 'BS in Software Engineering', institution: 'City University', year: '2016' }
        ],
        additionalDetails: [
            { id: 1, title: 'Certifications', content: 'AWS Certified Solutions Architect, Google Cloud Professional' },
            { id: 2, title: 'Languages', content: 'English (Professional), Urdu (Native)' }
        ]
    };

    const templateData = {
        personal: (data.personal.firstName || data.personal.surname || data.personal.profilePicture) ? {
            ...data.personal,
            location: [data.personal.cityState, data.personal.postalCode, data.personal.country].filter(Boolean).join(', ')
        } : defaults.personal,
        summary: data.summary || defaults.summary,
        skills: data.skills.length > 0 ? data.skills.join(', ') : defaults.skills,
        additionalDetails: data.additionalDetails.filter(ad => ad.title || ad.content),
        experience: (data.experience.length > 0 && data.experience[0].title) ? data.experience.map(exp => {
            const start = `${exp.startMonth} ${exp.startYear}`.trim();
            const end = exp.isPresent ? 'Present' : `${exp.endMonth} ${exp.endYear}`.trim();
            return {
                ...exp,
                duration: (start || end) ? `${start}${start && end ? ' - ' : ''}${end}` : ''
            };
        }) : defaults.experience,
        education: (data.education.length > 0 && data.education[0].degree) ? data.education.map(edu => {
            const start = edu.startYear;
            const end = edu.endYear;
            return {
                ...edu,
                year: (start || end) ? `${start}${start && end ? ' - ' : ''}${end}` : ''
            };
        }) : defaults.education
    };

    useEffect(() => {
        setVisitedSections(prev => {
            const next = new Set(prev);
            next.add(currentSection);
            return next;
        });
    }, [currentSection]);

    // Consistently check if there's any unsaved data
    const hasUnsavedData = () => {
        const { personal, summary, skills, experience, education } = data;
        return (
            (personal.firstName || '').trim() !== '' ||
            (personal.surname || '').trim() !== '' ||
            (summary || '').trim() !== '' ||
            (skills && skills.length > 0) ||
            (experience && experience.some(exp => (exp.title || '').trim() !== '' || (exp.company || '').trim() !== '')) ||
            (education && education.some(edu => (edu.degree || '').trim() !== '' || (edu.institution || '').trim() !== ''))
        );
    };

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedData()) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [data]);

    // Handle internal navigation (SPA routing)
    const blocker = useBlocker(
        ({ currentValue, nextLocation }) => {
            const isDirty = hasUnsavedData();
            console.log('Navigation attempt from', currentValue.pathname, 'to', nextLocation.pathname, 'isDirty:', isDirty);
            return isDirty && currentValue.pathname !== nextLocation.pathname;
        }
    );

    useEffect(() => {
        console.log('Blocker state changed:', blocker.state);
        if (blocker.state === "blocked") {
            const proceed = window.confirm("All your progress will be lost. Are you sure you want to leave?");
            if (proceed) {
                blocker.proceed();
            } else {
                blocker.reset();
            }
        }
    }, [blocker.state]);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const formPanel = document.querySelector('.form-panel');
        if (formPanel) {
            formPanel.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [currentSection]);

    const [previewScale, setPreviewScale] = useState(0.33);

    const handleHomeNavigation = (e) => {
        if (hasUnsavedData()) {
            const proceed = window.confirm("All your progress will be lost. Are you sure you want to leave?");
            if (!proceed) {
                e.preventDefault();
            }
        }
    };

    useEffect(() => {
        const updateScale = () => {
            const width = window.innerWidth;
            if (width <= 1024) {
                setPreviewScale(Math.min(0.4, (width - 40) / 210 / 4.5));
            } else {
                setPreviewScale(280 / 794);
            }
        };
        window.addEventListener('resize', updateScale);
        updateScale();
        return () => window.removeEventListener('resize', updateScale);
    }, []);

    useLayoutEffect(() => {
        const el = resumeRef.current;
        if (!el) return;
        el.style.zoom = '1';
        void el.offsetHeight;
        const natural = el.scrollHeight;
        const target = 1123;
        if (natural > target) {
            el.style.zoom = `${Math.max(0.55, target / natural)}`;
        } else {
            el.style.zoom = '1';
        }
    }, [data, resumeTemplate]);

    const isSectionComplete = (idx) => {
        switch (idx) {
            case 0: return !!(data.personal.firstName && data.personal.surname && data.personal.email);
            case 1: return data.education.length > 0 && !!(data.education[0].degree && data.education[0].institution);
            case 2: return data.skills.length > 0;
            case 3: return data.experience.length > 0 && !!(data.experience[0].title && data.experience[0].company);
            case 4: return data.additionalDetails.some(ad => ad.title.trim() || ad.content.trim()) || visitedSections.has(idx);
            case 5: return !!data.summary.trim();
            default: return false;
        }
    };

    const isStepDisabled = (idx) => {
        if (idx === 0) return false;
        return !isSectionComplete(idx - 1);
    };

    const Template = { modern: Modern, sidebar: Sidebar, executive: Executive }[resumeTemplate];

    return (
        <div className="app-container">
            <div style={{ display: 'none' }}>
                <Template data={templateData} ref={printRef} />
            </div>

            <div className="app-sidebar no-print">
                <a href="/" className="sidebar-logo" title="Back to Home" onClick={handleHomeNavigation}>
                    <div className="logo-icon-wrapper">
                        <FileText size={32} />
                    </div>
                    <span className="logo-text">Home</span>
                </a>
                <div className="steps-container">
                    {SECTIONS.map((label, idx) => {
                        const complete = isSectionComplete(idx);
                        const disabled = isStepDisabled(idx) && idx > currentSection;

                        return (
                            <div
                                key={idx}
                                className={`step-item ${currentSection === idx ? 'active' : ''} ${complete ? 'complete' : ''} ${disabled ? 'disabled' : ''}`}
                                onClick={() => !disabled && setCurrentSection(idx)}
                                style={{ cursor: disabled ? 'default' : 'pointer' }}
                            >
                                <div className="step-circle">
                                    {complete ? <Check size={16} /> : idx + 1}
                                </div>
                                <div className="step-label">{label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="form-panel no-print">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection}
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -20, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentSection === 0 && (
                            <div className="form-section active">
                                <div className="instruction-header">
                                    <h1>Header and Contact Details</h1>
                                    <p>Include your full name and multiple ways for employers to reach you.</p>
                                </div>

                                <div className="upload-container">
                                    <div className="image-dropzone" onClick={() => document.getElementById('pic').click()}>
                                        {data.personal.profilePicture ? (
                                            <img src={data.personal.profilePicture} alt="Profile" />
                                        ) : (
                                            <ImageIcon size={32} color="#94a3b8" />
                                        )}
                                    </div>
                                    <div>
                                        <input type="file" id="pic" hidden onChange={handleImageUpload} accept="image/*" />
                                        <button className="btn btn-secondary" onClick={() => document.getElementById('pic').click()}>
                                            <Plus size={16} /> Upload photo
                                        </button>
                                    </div>
                                </div>

                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input value={data.personal.firstName} onChange={e => updatePersonal('firstName', e.target.value)} placeholder="e.g. Abu Bakar" />
                                    </div>
                                    <div className="form-group">
                                        <label>Surname</label>
                                        <input value={data.personal.surname} onChange={e => updatePersonal('surname', e.target.value)} placeholder="e.g. Khawaja" />
                                    </div>
                                    <div className="form-group">
                                        <label>Job Title</label>
                                        <input value={data.personal.jobTitle} onChange={e => updatePersonal('jobTitle', e.target.value)} placeholder="e.g. Software Engineer" />
                                    </div>
                                    <div className="form-group">
                                        <label>City - State</label>
                                        <input value={data.personal.cityState} onChange={e => updatePersonal('cityState', e.target.value)} placeholder="e.g. Bangkok" />
                                    </div>
                                    <div className="form-group">
                                        <label>Postal Code</label>
                                        <input value={data.personal.postalCode} onChange={e => updatePersonal('postalCode', e.target.value)} placeholder="e.g. 47671" />
                                    </div>
                                    <div className="form-group">
                                        <label>Country</label>
                                        <input value={data.personal.country} onChange={e => updatePersonal('country', e.target.value)} placeholder="e.g. Thailand" />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input value={data.personal.phone} onChange={e => updatePersonal('phone', e.target.value)} placeholder="+66 123 456789" />
                                    </div>
                                    <div className="form-group">
                                        <label>Email*</label>
                                        <input value={data.personal.email} onChange={e => updatePersonal('email', e.target.value)} placeholder="someone@abc.com" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentSection === 1 && (
                            <div className="form-section active">
                                <div className="instruction-header">
                                    <h1>Education and Training</h1>
                                    <p>List your degrees, diplomas, and any certifications you've earned.</p>
                                </div>
                                {data.education.map(edu => (
                                    <div key={edu.id} className="dynamic-item" style={{ border: '1px solid #e2e8f0', padding: '2rem', borderRadius: '12px', marginBottom: '2rem' }}>
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Degree</label>
                                                <input value={edu.degree} onChange={e => setData(prev => ({ ...prev, education: prev.education.map(ed => ed.id === edu.id ? { ...ed, degree: e.target.value } : ed) }))} />
                                            </div>
                                            <div className="form-group">
                                                <label>Institution</label>
                                                <input value={edu.institution} onChange={e => setData(prev => ({ ...prev, education: prev.education.map(ed => ed.id === edu.id ? { ...ed, institution: e.target.value } : ed) }))} />
                                            </div>
                                            <div className="form-group">
                                                <label>Start Year</label>
                                                <select
                                                    value={edu.startYear}
                                                    onChange={e => setData(prev => ({ ...prev, education: prev.education.map(ed => ed.id === edu.id ? { ...ed, startYear: e.target.value } : ed) }))}
                                                >
                                                    <option value="">Year</option>
                                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>End Year</label>
                                                <select
                                                    value={edu.endYear}
                                                    onChange={e => setData(prev => ({ ...prev, education: prev.education.map(ed => ed.id === edu.id ? { ...ed, endYear: e.target.value } : ed) }))}
                                                >
                                                    <option value="">Year</option>
                                                    <option value="Present">Present</option>
                                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button className="btn btn-secondary btn-full" onClick={() => setData(prev => ({ ...prev, education: [...prev.education, { id: Date.now(), degree: '', institution: '', startYear: '', endYear: '' }] }))}>
                                    <Plus size={16} /> Add another degree
                                </button>
                            </div>
                        )}

                        {currentSection === 2 && (
                            <div className="form-section active">
                                <div className="instruction-header">
                                    <h1>Professional Skills</h1>
                                    <p>List your key technical and soft skills to stand out.</p>
                                </div>
                                <div className="form-group full-width">
                                    <label>Add Skill</label>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                        <input
                                            value={skillInput}
                                            onChange={e => setSkillInput(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && addSkill()}
                                            placeholder="e.g. React"
                                            style={{ flex: 1 }}
                                        />
                                        <button className="btn btn-ai" onClick={addSkill} style={{ height: '44px' }}>
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                        {data.skills.map((skill, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    background: '#eff6ff',
                                                    color: '#2563eb',
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '50px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    border: '1px solid #dbeafe'
                                                }}
                                            >
                                                {skill}
                                                <X
                                                    size={14}
                                                    style={{ cursor: 'pointer' }}
                                                    onClick={() => removeSkill(skill)}
                                                />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentSection === 3 && (
                            <div className="form-section active">
                                <div className="instruction-header">
                                    <h1>Work Experience</h1>
                                    <p>Start with your most recent job and work backwards.</p>
                                </div>
                                {data.experience.map(exp => (
                                    <div key={exp.id} className="dynamic-item" style={{ border: '1px solid #e2e8f0', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', position: 'relative' }}>
                                        {data.experience.length > 1 && (
                                            <button
                                                className="btn btn-danger btn-icon"
                                                onClick={() => setData(prev => ({ ...prev, experience: prev.experience.filter(e => e.id !== exp.id) }))}
                                                style={{ position: 'absolute', top: '1rem', right: '1rem' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        <div className="form-grid">
                                            <div className="form-group">
                                                <label>Title</label>
                                                <input value={exp.title} onChange={e => updateExperience(exp.id, 'title', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Company</label>
                                                <input value={exp.company} onChange={e => updateExperience(exp.id, 'company', e.target.value)} />
                                            </div>
                                            <div className="form-group">
                                                <label>Start Date</label>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <select
                                                        value={exp.startMonth}
                                                        onChange={e => updateExperience(exp.id, 'startMonth', e.target.value)}
                                                        style={{ flex: 1 }}
                                                    >
                                                        <option value="">Month</option>
                                                        {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                    </select>
                                                    <select
                                                        value={exp.startYear}
                                                        onChange={e => updateExperience(exp.id, 'startYear', e.target.value)}
                                                        style={{ flex: 1 }}
                                                    >
                                                        <option value="">Year</option>
                                                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label>End Date</label>
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    {!exp.isPresent ? (
                                                        <>
                                                            <select
                                                                value={exp.endMonth}
                                                                onChange={e => updateExperience(exp.id, 'endMonth', e.target.value)}
                                                                style={{ flex: 1 }}
                                                            >
                                                                <option value="">Month</option>
                                                                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                            </select>
                                                            <select
                                                                value={exp.endYear}
                                                                onChange={e => updateExperience(exp.id, 'endYear', e.target.value)}
                                                                style={{ flex: 1 }}
                                                            >
                                                                <option value="">Year</option>
                                                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                            </select>
                                                        </>
                                                    ) : (
                                                        <div style={{ flex: 2, padding: '0.75rem', color: 'var(--text-light)', fontStyle: 'italic' }}>Present</div>
                                                    )}
                                                </div>
                                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', cursor: 'pointer', fontWeight: 'normal' }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={exp.isPresent}
                                                        onChange={e => updateExperience(exp.id, 'isPresent', e.target.checked)}
                                                        style={{ width: 'auto' }}
                                                    />
                                                    Currently working here
                                                </label>
                                            </div>
                                        </div>
                                        <label>Responsibilities</label>
                                        {exp.bullets.map((bullet, idx) => (
                                            <div key={idx} style={{ marginBottom: '1.5rem' }}>
                                                <textarea value={bullet} onChange={e => updateBullet(exp.id, idx, e.target.value)} rows={2} />
                                                <button className="btn btn-ai" onClick={() => improveBullet(exp.id, idx)} disabled={loading[`bullet-${exp.id}-${idx}`]} style={{ marginTop: '0.5rem' }}>
                                                    <Zap size={14} fill="currentColor" /> {loading[`bullet-${exp.id}-${idx}`] ? 'Optimizing...' : 'Improve with AI'}
                                                </button>
                                            </div>
                                        ))}
                                        <button className="btn btn-ghost" onClick={() => setData(prev => ({ ...prev, experience: prev.experience.map(e => e.id === exp.id ? { ...e, bullets: [...e.bullets, ''] } : e) }))}>
                                            <Plus size={16} /> Add point
                                        </button>
                                    </div>
                                ))}
                                <button className="btn btn-secondary btn-full" onClick={() => setData(prev => ({ ...prev, experience: [...prev.experience, { id: Date.now(), title: '', company: '', startMonth: '', startYear: '', endMonth: '', endYear: '', isPresent: false, bullets: [''] }] }))}>
                                    <Plus size={16} /> Add another experience
                                </button>
                            </div>
                        )}

                        {currentSection === 4 && (
                            <div className="form-section active">
                                <div className="instruction-header">
                                    <h1>Additional Details</h1>
                                    <p>Add languages, certifications, or other relevant sections.</p>
                                </div>

                                {data.additionalDetails.map((detail, idx) => (
                                    <div key={detail.id} className="dynamic-item" style={{ border: '1px solid #e2e8f0', padding: '2rem', borderRadius: '12px', marginBottom: '2rem', position: 'relative' }}>
                                        {data.additionalDetails.length > 1 && (
                                            <button
                                                className="btn btn-danger btn-icon"
                                                onClick={() => setData(prev => ({ ...prev, additionalDetails: prev.additionalDetails.filter(d => d.id !== detail.id) }))}
                                                style={{ position: 'absolute', top: '1rem', right: '1rem' }}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                        <div className="form-group full-width" style={{ marginBottom: '1.5rem' }}>
                                            <label>Heading</label>
                                            <input
                                                value={detail.title}
                                                onChange={e => setData(prev => ({
                                                    ...prev,
                                                    additionalDetails: prev.additionalDetails.map(d => d.id === detail.id ? { ...d, title: e.target.value } : d)
                                                }))}
                                                placeholder="e.g. Certifications, Languages, Hobbies"
                                            />
                                        </div>
                                        <div className="form-group full-width">
                                            <label>Description</label>
                                            <textarea
                                                value={detail.content}
                                                onChange={e => setData(prev => ({
                                                    ...prev,
                                                    additionalDetails: prev.additionalDetails.map(d => d.id === detail.id ? { ...d, content: e.target.value } : d)
                                                }))}
                                                rows={4}
                                                placeholder="Enter details here..."
                                            />
                                            <button className="btn btn-ai" onClick={() => improveDetail(detail.id)} disabled={loading[`detail-${detail.id}`]} style={{ marginTop: '0.5rem' }}>
                                                <Zap size={14} fill="currentColor" /> {loading[`detail-${detail.id}`] ? 'Optimizing...' : 'Improve with AI'}
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    className="btn btn-secondary btn-full"
                                    onClick={() => setData(prev => ({
                                        ...prev,
                                        additionalDetails: [...prev.additionalDetails, { id: Date.now(), title: '', content: '' }]
                                    }))}
                                >
                                    <Plus size={16} /> Add another section
                                </button>
                            </div>
                        )}

                        {currentSection === 5 && (
                            <div className="form-section active">
                                <div className="instruction-header">
                                    <h1>Professional Summary</h1>
                                    <p>Write a brief summary that highlights your key strengths and career goals.</p>
                                </div>
                                <div className="form-group full-width">
                                    <label>Professional Summary</label>
                                    <textarea value={data.summary} onChange={e => setData(prev => ({ ...prev, summary: e.target.value }))} rows={8} placeholder="Driven professional with specialization in..." />
                                    <button className="btn btn-ai" onClick={generateSummary} disabled={loading.summary || !data.personal.jobTitle} style={{ marginTop: '0.5rem' }}>
                                        <Zap size={14} fill="currentColor" /> {loading.summary ? 'Generating...' : 'Generate with AI'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="button-footer">
                            <button className="btn btn-ghost" onClick={prevSection} style={{ visibility: currentSection > 0 ? 'visible' : 'hidden' }}>
                                <ChevronLeft size={20} /> Back
                            </button>
                            {currentSection === 0 && (
                                <a href="/" className="btn btn-ghost btn-back-home" onClick={handleHomeNavigation}>
                                    <ChevronLeft size={20} /> Back up to Home
                                </a>
                            )}
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {currentSection === SECTIONS.length - 1 && (
                                    <button className="btn btn-success btn-continue" onClick={handleDownloadPDF}>
                                        <Download size={20} /> Download PDF
                                    </button>
                                )}
                                <button className="btn btn-primary btn-continue" onClick={nextSection} style={{ display: currentSection === SECTIONS.length - 1 ? 'none' : 'flex' }}>
                                    Continue <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="preview-panel">
                <div className="resume-wrapper" onClick={() => setZoom(true)}>
                    <div className="resume-container" style={{ transform: `scale(${previewScale})` }}>
                        <Template data={templateData} ref={resumeRef} activeSection={SECTIONS[currentSection]} />
                    </div>
                </div>

                <button className="btn btn-ghost" onClick={() => setShowTemplateModal(true)} style={{ marginTop: '0.5rem' }}>
                    <Layout size={14} style={{ marginRight: '5px' }} /> Change Template
                </button>

                <button className="floating-zoom-btn no-print" onClick={() => setZoom(true)}>
                    <ZoomIn size={28} />
                </button>
            </div>

            <AnimatePresence>
                {showTemplateModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowTemplateModal(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button className="btn btn-ghost btn-icon close-modal" onClick={() => setShowTemplateModal(false)}>
                                <X size={20} />
                            </button>

                            <div className="modal-header">
                                <h2>Select a Template</h2>
                                <p>Choose a professional design that fits your career path.</p>
                            </div>

                            <div className="template-grid">
                                {[
                                    { id: 'modern', name: 'Modern', Component: Modern },
                                    { id: 'sidebar', name: 'Sidebar', Component: Sidebar },
                                    { id: 'executive', name: 'Executive', Component: Executive }
                                ].map((t) => (
                                    <div
                                        key={t.id}
                                        className={`template-card ${resumeTemplate === t.id ? 'active' : ''}`}
                                    >
                                        <div className="template-preview-box" style={{ overflow: 'hidden', position: 'relative' }}>
                                            <div style={{
                                                transform: 'scale(0.2)',
                                                transformOrigin: 'top left',
                                                width: '500%',
                                                height: '500%',
                                                pointerEvents: 'none',
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                textAlign: 'left'
                                            }}>
                                                <t.Component data={defaults} />
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: 'bold', fontSize: '18px' }}>{t.name}</div>
                                        <button
                                            className={`btn btn-full ${resumeTemplate === t.id ? 'btn-secondary' : 'btn-primary'}`}
                                            onClick={() => {
                                                setResumeTemplate(t.id);
                                                setShowTemplateModal(false);
                                            }}
                                        >
                                            {resumeTemplate === t.id ? 'Current Template' : 'Use this template'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {zoom && (
                    <motion.div
                        className="zoom-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setZoom(false)}
                    >
                        <motion.div
                            className="zoom-content"
                            initial={{ scale: 0.8, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 50 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Template data={templateData} activeSection={SECTIONS[currentSection]} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default ResumeBuilder;
