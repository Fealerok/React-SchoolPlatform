import React, { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
  options: Array<{
    id: number,
    full_name: string
  }>;
  value: string;
  onChange: (value: {id: number, full_name: string}) => void;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedValue, setSelectedValue] = useState<string>(value);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрытие dropdown при клике вне его области
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (value: {id: number, full_name: string}) => {
    setSelectedValue(value.full_name);
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Основной элемент dropdown */}
      <div
        className="transition-colors duration-150 border-2 border-#DCDBDF rounded-[15px] h-[50px] text-left pl-[10px] pr-[40px] outline-none text-xl text-gray-400 flex items-center cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValue}
        {/* Стрелочка (без поворота) */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {/* Выпадающий список */}
      {isOpen && (
        <div className="absolute w-full bg-white border border-#DCDBDF rounded-[15px] shadow-lg max-h-[100px] overflow-y-auto z-10">
          {options.map((option) => (
            <div
              key={option.id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect({id: option.id, full_name: option.full_name})}
            >
              {option.full_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;