import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@ui/button.ui';

import { PlusCircle } from 'lucide-react';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@ui/card.ui';
import { ReplacementProgramCard } from './replacement-program-card.component';

export function ReplacementProgramCardContainer() {
    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'replacementProgramEntries',
    });

    // Add a new empty replacement program entry
    const handleAddEntry = () => {
        append({
            replacementProgramId: '',
            teachingProcedureId: '',
            promptingProcedureId: '',
            clientResponse: 'expected',
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Replacement Program Data</CardTitle>

                <CardDescription>
                    Record Replacement Program data for the session.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {fields.map((field, index) => (
                    <ReplacementProgramCard
                        key={field.id}
                        index={index}
                        onRemove={
                            fields.length > 1
                                ? () => {
                                      remove(index);
                                  }
                                : undefined
                        }
                    />
                ))}

                <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddEntry}
                    className="mt-4 w-full"
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Replacement Program Entry
                </Button>
            </CardContent>
        </Card>
    );
}
