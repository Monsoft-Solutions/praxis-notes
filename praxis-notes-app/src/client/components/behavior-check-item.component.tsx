import { Checkbox } from '@ui/checkbox.ui';

import { cn } from '@css/utils';

import { Behavior } from '@src/behavior/schemas';
import { ClientFormBehavior } from '../schemas';

type BehaviorCheckItemProps = {
    behavior: Behavior & ClientFormBehavior;
    isChecked: boolean;
    onChange: (checked: boolean) => void;
};

export function BehaviorCheckItem({
    behavior,
    isChecked,
    onChange,
}: BehaviorCheckItemProps) {
    return (
        <label
            className={cn(
                'relative flex cursor-pointer items-center space-x-3 border-2 bg-white p-4',
                'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                'group focus-within:ring-2 focus-within:ring-blue-300 focus-within:ring-offset-1',
                isChecked
                    ? 'border-green-400 shadow-sm'
                    : 'border-blue-200 hover:border-blue-300 hover:bg-blue-50',
            )}
            style={{
                borderRadius: '15px 18px 14px 20px',
            }}
        >
            {/* Small decorative thumb tack for selected items */}
            {isChecked && (
                <div className="absolute -top-1.5 right-4 h-3 w-3 rotate-45 transform bg-green-400 shadow-sm"></div>
            )}

            <Checkbox
                checked={isChecked}
                onCheckedChange={onChange}
                className="mt-0.5"
            />

            <div className="flex-1">
                <div
                    className={cn(
                        'font-quicksand text-foreground font-semibold transition-colors duration-200',
                        isChecked && 'text-green-800',
                    )}
                    style={{
                        textShadow: '1px 1px 2px rgba(0,0,0,0.05)',
                    }}
                >
                    {behavior.name}
                </div>

                <div
                    className={cn(
                        'font-nunito text-sm transition-colors duration-200',
                        isChecked ? 'text-green-600' : 'text-muted-foreground',
                    )}
                >
                    <span className="font-medium">Baseline:</span>{' '}
                    {behavior.baseline}
                    <span className="mx-2">•</span>
                    <span className="capitalize">({behavior.type})</span>
                </div>
            </div>

            {/* Subtle hover indicator */}
            <div
                className={cn(
                    'h-2 w-2 rounded-full transition-all duration-200',
                    isChecked
                        ? 'bg-green-400 opacity-100'
                        : 'bg-blue-300 opacity-0 group-hover:opacity-60',
                )}
            />
        </label>
    );
}
