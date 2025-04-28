import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Button } from '@ui/button.ui';
import { Label } from '@ui/label.ui';
import { Checkbox } from '@ui/checkbox.ui';

import { api } from '@api/providers/web';

type EditClientInterventionsProps = {
    clientId: string;
    onSaved?: () => void;
};

type InterventionFormData = {
    id: string;
    behaviorIds: string[];
};

export const EditClientInterventions = ({
    clientId,
    onSaved,
}: EditClientInterventionsProps) => {
    const [interventions, setInterventions] = useState<InterventionFormData[]>(
        [],
    );
    const [availableBehaviors, setAvailableBehaviors] = useState<
        { id: string; name?: string }[]
    >([]);

    const { data: interventionsQuery } =
        api.client.getClientInterventions.useQuery({
            clientId,
        });

    const { data: behaviorsQuery } = api.client.getClientBehaviors.useQuery({
        clientId,
    });

    const updateInterventionsMutation =
        api.client.updateClientInterventions.useMutation({
            onSuccess: () => {
                toast.success('Interventions updated');
                if (onSaved) onSaved();
            },
            onError: () => {
                toast.error('Failed to update interventions');
            },
        });

    useEffect(() => {
        if (behaviorsQuery?.data) {
            setAvailableBehaviors(
                behaviorsQuery.data.map((behavior) => ({
                    id: behavior.behaviorId,
                    name: `Behavior ${behavior.behaviorId.substring(0, 6)}...`, // Using part of ID as name since we don't have behavior names
                })),
            );
        }
    }, [behaviorsQuery?.data]);

    useEffect(() => {
        if (interventionsQuery?.data) {
            setInterventions(
                interventionsQuery.data.map((intervention) => ({
                    id: intervention.interventionId,
                    behaviorIds: intervention.behaviorIds,
                })),
            );
        }
    }, [interventionsQuery?.data]);

    const handleBehaviorToggle = (
        interventionIndex: number,
        behaviorId: string,
    ) => {
        const updatedInterventions = [...interventions];
        const intervention = updatedInterventions[interventionIndex];

        if (intervention.behaviorIds.includes(behaviorId)) {
            // Remove the behavior
            intervention.behaviorIds = intervention.behaviorIds.filter(
                (id) => id !== behaviorId,
            );
        } else {
            // Add the behavior
            intervention.behaviorIds = [
                ...intervention.behaviorIds,
                behaviorId,
            ];
        }

        setInterventions(updatedInterventions);
    };

    const handleSave = () => {
        updateInterventionsMutation.mutate({
            clientId,
            interventions,
        });
    };

    if (!interventionsQuery?.data || !behaviorsQuery?.data) {
        return <div>Loading interventions...</div>;
    }

    return (
        <div className="space-y-4">
            {interventions.length === 0 ? (
                <p>No interventions found for this client.</p>
            ) : (
                interventions.map((intervention, interventionIndex) => (
                    <div
                        key={intervention.id}
                        className="space-y-4 rounded-md border p-4"
                    >
                        <h4 className="font-medium">
                            Intervention {interventionIndex + 1}
                        </h4>

                        <div className="space-y-2">
                            <Label>Associated Behaviors</Label>
                            <div className="space-y-2">
                                {availableBehaviors.map((behavior) => (
                                    <div
                                        key={behavior.id}
                                        className="flex items-center space-x-2"
                                    >
                                        <Checkbox
                                            id={`intervention-${interventionIndex}-behavior-${behavior.id}`}
                                            checked={intervention.behaviorIds.includes(
                                                behavior.id,
                                            )}
                                            onCheckedChange={() => {
                                                handleBehaviorToggle(
                                                    interventionIndex,
                                                    behavior.id,
                                                );
                                            }}
                                        />
                                        <Label
                                            htmlFor={`intervention-${interventionIndex}-behavior-${behavior.id}`}
                                            className="cursor-pointer"
                                        >
                                            {behavior.name ?? behavior.id}
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))
            )}

            <div className="flex justify-end pt-4">
                <Button
                    onClick={handleSave}
                    disabled={
                        interventions.length === 0 ||
                        updateInterventionsMutation.isPending
                    }
                >
                    {updateInterventionsMutation.isPending
                        ? 'Saving...'
                        : 'Save Interventions'}
                </Button>
            </div>
        </div>
    );
};
