import { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showClose = true
}) => {
    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal modal-${size} mx-4 md:mx-auto`}
                onClick={(e) => e.stopPropagation()}
            >
                {(title || showClose) && (
                    <div className="modal-header">
                        {title && <h2 className="modal-title text-base md:text-lg">{title}</h2>}
                        {showClose && (
                            <button className="modal-close" onClick={onClose}>
                                <X className="w-5 h-5 md:w-6 md:h-6" />
                            </button>
                        )}
                    </div>
                )}
                <div className="modal-body text-sm md:text-base">{children}</div>
            </div>
        </div>
    );
};

export default Modal;
