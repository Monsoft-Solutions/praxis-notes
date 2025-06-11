import { ChatMessage } from './chat-message.schema';
import { ConversationSummary } from '../utils/conversation-summarizer.util';
import { MessageImportanceResult } from '../utils/message-importance-scorer.util';

export type MessageWithMetadata = ChatMessage & {
    tokenCount: number;
    importanceScore: number;
    importanceFactors: MessageImportanceResult['factors'];
};

export type SummaryWithMetadata = ConversationSummary & {
    tokenCount: number;
    type: 'summary';
    // Convert to message-like structure for unified processing
    content: string;
    role: 'system';
    createdAt: number;
    id: string;
    sessionId: string;
    attachments: never[];
    importanceScore: number;
    importanceFactors: MessageImportanceResult['factors'];
};

export type ContextItemWithMetadata = MessageWithMetadata | SummaryWithMetadata;

export type ContextSelectionResult = {
    selectedMessages: MessageWithMetadata[];
    totalTokens: number;
    totalMessages: number;
    droppedMessages: number;
    contextUtilization: number;
    averageImportanceScore: number;
    selectionStrategy:
        | 'all'
        | 'importance-based'
        | 'sliding-window'
        | 'emergency-truncation';
};

export type EnhancedContextSelectionResult = {
    selectedItems: ContextItemWithMetadata[];
    selectedMessages: MessageWithMetadata[];
    selectedSummaries: SummaryWithMetadata[];
    totalTokens: number;
    totalMessages: number;
    totalSummaries: number;
    droppedMessages: number;
    contextUtilization: number;
    averageImportanceScore: number;
    tokensSavedBySummaries: number;
    selectionStrategy:
        | 'all'
        | 'importance-based-with-summaries'
        | 'sliding-window-with-summaries'
        | 'summaries-only'
        | 'emergency-truncation';
};

export type OptimizedContextSelectionResult = {
    selectedItems: ContextItemWithMetadata[];
    selectedMessages: MessageWithMetadata[];
    selectedSummaries: SummaryWithMetadata[];
    totalTokens: number;
    totalMessages: number;
    totalSummaries: number;
    droppedMessages: number;
    contextUtilization: number;
    averageImportanceScore: number;
    tokensSavedBySummaries: number;
    selectionStrategy:
        | 'all'
        | 'importance-based-optimized'
        | 'sliding-window-optimized'
        | 'summaries-only'
        | 'emergency-truncation';
    optimizationUsed: boolean;
};

export type OptimalContextMetadata = {
    totalMessages: number;
    totalTokens: number;
    averageImportanceScore: number;
    contextUtilization: number;
    hasLongConversation: boolean;
    recommendsSummarization: boolean;
    tokenLimit: number;
    messagesAnalyzed: number;
    totalSummaries: number;
    latestSummaryTimestamp: number | null;
    messagesCoveredBySummaries: number;
    tokensSavedBySummaries: number;
    optimizationUsed: boolean;
};

export type ChatSessionWithOptimalContext = {
    id: string;
    title?: string;
    createdAt: number;
    updatedAt: number;
    userId: string;
    messages: MessageWithMetadata[];
    contextMetadata: OptimalContextMetadata;
    summaries: ConversationSummary[];
};

export type ChatMessageCreationPayload = {
    userMessage: ChatMessage;
    assistantMessage: ChatMessage;
    userMessageTokens: number;
    assistantMessageTokens: number;
    userImportanceScore: number;
    assistantImportanceScore: number;
    contextResult: OptimizedContextSelectionResult;
    sessionTitle?: string;
};

export type MessageStreamUpdatePayload = {
    messageId: string;
    sessionId: string;
    content: string;
    isComplete: boolean;
};
