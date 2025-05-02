import { Success, Error } from '@errors/utils';

import { protectedEndpoint } from '@api/providers/server';

import { queryMutationCallback } from '@api/providers/server/query-mutation-callback.provider';

import { z } from 'zod';
import { ClientSessionForm } from '../schemas';
import { catchError } from '@errors/utils/catch-error.util';
import { db } from '@db/providers/server';

export const getPlaceholderSessionData = protectedEndpoint
    .input(
        z.object({
            clientId: z.string(),
        }),
    )
    .query(
        queryMutationCallback(async () => {
            const { data: replacementProgram } = await catchError(
                db.query.replacementProgramTable.findFirst(),
            );

            if (!replacementProgram) return Error();

            const placeholderSessionData: ClientSessionForm = {
                sessionDate: new Date(),
                startTime: '10:00',
                endTime: '11:00',
                location: 'home',
                presentParticipants: [],
                environmentalChanges: [],
                abcIdEntries: [
                    {
                        antecedentId: '',
                        function: 'atention',
                        behaviorIds: [],
                        interventionIds: [],
                    },
                    {
                        antecedentId: '',
                        function: 'atention',
                        behaviorIds: [],
                        interventionIds: [],
                    },
                    {
                        antecedentId: '',
                        function: 'atention',
                        behaviorIds: [],
                        interventionIds: [],
                    },
                ],
                replacementProgramEntries: [
                    {
                        replacementProgramId: '',
                        teachingProcedureId: null,
                        promptingProcedureId: null,
                        clientResponse: null,
                        progress: null,
                        promptTypesIds: [],
                    },
                    {
                        replacementProgramId: '',
                        teachingProcedureId: null,
                        promptingProcedureId: null,
                        clientResponse: null,
                        progress: null,
                        promptTypesIds: [],
                    },
                    {
                        replacementProgramId: '',
                        teachingProcedureId: null,
                        promptingProcedureId: null,
                        clientResponse: null,
                        progress: null,
                        promptTypesIds: [],
                    },
                ],
                observations: null,
                valuation: 'fair',
            };

            return Success(placeholderSessionData);
        }),
    );
