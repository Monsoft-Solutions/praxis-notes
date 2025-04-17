import { FormControl } from '@shared/ui/form.ui';

import {
    Select,
    SelectValue,
    SelectTrigger,
    SelectItem,
    SelectContent,
} from '@shared/ui/select.ui';

type AbcSelectorProps = {
    items: {
        id: string;
        name: string;
        isCustom: boolean;
    }[];
    onSelect: (id: string) => void;
};

export function AbcSelector({ items, onSelect }: AbcSelectorProps) {
    return (
        <Select onValueChange={onSelect}>
            <FormControl>
                <SelectTrigger>
                    <SelectValue placeholder="Select activity/antecedent" />
                </SelectTrigger>
            </FormControl>

            <SelectContent>
                {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                        {item.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
