import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import type { ToolCategory as ToolCategoryType, ToolDefinition } from './defaultCategories';
import { categoryIcons } from './icons';
import { ToolButton } from './ToolButton';

interface ToolCategoryProps {
  category: ToolCategoryType;
  activeTool: string | null;
  isOpen: boolean;
  onToggle: (categoryId: string) => void;
  onToolSelect: (tool: ToolDefinition) => void;
}

export const ToolCategoryComponent: React.FC<ToolCategoryProps> = ({
  category,
  activeTool,
  isOpen,
  onToggle,
  onToolSelect,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  const Icon = categoryIcons[category.id];
  const hasActiveTool = category.tools.some((t) => t.name === activeTool);

  // Position the popover relative to the button using fixed positioning
  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPopoverPos({
      top: rect.top,
      left: rect.right + 4,
    });
  }, []);

  // Update position when opened
  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  // Close popover on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        popoverRef.current && !popoverRef.current.contains(target) &&
        btnRef.current && !btnRef.current.contains(target)
      ) {
        onToggle(category.id);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onToggle, category.id]);

  return (
    <>
      <button
        ref={btnRef}
        className={`klc-toolbar-icon ${hasActiveTool ? 'klc-toolbar-icon--active' : ''} ${isOpen ? 'klc-toolbar-icon--open' : ''}`}
        title={category.label}
        onClick={() => onToggle(category.id)}
      >
        {Icon ? <Icon size={18} /> : <span>{category.label[0]}</span>}
        <ChevronRight size={8} className="klc-toolbar-chevron" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          className="klc-toolbar-popover"
          style={{ position: 'fixed', top: popoverPos.top, left: popoverPos.left }}
        >
          <div className="klc-toolbar-popover-title">{category.label}</div>
          {category.tools.map((tool) => (
            <ToolButton
              key={tool.name}
              tool={tool}
              isActive={activeTool === tool.name}
              onClick={(t) => {
                onToolSelect(t);
                onToggle(category.id);
              }}
            />
          ))}
        </div>
      )}
    </>
  );
};
