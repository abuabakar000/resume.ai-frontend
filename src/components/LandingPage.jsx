import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import landingImg from '../assets/landing.png';

function LandingPage() {
    const navigate = useNavigate();
    const [typingText, setTypingText] = useState('');
    const [wordIdx, setWordIdx] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    const words = ["hired faster", "get noticed", "shortlisted", "next-level"];

    useEffect(() => {
        const speed = isDeleting ? 50 : 150;
        const currentWord = words[wordIdx];

        const timer = setTimeout(() => {
            if (!isDeleting) {
                setTypingText(currentWord.substring(0, typingText.length + 1));
                if (typingText.length === currentWord.length) {
                    setTimeout(() => setIsDeleting(true), 2000);
                }
            } else {
                setTypingText(currentWord.substring(0, typingText.length - 1));
                if (typingText.length === 0) {
                    setIsDeleting(false);
                    setWordIdx((wordIdx + 1) % words.length);
                }
            }
        }, speed);

        return () => clearTimeout(timer);
    }, [typingText, isDeleting, wordIdx]);

    return (
        <div className="landing-page">
            <main className="landing-hero">
                <div className="landing-content">
                    <div className="landing-badge">
                        <Zap size={14} className="icon-zap" />
                        <span>100% Free Resume Builder</span>
                    </div>
                    <h1 className="landing-title">
                        This AI resume builder gets you <br />
                        <span className="typing-container">
                            {typingText}
                            <span className="typing-cursor">|</span>
                        </span>
                    </h1>
                    <p className="landing-subtitle">
                        Hiring runs on AI. We engineer resumes to win.
                        <br />
                        Build a strategically optimized resume in minutes.
                    </p>

                    <div className="landing-actions">
                        <button className="btn btn-primary btn-landing" onClick={() => navigate('/builder')}>
                            Create my CV
                        </button>
                    </div>


                </div>

                <div className="landing-graphic">
                    <img src={landingImg} alt="Resume Builder" className="hero-img" />
                </div>
            </main>
        </div>
    );
}

export default LandingPage;
