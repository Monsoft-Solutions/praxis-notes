export const getUserCreditsQueryKey = ({ userId }: { userId: string }) => [
    'credits',
    'user',
    userId,
];
