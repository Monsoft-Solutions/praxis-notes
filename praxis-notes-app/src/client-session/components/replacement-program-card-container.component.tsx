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
            <CardHeader className="relative">
                <CardTitle>Replacement Program Data</CardTitle>

                <CardDescription>
                    Record Replacement Program data for the session.
                </CardDescription>

                <div className="absolute right-4 top-4 flex items-center gap-2">
                    <Switch
                        id="detailed-view"
                        checked={isDetailedView}
                        onCheckedChange={setIsDetailedView}
                    />

                    <Label htmlFor="detailed-view" className="text-sm">
                        Show Detailes
                    </Label>
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
