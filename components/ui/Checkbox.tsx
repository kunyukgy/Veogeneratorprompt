import React, { forwardRef, InputHTMLAttributes } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, name, ...props }, ref) => {
    return (
      <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
        <input
          type="checkbox"
          name={name}
          ref={ref}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          {...props}
        />
        <span className="ml-2">{label}</span>
      </label>
    );
  }
);
Checkbox.displayName = 'Checkbox';
