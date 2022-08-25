import React from 'react'

export default function AspectRatio({ children, aspectRatio }) {
    return <div style={{ width: '100%' }}>
        <div style={{ paddingTop: `${aspectRatio * 100 || 100}%`, width: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '0', left: '0', bottom: '0', right: '0' }}>
                {children}
            </div>
        </div>
    </div>
}