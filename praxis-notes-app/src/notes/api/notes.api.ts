import { endpoints } from '@api/providers/server';

// queries

// mutations
import { generateNotes } from './generate-notes.mutation';
import { updateNotes } from './update-notes.mutation';

// subscriptions
import { onNotesUpdated } from './notes-updated.subscription';

export const notes = endpoints({
    // queries

    // mutations
    generateNotes,
    updateNotes,

    // subscriptions
    onNotesUpdated,
});
