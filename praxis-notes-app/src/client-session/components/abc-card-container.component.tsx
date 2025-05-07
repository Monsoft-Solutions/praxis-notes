import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@ui/button.ui';

import { PlusCircle } from 'lucide-react';

import { v4 as uuidv4 } from 'uuid';

import { ABCCard } from './abc-card.component';

import { Card, CardContent, CardFooter } from '@ui/card.ui';

import { TourStepId } from '@shared/types/tour-step-id.type';
import { useCallback } from 'react';

const abcCardContainerId: TourStepId = 'session-form-abc-entry';

type ABCCardContainerProps = {
    clientId: string;
};

export function ABCCardContainer({ clientId }: ABCCardContainerProps) {
    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'abcIdEntries',
    });

    // Add a new empty ABC entry
    const handleAddEntry = useCallback(() => {
        append({
            id: uuidv4(),
            activityAntecedent: '',
            function: 'atention',
            behaviors: [],
            interventions: [],
            replacementPrograms: [],
        });
    }, [append]);

    return (
        <Card
            id={abcCardContainerId}
            className="sm:shadow-floating p-0 px-0 shadow-none sm:px-2 sm:py-4"
        >
            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {fields.map((field, index) => (
                    <ABCCard
                        key={field.id}
                        index={index}
                        clientId={clientId}
                        onRemove={
                            fields.length > 1
                                ? () => {
                                      remove(index);
                                  }
                                : undefined
                        }
                    />
                ))}
            </CardContent>
            <CardFooter className="relative flex flex-row items-center justify-center">
                <Button
                    type="button"
                    variant="default"
                    onClick={handleAddEntry}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add ABC Entry
                </Button>
            </CardFooter>
        </Card>
    );
}
