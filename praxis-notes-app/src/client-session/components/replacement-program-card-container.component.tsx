import { useState } from 'react';

import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@ui/button.ui';

import { PlusCircle } from 'lucide-react';

import { Switch } from '@shared/ui/switch.ui';
import { Label } from '@shared/ui/label.ui';

import { Card, CardContent, CardHeader, CardFooter } from '@ui/card.ui';

import { ReplacementProgramCard } from './replacement-program-card.component';

import { TourStepId } from '@shared/types/tour-step-id.type';

const replacementProgramCardContainerId: TourStepId =
    'session-form-replacement-program';

export function ReplacementProgramCardContainer() {
    const [isDetailedView, setIsDetailedView] = useState(false);
    const { control } = useFormContext();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'replacementProgramEntries',
    });

    // Add a new empty replacement program entry
    const handleAddEntry = () => {
        append({
            replacementProgramId: undefined,
            teachingProcedureId: null,
            promptingProcedureId: null,
            clientResponse: null,
            progress: null,
            promptTypesIds: [],
        });
    };

    return (
        <Card
            id={replacementProgramCardContainerId}
            className="sm:shadow-floating p-0 px-0 shadow-none sm:px-2 sm:py-4 md:px-4"
        >
            <CardHeader className="flex flex-row items-center justify-end pb-8">
                <div className="sm:flow-row mt-0 flex items-center justify-end gap-2 space-y-0 pt-2 sm:pb-0 sm:pt-0">
                    <Label htmlFor="detailed-view" className="text-sm">
                        Show Details
                    </Label>
                    <Switch
                        id="detailed-view"
                        checked={isDetailedView}
                        onCheckedChange={setIsDetailedView}
                    />
                </div>
            </CardHeader>

            <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {fields.map((field, index) => (
                    <ReplacementProgramCard
                        key={field.id}
                        index={index}
                        isDetailedView={isDetailedView}
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
                    Add Replacement
                </Button>
            </CardFooter>
        </Card>
    );
}
