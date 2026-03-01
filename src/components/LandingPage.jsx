import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, CheckCircle2, Star, ArrowRight, Check, Github, Linkedin, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';
import landingImg from '../assets/hero.png';

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 80,
                damping: 20
            }
        }
    };

    return (
        <div className="landing-page">
            <motion.main
                className="landing-hero"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <div className="landing-content">
                    <motion.div variants={itemVariants} className="landing-badge">
                        <Zap size={14} className="icon-zap" />
                        <span>AI-Powered Resume Engineering</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="landing-title">
                        Build a resume <br />
                        that gets you <br />
                        <span className="typing-container">
                            {typingText}
                            <span className="typing-cursor">|</span>
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="landing-subtitle">
                        Stop guessing what recruiters want. Our AI builds strategically optimized resumes that bypass ATS and win interviews.
                    </motion.p>

                    <motion.div variants={itemVariants} className="landing-actions">
                        <button className="btn btn-primary btn-landing" onClick={() => navigate('/builder')}>
                            Create my CV <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                        </button>
                    </motion.div>

                    <motion.div variants={itemVariants} className="landing-trust-badges" style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
                        <div className="trust-item" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                            <CheckCircle2 size={18} color="#60a5fa" /> ATS Optimized
                        </div>
                        <div className="trust-item" style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.8 }}>
                            <Star size={18} color="#f59e0b" fill="#f59e0b" /> Expert Approved
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    className="landing-graphic"
                    variants={itemVariants}
                    animate={{
                        y: [0, -20, 0],
                    }}
                    transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <div className="glass-card">
                        <img src={landingImg} alt="Resume Builder Preview" className="hero-img" />
                    </div>
                </motion.div>
            </motion.main>

            <footer className="landing-footer-simple">
                <div className="footer-container-simple">
                    <div className="footer-left">
                        <Zap size={20} fill="#60a5fa" color="#60a5fa" />
                        <span>resume.ai</span>
                    </div>

                    <div className="footer-right">
                        <p>Made by Abu Bakar Khawaja</p>
                        <div className="footer-social-links">
                            <a href="https://linkedin.com/in/abubakar-khawaja" target="_blank" rel="noopener noreferrer" title="LinkedIn">
                                <Linkedin size={18} />
                            </a>
                            <a href="https://github.com/abubakar-khawaja" target="_blank" rel="noopener noreferrer" title="GitHub">
                                <Github size={18} />
                            </a>

                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
