import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from './Button.jsx';

export const EmptyState = ({
  icon: Icon = Sparkles,
  title = 'No items found',
  description = 'There is nothing to display right now.',
  actionLabel,
  onAction
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 sm:p-12 bg-white rounded-2xl border border-orbit-border shadow-warm-sm my-4">
      <div className="w-14 h-14 rounded-2xl bg-orbit-soft flex items-center justify-center text-orbit-primary mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-orbit-text mb-1">{title}</h3>
      <p className="text-sm text-orbit-textMuted max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
