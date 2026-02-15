'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin } from 'lucide-react';
import { GEOCODING_API_URL } from '@/lib/constants';

interface AddressSuggestion {
  label: string;
  postcode: string;
  city: string;
  context: string;
  score: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (address: string, postalCode: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = '12 Rue de la Paix, 75002 Paris',
  className = '',
  id,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const url = `${GEOCODING_API_URL}?q=${encodeURIComponent(query)}&limit=5&type=housenumber&citycode=75056`;
      const response = await fetch(url);
      if (!response.ok) return;

      const data = await response.json();
      const results: AddressSuggestion[] = (data.features || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (f: any) => ({
          label: f.properties.label,
          postcode: f.properties.postcode,
          city: f.properties.city,
          context: f.properties.context,
          score: f.properties.score,
        })
      );
      setSuggestions(results);
      setIsOpen(results.length > 0);
    } catch {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      const s = suggestions[activeIndex];
      onChange(s.label);
      onSelect(s.label, s.postcode);
      setIsOpen(false);
      setActiveIndex(-1);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setIsOpen(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <button
              key={s.label + idx}
              type="button"
              className={`w-full text-left px-3 py-2 text-sm flex items-start gap-2 hover:bg-blue-50 ${
                idx === activeIndex ? 'bg-blue-50' : ''
              }`}
              onClick={() => {
                onChange(s.label);
                onSelect(s.label, s.postcode);
                setIsOpen(false);
                setActiveIndex(-1);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
            >
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
              <span>{s.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
