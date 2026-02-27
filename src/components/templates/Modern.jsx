import React, { forwardRef } from 'react';

const Modern = forwardRef(({ data, activeSection }, ref) => {
    const getHighlightStyle = (sectionName) => {
        if (!activeSection) return {};
        return {
            backgroundColor: activeSection === sectionName ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
            borderRadius: '8px',
            transition: 'all 0.3s ease',
            margin: '-5px -10px',
            padding: '5px 10px',
            boxShadow: activeSection === sectionName ? '0 0 0 2px #3b82f6, 0 8px 20px rgba(59, 130, 246, 0.15)' : 'none',
            position: 'relative',
            zIndex: activeSection === sectionName ? 10 : 1,
        };
    };

    return (
        <div ref={ref} style={{ padding: '40px', color: '#111827', background: 'white' }}>
            <header style={{ ...getHighlightStyle('Header'), textAlign: 'center', marginBottom: '30px' }}>
                {data.personal.profilePicture && (
                    <img src={data.personal.profilePicture} alt="Profile" style={{ width: '100px', height: '100px', borderRadius: '50%', marginBottom: '15px', objectFit: 'cover', border: '3px solid #e5e7eb' }} />
                )}
                <h1 style={{ fontSize: '28px', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{data.personal.fullName || 'Your Name'}</h1>
                <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '10px' }}>{data.personal.jobTitle || 'Job Title'}</p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '14px', color: '#6b7280' }}>
                    <span>{data.personal.email}</span>
                    <span>{data.personal.phone}</span>
                    <span>{data.personal.location}</span>
                </div>
            </header>

            {data.summary && (
                <section style={{ ...getHighlightStyle('Summary'), marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '18px', borderBottom: '2px solid #e5e7eb', paddingBottom: '5px', marginBottom: '10px' }}>Professional Summary</h2>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{data.summary}</p>
                </section>
            )}

            {data.skills && (
                <section style={{ ...getHighlightStyle('Skills'), marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '18px', borderBottom: '2px solid #e5e7eb', paddingBottom: '5px', marginBottom: '10px' }}>Skills</h2>
                    <p style={{ fontSize: '14px' }}>{data.skills}</p>
                </section>
            )}

            <section style={{ ...getHighlightStyle('Experience'), marginBottom: '25px' }}>
                <h2 style={{ fontSize: '18px', borderBottom: '2px solid #e5e7eb', paddingBottom: '5px', marginBottom: '10px' }}>Experience</h2>
                {data.experience.map(exp => (
                    <div key={exp.id} style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                            <span>{exp.title}</span>
                            <span>{exp.duration}</span>
                        </div>
                        <div style={{ fontStyle: 'italic', marginBottom: '5px', color: '#4b5563' }}>{exp.company}</div>
                        <ul style={{ paddingLeft: '20px', margin: '0' }}>
                            {exp.bullets.map((b, i) => b && <li key={i} style={{ fontSize: '14px', marginBottom: '3px' }}>{b}</li>)}
                        </ul>
                    </div>
                ))}
            </section>

            {data.additionalDetails && data.additionalDetails.length > 0 && (
                <div style={getHighlightStyle('Additional Details')}>
                    {data.additionalDetails.map((detail, idx) => (
                        <section key={idx} style={{ marginBottom: '25px' }}>
                            <h2 style={{ fontSize: '18px', borderBottom: '2px solid #e5e7eb', paddingBottom: '5px', marginBottom: '10px' }}>{detail.title || 'Additional Details'}</h2>
                            <p style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{detail.content}</p>
                        </section>
                    ))}
                </div>
            )}

            {data.education.length > 0 && (
                <section style={getHighlightStyle('Education')}>
                    <h2 style={{ fontSize: '18px', borderBottom: '2px solid #e5e7eb', paddingBottom: '5px', marginBottom: '10px' }}>Education</h2>
                    {data.education.map(edu => (
                        <div key={edu.id} style={{ marginBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                <span>{edu.degree}</span>
                                <span>{edu.year}</span>
                            </div>
                            <div style={{ fontSize: '14px' }}>{edu.institution}</div>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
});

export default Modern;
