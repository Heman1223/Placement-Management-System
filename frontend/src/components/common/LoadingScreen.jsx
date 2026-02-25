import React from 'react';

const LoadingScreen = ({ message = "SYNCING PLATFORM DATA..." }) => {
    return (
        <div className="min-h-screen bg-cream flex items-center justify-center p-8">
            <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 border-4 border-[var(--accent-gold)] border-t-[var(--primary-brown)] rounded-full animate-spin"></div>
                <p className="mt-4 text-[var(--primary-brown)] tracking-widest text-sm uppercase">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default LoadingScreen;
