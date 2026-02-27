import React, { forwardRef } from 'react';

const Sidebar = forwardRef(({ data, activeSection }, ref) => {
    const getHighlightStyle = (sectionName) => {
        if (!activeSection) return {};
        return {
            backgroundColor: activeSection === sectionName ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            margin: '-10px',
            padding: '10px',
            boxShadow: activeSection === sectionName ? '0 0 0 2px #3b82f6, 0 8px 20px rgba(59, 130, 246, 0.15)' : 'none',
            position: 'relative',
            zIndex: activeSection === sectionName ? 10 : 1,
        };
    };

    return (
        <div ref={ref} style={{
            display: 'flex',
            minHeight: '1123px',
            color: '#111827',
            background: '#1e293b',
            alignItems: 'stretch'
        }}>
            {/* Left Sidebar */}
            <div style={{ width: '32%', color: 'white', padding: '50px 25px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                <div style={getHighlightStyle('Header')}>
                    {data.personal.profilePicture && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '45px' }}>
                            <img src={data.personal.profilePicture} alt="Profile" style={{ width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '6px solid rgba(255,255,255,0.1)' }} />
                        </div>
                    )}

                    <section style={{ marginBottom: '45px' }}>
                        <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '8px', marginBottom: '15px', fontWeight: 'bold' }}>Contact</h3>
                        <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '14px', color: 'rgba(255,255,255,0.9)' }}>
                            <div style={{ wordBreak: 'break-word' }}>{data.personal.email}</div>
                            <div>{data.personal.phone}</div>
                            <div>{data.personal.location}</div>
                        </div>
                    </section>
                </div>

                {data.education && data.education.length > 0 && (
                    <section style={{ ...getHighlightStyle('Education'), marginBottom: '45px' }}>
                        <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '8px', marginBottom: '15px', fontWeight: 'bold' }}>Education</h3>
                        {data.education.map(edu => (
                            <div key={edu.id} style={{ marginBottom: '20px' }}>
                                <div style={{ fontWeight: '800', fontSize: '14px', marginBottom: '4px' }}>{edu.degree}</div>
                                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>{edu.institution}</div>
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>{edu.year}</div>
                            </div>
                        ))}
                    </section>
                )}

                {data.skills && (
                    <section style={{ ...getHighlightStyle('Skills'), marginBottom: '45px' }}>
                        <h3 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '2px solid rgba(255,255,255,0.2)', paddingBottom: '8px', marginBottom: '15px', fontWeight: 'bold' }}>Skills</h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {data.skills.split(',').map((s, i) => (
                                <span key={i} style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>• {s.trim()}</span>
                            ))}
                        </div>
                    </section>
                )}

                <div style={{ flex: 1 }}></div>
            </div>

            {/* Right Panel */}
            <div style={{ width: '68%', padding: '60px 50px', background: 'white', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                <header style={{ ...getHighlightStyle('Header'), marginBottom: '55px' }}>
                    <h1 style={{ fontSize: `${Math.min(48, Math.max(24, 600 / (data.personal.fullName || 'Name').length))}px`, fontWeight: '900', textTransform: 'uppercase', marginBottom: '8px', color: '#111827', letterSpacing: '1px', lineHeight: '1.1' }}>
                        {data.personal.fullName || 'Name'}
                    </h1>
                    <div style={{ display: 'inline-block' }}>
                        <p style={{ fontSize: '20px', color: '#3b82f6', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '2px', marginBottom: '15px' }}>
                            {data.personal.jobTitle || 'Job Title'}
                        </p>
                        <div style={{ height: '5px', background: '#3b82f6', width: '100%', minWidth: '200px' }}></div>
                    </div>
                </header>

                {data.summary && (
                    <section style={{ ...getHighlightStyle('Summary'), marginBottom: '55px' }}>
                        <h2 style={{ fontSize: '22px', textTransform: 'uppercase', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '20px', fontWeight: '800', letterSpacing: '1px' }}>Profile</h2>
                        <p style={{ fontSize: '16px', lineHeight: '1.8', color: '#374151' }}>{data.summary}</p>
                    </section>
                )}

                <section style={{ ...getHighlightStyle('Experience'), marginBottom: '55px' }}>
                    <h2 style={{ fontSize: '22px', textTransform: 'uppercase', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '30px', fontWeight: '800', letterSpacing: '1px' }}>Work Experience</h2>
                    <div style={{ position: 'relative', paddingLeft: '35px' }}>
                        <div style={{ position: 'absolute', left: '7px', top: '8px', bottom: '30px', width: '2px', background: '#e2e8f0' }}></div>
                        {data.experience.map(exp => (
                            <div key={exp.id} style={{ marginBottom: '45px', position: 'relative' }}>
                                <div style={{ position: 'absolute', left: '-32px', top: '8px', width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6', border: '4px solid white', boxShadow: '0 0 0 2px #e2e8f0' }}></div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'baseline' }}>
                                    <span style={{ fontWeight: '900', fontSize: '19px', color: '#111827' }}>{exp.title}</span>
                                    <span style={{ fontSize: '14px', color: '#64748b', fontWeight: '600' }}>{exp.duration}</span>
                                </div>
                                <div style={{ fontStyle: 'italic', color: '#3b82f6', marginBottom: '15px', fontSize: '16px', fontWeight: '700' }}>{exp.company}</div>
                                <ul style={{ paddingLeft: '0', listStyleType: 'none', margin: '0' }}>
                                    {exp.bullets.map((b, i) => b && (
                                        <li key={i} style={{ fontSize: '15px', marginBottom: '10px', lineHeight: '1.7', color: '#4b5563', position: 'relative', paddingLeft: '25px' }}>
                                            <span style={{ position: 'absolute', left: '0', color: '#3b82f6', fontWeight: 'bold' }}>•</span>
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {data.additionalDetails && data.additionalDetails.length > 0 && (
                    <section style={getHighlightStyle('Additional Details')}>
                        <div style={{ display: 'grid', gridTemplateColumns: data.additionalDetails.length > 1 ? '1fr 1fr' : '1fr', gap: '50px' }}>
                            {data.additionalDetails.map((detail, idx) => (
                                <div key={idx}>
                                    <h2 style={{ fontSize: '18px', textTransform: 'uppercase', color: '#1e293b', borderBottom: '2px solid #f1f5f9', paddingBottom: '12px', marginBottom: '15px', fontWeight: '800', letterSpacing: '1px' }}>{detail.title || 'Additional Info'}</h2>
                                    <p style={{ fontSize: '15px', lineHeight: '1.7', color: '#374151', whiteSpace: 'pre-wrap' }}>{detail.content}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
});

export default Sidebar;
