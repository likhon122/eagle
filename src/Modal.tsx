import React, { useEffect } from 'react';

interface ModalProps {
  message: string;
  onClose: () => void;
  children?: React.ReactNode; // Optional `children` prop for flexible content
}

const Modal: React.FC<ModalProps> = ({ message, onClose, children }) => {
  useEffect(() => {
    // Automatically close the modal after 800 milliseconds
    const timer = setTimeout(() => {
      onClose();
    }, 800);

    // Clear the timer if the component unmounts before 800 milliseconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-lg p-4">
      <div className="bg-white bg-opacity-90 text-black p-4 rounded-lg shadow-lg text-center mx-2">
        <p>{message}</p>
        {/* Render `children` if passed */}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  );
};

export default Modal;
