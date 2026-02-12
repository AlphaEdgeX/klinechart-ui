import React from 'react';
import type { ToolDefinition } from './defaultCategories';
import { toolIcons } from './icons';

interface ToolButtonProps {
  tool: ToolDefinition;
  isActive: boolean;
  onClick: (tool: ToolDefinition) => void;
}

export const ToolButton: React.FC<ToolButtonProps> = ({
  tool,
  isActive,
  onClick,
}) => {
  const Icon = toolIcons[tool.name];

  return (
    <button
      className={`klc-tool-btn ${isActive ? 'klc-tool-btn--active' : ''}`}
      title={tool.label}
      onClick={() => onClick(tool)}
    >
      {Icon && <Icon size={16} className="klc-tool-btn-icon" />}
      <span>{tool.label}</span>
    </button>
  );
};
