import React, { forwardRef } from 'react';

const Executive = forwardRef(({ data, activeSection }, ref) => {
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
        <div ref={ref} style={{ padding: '40px', color: '#1a1a1a', background: 'white', borderTop: '8px solid #000' }}>
            <header style={{ ...getHighlightStyle('Header'), marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '36px', fontWeight: '900', borderBottom: '2px solid #000', paddingBottom: '10px', textTransform: 'uppercase' }}>{data.personal.fullName || 'Name'}</h1>
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '20px', fontSize: '13px', color: '#444', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <div style={{ color: '#000' }}>{data.personal.jobTitle}</div>
                        <div>{data.personal.email}</div>
                        <div>{data.personal.phone}</div>
                        <div>{data.personal.location}</div>
                    </div>
                </div>
                {data.personal.profilePicture && (
                    <img src={data.personal.profilePicture} alt="Profile" style={{ width: '120px', height: '120px', marginLeft: '30px', objectFit: 'cover', border: '1px solid #000' }} />
                )}
            </header>

            {data.summary && (
                <section style={{ ...getHighlightStyle('Summary'), marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900', color: '#000', marginBottom: '15px' }}>Executive Profile</h2>
                    <p style={{ fontSize: '15px', lineHeight: '1.7' }}>{data.summary}</p>
                </section>
            )}

            {data.skills && (
                <section style={{ ...getHighlightStyle('Skills'), marginBottom: '35px' }}>
                    <h2 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900', color: '#000', marginBottom: '15px' }}>Core Proficiencies</h2>
                    <p style={{ fontSize: '14px', lineHeight: '1.6' }}>{data.skills}</p>
                </section>
            )}

            <section style={{ ...getHighlightStyle('Experience'), marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900', color: '#000', marginBottom: '15px' }}>Professional Milestones</h2>
                {data.experience.map(exp => (
                    <div key={exp.id} style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-baseline', marginBottom: '5px' }}>
                            <div style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>{exp.company}</div>
                            <div style={{ fontSize: '13px', color: '#666', fontWeight: 'bold' }}>{exp.duration}</div>
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#333', marginBottom: '5px', fontStyle: 'italic' }}>{exp.title}</div>
                        <ul style={{ paddingLeft: '15px', margin: '0' }}>
                            {exp.bullets.map((b, i) => b && <li key={i} style={{ fontSize: '14px', marginBottom: '4px', lineHeight: '1.5' }}>{b}</li>)}
                        </ul>
                    </div>
                ))}
            </section>

            {data.additionalDetails && data.additionalDetails.length > 0 && (
                <div style={getHighlightStyle('Additional Details')}>
                    {data.additionalDetails.map((detail, idx) => (
                        <section key={idx} style={{ marginBottom: '15px' }}>
                            <h2 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900', color: '#000', marginBottom: '8px' }}>{detail.title || 'Additional Information'}</h2>
                            <p style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{detail.content}</p>
                        </section>
                    ))}
                </div>
            )}

            {data.education.length > 0 && (
                <section style={getHighlightStyle('Education')}>
                    <h2 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '900', color: '#000', marginBottom: '8px' }}>Academic Foundations</h2>
                    {data.education.map(edu => (
                        <div key={edu.id} style={{ marginBottom: '8px' }}>
                            <div style={{ fontWeight: '900', fontSize: '16px', textTransform: 'uppercase' }}>{edu.institution}</div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{edu.degree} | {edu.year}</div>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
});

export default Executive;
