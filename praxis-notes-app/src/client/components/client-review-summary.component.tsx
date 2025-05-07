import { useFormContext } from 'react-hook-form';

import { Card, CardContent } from '@ui/card.ui';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@ui/accordion.ui';

import { Badge } from '@ui/badge.ui';

import { ClientForm } from '../schemas';

import { Behavior } from '@src/behavior/schemas';
import { ReplacementProgram } from '@src/replacement-program/schemas';
import { Intervention } from '@src/intervention/schemas';

export function ClientReviewSummary({
    existingBehaviors,
    existingReplacementPrograms,
    existingInterventions,
}: {
    existingBehaviors: Behavior[];
    existingReplacementPrograms: ReplacementProgram[];
    existingInterventions: Intervention[];
}) {
    const { watch } = useFormContext<ClientForm>();
    const formValues = watch();
    const {
        firstName,
        lastName,
        gender,
        notes,
        behaviors,
        replacementPrograms,
        interventions,
    } = formValues;

    const behaviorsData = behaviors
        .map((behavior) => {
            const existingBehavior = existingBehaviors.find(
                (b) => b.id === behavior.id,
            );

            if (!existingBehavior) return undefined;

            return {
                ...behavior,
                ...existingBehavior,
            };
        })
        .filter((b) => b !== undefined);

    const replacementProgramsData = replacementPrograms
        .map((program) => {
            const existingProgram = existingReplacementPrograms.find(
                (p) => p.id === program.id,
            );

            if (!existingProgram) return undefined;

            return {
                ...program,
                ...existingProgram,
            };
        })
        .filter((b) => b !== undefined);

    const interventionsData = interventions
        .map((intervention) => {
            const existingIntervention = existingInterventions.find(
                (i) => i.id === intervention.id,
            );

            if (!existingIntervention) return undefined;

            return {
                ...intervention,
                ...existingIntervention,
            };
        })
        .filter((b) => b !== undefined);

    const formatGender = (gender: string) => {
        switch (gender) {
            case 'male':
                return 'Male';
            case 'female':
                return 'Female';
            case 'other':
                return 'Other';
            default:
                return gender;
        }
    };

    const formatType = (type: string) => {
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
        <div className="space-y-6">
            <section>
                <h3 className="mb-3 text-lg font-medium">Basic Information</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <p className="text-muted-foreground text-sm">
                            First Name
                        </p>
                        <p>{firstName || 'Not provided'}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-sm">
                            Last Name
                        </p>
                        <p>{lastName || 'Not provided'}</p>
                    </div>
                    <div>
                        <p className="text-muted-foreground text-sm">Gender</p>
                        <p>{formatGender(gender ?? 'unknown')}</p>
                    </div>
                </div>
                {notes && (
                    <div className="mt-3">
                        <p className="text-muted-foreground text-sm">Notes</p>
                        <p>{notes}</p>
                    </div>
                )}
            </section>

            <Accordion type="multiple" className="w-full">
                <AccordionItem value="behaviors">
                    <AccordionTrigger>
                        <div className="flex items-center">
                            <span>Behaviors</span>
                            <Badge className="ml-2" variant="outline">
                                {behaviors.length}
                            </Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        {behaviors.length === 0 ? (
                            <p className="text-muted-foreground py-2">
                                No behaviors added.
                            </p>
                        ) : (
                            <div className="space-y-4 p-2">
                                {behaviorsData.map((behavior, index) => (
                                    <Card key={index}>
                                        <CardContent className="p-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-grow">
                                                    <h4 className="font-medium">
                                                        {behavior.name}
                                                    </h4>
                                                    <p className="text-muted-foreground mt-1 text-sm">
                                                        {behavior.description ??
                                                            'No description'}
                                                    </p>
                                                    <p className="mt-2 text-sm">
                                                        <span className="text-muted-foreground">
                                                            Baseline:{' '}
                                                        </span>
                                                        {behavior.baseline}
                                                    </p>
                                                </div>
                                                <Badge variant="outline">
                                                    {formatType(behavior.type)}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="replacementPrograms">
                    <AccordionTrigger>
                        <div className="flex items-center">
                            <span>Replacement Programs</span>
                            <Badge className="ml-2" variant="outline">
                                {replacementPrograms.length}
                            </Badge>
                        </div>
                    </AccordionTrigger>

                    <AccordionContent>
                        {replacementPrograms.length === 0 ? (
                            <p className="text-muted-foreground py-2">
                                No replacement programs added.
                            </p>
                        ) : (
                            <div className="space-y-4 p-2">
                                {replacementProgramsData.map(
                                    (program, index) => (
                                        <Card key={index}>
                                            <CardContent className="p-4">
                                                <h4 className="font-medium">
                                                    {program.name}
                                                </h4>
                                                <p className="text-muted-foreground mt-1 text-sm">
                                                    {program.description ??
                                                        'No description'}
                                                </p>
                                                <div className="mt-3 text-sm">
                                                    <div className="mt-2">
                                                        <p className="text-muted-foreground text-sm">
                                                            Associated
                                                            Behaviors:
                                                        </p>
                                                        {program.behaviorIds
                                                            .length === 0 ? (
                                                            <p className="mt-1 text-sm italic">
                                                                No behaviors
                                                                associated
                                                            </p>
                                                        ) : (
                                                            <div className="mt-1 flex flex-wrap gap-1">
                                                                {program.behaviorIds.map(
                                                                    (id) => {
                                                                        const behavior =
                                                                            behaviorsData.find(
                                                                                (
                                                                                    b,
                                                                                ) =>
                                                                                    b.id ===
                                                                                    id,
                                                                            );

                                                                        return (
                                                                            behavior && (
                                                                                <Badge
                                                                                    key={
                                                                                        id
                                                                                    }
                                                                                    variant="secondary"
                                                                                    className="text-xs"
                                                                                >
                                                                                    {
                                                                                        behavior.name
                                                                                    }
                                                                                </Badge>
                                                                            )
                                                                        );
                                                                    },
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ),
                                )}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>

                <AccordionItem value="interventions">
                    <AccordionTrigger>
                        <div className="flex items-center">
                            <span>Interventions</span>
                            <Badge className="ml-2" variant="outline">
                                {interventions.length}
                            </Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        {interventions.length === 0 ? (
                            <p className="text-muted-foreground py-2">
                                No interventions added.
                            </p>
                        ) : (
                            <div className="space-y-4 p-2">
                                {interventionsData.map(
                                    (intervention, index) => (
                                        <Card key={index}>
                                            <CardContent className="p-4">
                                                <h4 className="font-medium">
                                                    {intervention.name}
                                                </h4>
                                                <p className="text-muted-foreground mt-1 text-sm">
                                                    {intervention.description ??
                                                        'No description'}
                                                </p>
                                                <div className="mt-3">
                                                    <p className="text-muted-foreground text-sm">
                                                        Associated Behaviors:
                                                    </p>
                                                    {intervention.behaviorIds
                                                        .length === 0 ? (
                                                        <p className="mt-1 text-sm italic">
                                                            No behaviors
                                                            associated
                                                        </p>
                                                    ) : (
                                                        <div className="mt-1 flex flex-wrap gap-1">
                                                            {intervention.behaviorIds.map(
                                                                (id) => {
                                                                    const behavior =
                                                                        behaviorsData.find(
                                                                            (
                                                                                b,
                                                                            ) =>
                                                                                b.id ===
                                                                                id,
                                                                        );

                                                                    return (
                                                                        behavior && (
                                                                            <Badge
                                                                                key={
                                                                                    id
                                                                                }
                                                                                variant="secondary"
                                                                                className="text-xs"
                                                                            >
                                                                                {
                                                                                    behavior.name
                                                                                }
                                                                            </Badge>
                                                                        )
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ),
                                )}
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
}
