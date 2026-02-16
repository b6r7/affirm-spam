import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Copy, Edit2, Archive, Trash2 } from 'lucide-react';

interface EllipsisMenuProps {
  isBaseTemplate: boolean;
  /** When false, Delete template is disabled (e.g. no selection or busy). When true, delete is allowed. */
  canDeleteTemplate?: boolean;
  onDuplicate: () => void;
  onRename: () => void;
  onMarkDeprecated: () => void;
  onDeleteTemplate: () => void;
}

const MENU_ITEMS = [
  { id: 'duplicate', icon: Copy, label: 'Duplicate template', subtext: 'Create a copy for experimentation' },
  { id: 'rename', icon: Edit2, label: 'Rename template' },
  { id: 'deprecated', icon: Archive, label: 'Mark as deprecated' },
  { id: 'delete', icon: Trash2, label: 'Delete template' },
] as const;

export function EllipsisMenu({
  isBaseTemplate,
  canDeleteTemplate = true,
  onDuplicate,
  onRename,
  onMarkDeprecated,
  onDeleteTemplate,
}: EllipsisMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      const first = listRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])');
      first?.focus();
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const runAction = (id: string) => {
    switch (id) {
      case 'duplicate': onDuplicate(); break;
      case 'rename': onRename(); break;
      case 'deprecated': onMarkDeprecated(); break;
      case 'delete': onDeleteTemplate(); break;
      default: break;
    }
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowDown' && index < MENU_ITEMS.length - 1) {
      e.preventDefault();
      setFocusedIndex(index + 1);
      const next = listRef.current?.children[index + 1] as HTMLElement | undefined;
      next?.focus();
    } else if (e.key === 'ArrowUp' && index > 0) {
      e.preventDefault();
      setFocusedIndex(index - 1);
      const prev = listRef.current?.children[index - 1] as HTMLElement | undefined;
      prev?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const item = MENU_ITEMS[index];
      const disabled = item.id === 'delete' && !canDeleteTemplate;
      if (!disabled) runAction(item.id);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setFocusedIndex(0); }}
        className="p-1"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--muted-foreground)',
          cursor: 'pointer',
          borderRadius: 'var(--radius-sm)',
        }}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <MoreHorizontal size={20} />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          role="menu"
          className="absolute top-full right-0 mt-2 border"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
            borderRadius: 'var(--radius)',
            width: '240px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 50,
            overflow: 'hidden',
          }}
        >
          {MENU_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const disabled = item.id === 'delete' && !canDeleteTemplate;
            const tooltip = item.id === 'delete' && !canDeleteTemplate ? 'Select a template to delete' : undefined;
            return (
              <React.Fragment key={item.id}>
                {item.id === 'delete' && (
                  <div className="my-1" style={{ height: 1, backgroundColor: 'var(--border)' }} />
                )}
                <MenuItem
                  icon={<Icon size={14} />}
                  label={item.label}
                  subtext={item.subtext}
                  disabled={disabled}
                  tooltip={tooltip}
                  onClick={() => !disabled && runAction(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  tabIndex={focusedIndex === index ? 0 : -1}
                  role="menuitem"
                />
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  subtext?: string;
  disabled?: boolean;
  tooltip?: string;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  tabIndex?: number;
  role?: string;
}

function MenuItem({ icon, label, subtext, disabled, tooltip, onClick, onKeyDown, tabIndex, role }: MenuItemProps) {
  return (
    <button
      type="button"
      role={role}
      tabIndex={tabIndex}
      onClick={onClick}
      onKeyDown={onKeyDown}
      disabled={disabled}
      title={tooltip}
      className="w-full px-3 py-2.5 flex items-start gap-3 text-left"
      style={{
        backgroundColor: 'transparent',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div 
        style={{ 
          color: 'var(--muted-foreground)',
          marginTop: '2px',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div className="flex-1">
        <div
          style={{
            fontFamily: 'Calibre, sans-serif',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--foreground)',
            marginBottom: subtext ? '2px' : 0,
          }}
        >
          {label}
        </div>
        {subtext && (
          <div
            style={{
              fontFamily: 'Calibre, sans-serif',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-foreground)',
            }}
          >
            {subtext}
          </div>
        )}
      </div>
    </button>
  );
}
