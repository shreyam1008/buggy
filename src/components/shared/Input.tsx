import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref) => {
    return (
      <div className="input-group">
        {label && <label className="label">{label}</label>}
        <div className="input-wrapper">
          {icon && <div className="input-icon">{icon}</div>}
          <input
            ref={ref}
            className={`input ${error ? 'input-error' : ''} ${icon ? 'input-with-icon' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <span className="input-error-text">{error}</span>}
        {helperText && !error && <span className="input-helper-text">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
