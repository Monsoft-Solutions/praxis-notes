import { endpoints } from '@api/providers/server';

// queries

// mutations
import { generateNotes } from './generate-notes.mutation';
import { updateNotes } from './update-notes.mutation';
import { translateNotes } from './translate-notes.mutation';

// subscriptions
import { onNotesUpdated } from './notes-updated.subscription';

export const notes = endpoints({
    // queries

    // mutations
    generateNotes,
    updateNotes,
    translateNotes,

    // subscriptions
    onNotesUpdated,
});
