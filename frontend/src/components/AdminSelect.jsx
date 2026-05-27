import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function AdminSelect({ label, value, options, onChange, className = '' }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);
  const selected = options.find(opt => opt.value === value) || options[0];

  useEffect(() => {
    function close(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return <div className={`admin-select-field ${className}`} ref={boxRef}>
    {label && <label>{label}</label>}
    <button type="button" className={open ? 'admin-select-trigger open' : 'admin-select-trigger'} onClick={() => setOpen(v => !v)}>
      <span>{selected?.label || selected?.value}</span>
      <ChevronDown size={16}/>
    </button>
    {open && <div className="admin-select-menu">
      {options.map(opt => <button
        type="button"
        key={opt.value}
        className={opt.value === value ? 'selected' : ''}
        onClick={() => {
          onChange(opt.value);
          setOpen(false);
        }}
      >
        {opt.label}
      </button>)}
    </div>}
  </div>;
}
