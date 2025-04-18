import { FormControl } from '@shared/ui/form.ui';

import {
    Select,
    SelectValue,
    SelectTrigger,
    SelectItem,
    SelectContent,
} from '@shared/ui/select.ui';

import MultipleSelector from '@shared/ui/select-multiple';

type AbcSelectorProps = {
    placeholder?: string;
    items: {
        id: string;
        name: string;
        isCustom: boolean;
    }[];
} & (
    | {
          multiple: true;
          onSelect: (ids: string[]) => void;
      }
    | {
          multiple?: false;
          onSelect: (id: string) => void;
      }
);

export function AbcSelector({
    placeholder,
    items,
    onSelect,
    multiple,
}: AbcSelectorProps) {
    return multiple ? (
        <MultipleSelector
            defaultOptions={items.map((item) => ({
                value: item.id,
                label: item.name,
            }))}
            placeholder={placeholder}
            emptyIndicator={
                <p className="text-center text-lg leading-10 text-gray-600 dark:text-gray-400">
                    no results found.
                </p>
            }
            onChange={(items) => {
                onSelect(items.map(({ value }) => value));
            }}
        />
    ) : (
        <Select
            onValueChange={(value) => {
                onSelect(value);
            }}
        >
            <FormControl>
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
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
