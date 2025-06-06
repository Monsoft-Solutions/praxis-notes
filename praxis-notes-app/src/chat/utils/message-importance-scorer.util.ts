import { Function } from '@errors/types';
import { Success } from '@errors/utils';
import { ChatMessage } from '../schemas';

export type MessageImportanceFactors = {
    recencyScore: number; // 0-30 points
    roleScore: number; // 0-20 points
    contentOptimizationScore: number; // -10 to +10 points
    attachmentScore: number; // 0-15 points
    questionPatternScore: number; // 0-10 points
    keywordScore: number; // 0-15 points
    continuityScore: number; // 0-10 points
    positionScore: number; // 0-10 points (first/last message bonus)
};

export type MessageImportanceResult = {
    score: number; // Final score 0-100
    factors: MessageImportanceFactors;
};

// Keywords that indicate important content
const IMPORTANT_KEYWORDS = [
    // ABA therapy terms
    'behavior',
    'intervention',
    'baseline',
    'data',
    'assessment',
    'plan',
    'goal',
    'reinforcement',
    'antecedent',
    'consequence',
    'functional',
    'replacement',
    // Client-related terms
    'client',
    'session',
    'progress',
    'notes',
    'create',
    'update',
    // System operations
    'error',
    'problem',
    'issue',
    'help',
    'urgent',
];

// Question patterns that indicate important user queries
const QUESTION_PATTERNS = [
    /\?/g, // Contains question marks
    /^(what|how|when|where|why|can|could|would|should|do|does|is|are)/i, // Question starters
    /help|assist|explain|show|tell|guide/i, // Help requests
];

/**
 * Calculate importance score for a message (0-100)
 */
export const calculateMessageImportance = (({
    message,
    allMessages,
}: {
    message: ChatMessage;
    allMessages: ChatMessage[];
}) => {
    const factors: MessageImportanceFactors = {
        recencyScore: calculateRecencyScore(message, allMessages),
        roleScore: calculateRoleScore(message),
        contentOptimizationScore: calculateContentOptimizationScore(message),
        attachmentScore: calculateAttachmentScore(message),
        questionPatternScore: calculateQuestionPatternScore(message),
        keywordScore: calculateKeywordScore(message),
        continuityScore: calculateContinuityScore(message),
        positionScore: calculatePositionScore(message, allMessages),
    };

    // Sum all factors to get final score
    const totalScore =
        factors.recencyScore +
        factors.roleScore +
        factors.contentOptimizationScore +
        factors.attachmentScore +
        factors.questionPatternScore +
        factors.keywordScore +
        factors.continuityScore +
        factors.positionScore;

    // Ensure score is between 0-100
    const finalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

    const result: MessageImportanceResult = {
        score: finalScore,
        factors,
    };

    return Success(result);
}) satisfies Function<
    { message: ChatMessage; allMessages: ChatMessage[] },
    MessageImportanceResult
>;

/**
 * Calculate recency score (0-30 points)
 * Most recent messages get higher scores
 */
function calculateRecencyScore(
    message: ChatMessage,
    allMessages: ChatMessage[],
): number {
    const sortedMessages = [...allMessages].sort(
        (a, b) => b.createdAt - a.createdAt,
    );
    const messageIndex = sortedMessages.findIndex((m) => m.id === message.id);

    if (messageIndex === -1) return 0;

    const totalMessages = sortedMessages.length;
    const recencyRatio = (totalMessages - messageIndex) / totalMessages;

    return Math.round(recencyRatio * 30);
}

/**
 * Calculate role score (0-20 points)
 * Assistant messages slightly lower priority as they can be regenerated
 */
function calculateRoleScore(message: ChatMessage): number {
    switch (message.role) {
        case 'user':
            return 20; // User messages are most important
        case 'assistant':
            return 15; // Assistant messages slightly less important
        default:
            return 10;
    }
}

/**
 * Calculate content optimization score (-10 to +10 points)
 * Penalize very long messages, reward medium-length messages
 */
function calculateContentOptimizationScore(message: ChatMessage): number {
    const contentLength = message.content.length;

    if (contentLength === 0) return -10; // Empty messages
    if (contentLength < 20) return -5; // Too short
    if (contentLength < 100) return 10; // Good length
    if (contentLength < 500) return 5; // Medium length
    if (contentLength < 2000) return 0; // Getting long
    return -10; // Very long messages get penalized
}

/**
 * Calculate attachment score (0-15 points)
 * Messages with attachments are often important
 */
function calculateAttachmentScore(message: ChatMessage): number {
    if (message.attachments.length === 0) return 0;

    // Base score for having attachments
    let score = 10;

    // Bonus for multiple attachments (but diminishing returns)
    const additionalAttachments = Math.min(message.attachments.length - 1, 3);
    score += additionalAttachments * 2;

    return Math.min(score, 15);
}

/**
 * Calculate question pattern score (0-10 points)
 * Messages that ask questions are often important
 */
function calculateQuestionPatternScore(message: ChatMessage): number {
    const content = message.content.toLowerCase();
    let score = 0;

    for (const pattern of QUESTION_PATTERNS) {
        if (pattern.test(content)) {
            score += 3;
            if (score >= 10) break;
        }
    }

    return Math.min(score, 10);
}

/**
 * Calculate keyword score (0-15 points)
 * Messages containing important keywords get higher scores
 */
function calculateKeywordScore(message: ChatMessage): number {
    const content = message.content.toLowerCase();
    let score = 0;

    for (const keyword of IMPORTANT_KEYWORDS) {
        if (content.includes(keyword)) {
            score += 1;
            if (score >= 15) break;
        }
    }

    return Math.min(score, 15);
}

/**
 * Calculate continuity score (0-10 points)
 * Messages that reference previous context get bonus points
 */
function calculateContinuityScore(message: ChatMessage): number {
    const content = message.content.toLowerCase();

    // Check for continuity indicators
    const continuityIndicators = [
        'previous',
        'earlier',
        'before',
        'above',
        'that',
        'this',
        'it',
        'also',
        'additionally',
        'furthermore',
        'moreover',
        'continue',
        'follow up',
        'regarding',
        'about that',
        'as mentioned',
    ];

    let score = 0;
    for (const indicator of continuityIndicators) {
        if (content.includes(indicator)) {
            score += 2;
            if (score >= 10) break;
        }
    }

    return Math.min(score, 10);
}

/**
 * Calculate position score (0-10 points)
 * First and last messages often contain important context
 */
function calculatePositionScore(
    message: ChatMessage,
    allMessages: ChatMessage[],
): number {
    const sortedMessages = [...allMessages].sort(
        (a, b) => a.createdAt - b.createdAt,
    );
    const messageIndex = sortedMessages.findIndex((m) => m.id === message.id);

    if (messageIndex === -1) return 0;

    const isFirst = messageIndex === 0;
    const isLast = messageIndex === sortedMessages.length - 1;

    if (isFirst || isLast) return 5;

    // Second and second-to-last messages get smaller bonus
    if (messageIndex === 1 || messageIndex === sortedMessages.length - 2)
        return 2;

    return 0;
}
