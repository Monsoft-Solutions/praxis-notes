import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@ui/button.ui';

import { PlusCircle } from 'lucide-react';

import { ABCCard } from './abc-card.component';

import { Card, CardContent, CardFooter } from '@ui/card.ui';

import { TourStepId } from '@shared/types/tour-step-id.type';
import { useCallback } from 'react';
import { ClientSessionForm } from '../schemas';

const abcCardContainerId: TourStepId = 'session-form-abc-entry';

type ABCCardContainerProps = {
    clientId: string;
};

export function ABCCardContainer({ clientId }: ABCCardContainerProps) {
    const { control, getValues, setValue } =
        useFormContext<ClientSessionForm>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'abcIdEntries',
    });

    // Add a new empty ABC entry
    const handleAddEntry = useCallback(() => {
        append({
            antecedentId: '',
            function: 'atention',
            behaviorIds: [],
            interventionIds: [],
        });
    }, [append]);

    // Handle removal of an ABC entry with updates to linked replacement programs
    const handleRemoveABC = useCallback(
        (index: number) => {
            // Get all replacement program entries
            const replacementPrograms = getValues('replacementProgramEntries');

            // Check each replacement program if it's linked to the ABC being removed
            replacementPrograms.forEach((_, rpIndex) => {
                const linkedIndex = getValues(
                    `replacementProgramEntries.${rpIndex}.linkedAbcEntryIndex`,
                );

                // If this replacement program is linked to the ABC being removed, reset the link
                if (linkedIndex === index) {
                    setValue(
                        `replacementProgramEntries.${rpIndex}.linkedAbcEntryIndex`,
                        null,
                    );
                }
                // If linked to an ABC with a higher index, decrement by 1 (since removing will shift indexes)
                else if (linkedIndex != null && linkedIndex > index) {
                    setValue(
                        `replacementProgramEntries.${rpIndex}.linkedAbcEntryIndex`,
                        linkedIndex - 1,
                    );
                }
            });

            // Remove the ABC entry
            remove(index);
        },
        [getValues, setValue, remove],
    );

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
                                      handleRemoveABC(index);
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
