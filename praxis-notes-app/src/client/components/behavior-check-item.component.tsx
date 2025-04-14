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
                'flex cursor-pointer items-center space-x-2 rounded-md border p-3 transition-colors',
                isChecked
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50',
            )}
        >
            <Checkbox
                checked={isChecked}
                onCheckedChange={onChange}
                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />

            <div className="flex-1">
                <div className="font-medium">{behavior.name}</div>

                <div className="text-muted-foreground text-xs">
                    Baseline: {behavior.baseline} ({behavior.type})
                </div>
            </div>
        </label>
    );
}
