import { useFormContext } from 'react-hook-form';

import { Button } from '@ui/button.ui';

import { Trash2 } from 'lucide-react';

import {
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormControl,
} from '@ui/form.ui';

import { ClientSessionForm } from '../schemas';

import { api, apiClientUtils } from '@api/providers/web';
import { AbcSelector } from './abc-selector.component';

import { Route } from '@routes/_private/_app/clients/$clientId/sessions/new';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@ui/select.ui';
import { replacementProgramResponseEnum } from '@src/replacement-program/enums';

import { Input } from '@ui/input.ui';
import { Card, CardTitle, CardHeader, CardContent } from '@shared/ui/card.ui';

type ReplacementProgramCardProps = {
    index: number;
    onRemove?: () => void;
    isDetailedView: boolean;
};

export function ReplacementProgramCard({
    index,
    onRemove,
    isDetailedView,
}: ReplacementProgramCardProps) {
    const { clientId } = Route.useParams();

    const { mutateAsync: createReplacementProgram } =
        api.replacementProgram.createReplacementProgram.useMutation();

    const { control } = useFormContext<ClientSessionForm>();

    const { data: replacementProgramsQuery } =
        api.replacementProgram.getReplacementPrograms.useQuery();

    const { data: clientReplacementProgramsQuery } =
        api.replacementProgram.getClientReplacementPrograms.useQuery({
            clientId,
        });

    const { data: teachingProceduresQuery } =
        api.replacementProgram.getTeachingProcedures.useQuery();

    const { data: promptingProceduresQuery } =
        api.replacementProgram.getPromptingProcedures.useQuery();

    const { data: promptTypesQuery } =
        api.replacementProgram.getPromptTypes.useQuery();

    if (!replacementProgramsQuery) return null;
    const { error: replacementProgramsError } = replacementProgramsQuery;
    if (replacementProgramsError) return null;
    const { data: rawReplacementPrograms } = replacementProgramsQuery;

    if (!clientReplacementProgramsQuery) return null;
    const { error: clientReplacementProgramsError } =
        clientReplacementProgramsQuery;
    if (clientReplacementProgramsError) return null;
    const { data: clientReplacementPrograms } = clientReplacementProgramsQuery;

    const replacementPrograms = rawReplacementPrograms.map(
        (replacementProgram) => ({
            ...replacementProgram,
            isClient: clientReplacementPrograms.some(
                (r) => r.id === replacementProgram.id,
            ),
        }),
    );

    if (!teachingProceduresQuery) return null;
    const { error: teachingProceduresError } = teachingProceduresQuery;
    if (teachingProceduresError) return null;
    const { data: teachingProcedures } = teachingProceduresQuery;

    if (!promptingProceduresQuery) return null;
    const { error: promptingProceduresError } = promptingProceduresQuery;
    if (promptingProceduresError) return null;
    const { data: promptingProcedures } = promptingProceduresQuery;

    if (!promptTypesQuery) return null;
    const { error: promptTypesError } = promptTypesQuery;
    if (promptTypesError) return null;
    const { data: promptTypes } = promptTypesQuery;

    return (
        <Card className="relative pt-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Replacement {index + 1}</CardTitle>
                {onRemove && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                        onClick={onRemove}
                        type="button"
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">
                            Remove Replacement Program
                        </span>
                    </Button>
                )}
            </CardHeader>

            <CardContent className="mt-4 space-y-6">
                {/* Replacement Program */}
                <FormField
                    control={control}
                    name={`replacementProgramEntries.${index}.replacementProgramId`}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Replacement Program</FormLabel>

                            <AbcSelector
                                initValue={field.value}
                                placeholder="Select replacement program"
                                items={replacementPrograms}
                                onSelect={field.onChange}
                                create={async ({ name }) => {
                                    const result =
                                        await createReplacementProgram({
                                            name,
                                            description: '',
                                        });
                                    if (result.error) return null;
                                    await apiClientUtils.replacementProgram.getReplacementPrograms.invalidate();
                                    return result.data;
                                }}
                            />

                            <FormMessage />
                        </FormItem>
                    )}
                />

                {isDetailedView && (
                    <>
                        {/* Teaching Procedure */}
                        <FormField
                            control={control}
                            name={`replacementProgramEntries.${index}.teachingProcedureId`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Teaching Procedure</FormLabel>

                                    <AbcSelector
                                        initValue={field.value ?? ''}
                                        placeholder="Select teaching procedure"
                                        items={teachingProcedures}
                                        onSelect={field.onChange}
                                    />

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Prompts used */}
                        <FormField
                            control={control}
                            name={`replacementProgramEntries.${index}.promptTypesIds`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prompts used</FormLabel>

                                    <AbcSelector
                                        initValue={field.value}
                                        placeholder="Select prompts used"
                                        items={promptTypes}
                                        onSelect={field.onChange}
                                        multiple
                                    />

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Prompting Procedure */}
                        <FormField
                            control={control}
                            name={`replacementProgramEntries.${index}.promptingProcedureId`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Prompting Procedure</FormLabel>

                                    <AbcSelector
                                        initValue={field.value ?? undefined}
                                        placeholder="Select prompting procedure"
                                        items={promptingProcedures}
                                        onSelect={field.onChange}
                                    />

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Client Response */}
                        <FormField
                            control={control}
                            name={`replacementProgramEntries.${index}.clientResponse`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Client Response</FormLabel>

                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value ?? ''}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select client response" />
                                            </SelectTrigger>
                                        </FormControl>

                                        <SelectContent>
                                            {replacementProgramResponseEnum.options.map(
                                                (option) => (
                                                    <SelectItem
                                                        key={option}
                                                        value={option}
                                                    >
                                                        {option}
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Progress */}
                        <FormField
                            control={control}
                            name={`replacementProgramEntries.${index}.progress`}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Response Progress (%)</FormLabel>

                                    <Input
                                        type="number"
                                        value={field.value ?? ''}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === '') {
                                                field.onChange(0);
                                            } else {
                                                field.onChange(Number(value));
                                            }
                                        }}
                                    />

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </>
                )}
            </CardContent>
        </Card>
    );
}
