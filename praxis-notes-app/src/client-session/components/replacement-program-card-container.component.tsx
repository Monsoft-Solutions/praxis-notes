import { useState } from 'react';

import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@ui/button.ui';

import { PlusCircle } from 'lucide-react';

import { Switch } from '@shared/ui/switch.ui';
import { Label } from '@shared/ui/label.ui';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@ui/card.ui';

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
        <Card id={replacementProgramCardContainerId}>
            <CardHeader>
                <div className="flex flex-col-reverse md:flex-row md:justify-between">
                    <div>
                        <CardTitle>Replacement Program Data</CardTitle>
                        <CardDescription>
                            Record Replacement Program data for the session.
                        </CardDescription>
                    </div>

                    <div className="flex items-center justify-end gap-2 pb-8 sm:pb-0">
                        <Label htmlFor="detailed-view" className="text-sm">
                            Show Details
                        </Label>
                        <Switch
                            id="detailed-view"
                            checked={isDetailedView}
                            onCheckedChange={setIsDetailedView}
                        />
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
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
