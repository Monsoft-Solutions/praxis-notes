import axios from 'axios';
import { deploymentEnv } from '@env/constants/deployment-env.constant';
import type { LogContext } from '../logger/logger.types';
import { getCoreConf } from '@conf/core/providers/server';

// Define Slack message types for better type safety
type SlackMessage = {
    text: string;
    blocks: SlackBlock[];
};

// Use a simplified type for blocks to avoid TypeScript errors
type SlackBlock = {
    type: string;
    text?: { type: string; text: string; emoji?: boolean };
    fields?: { type: string; text: string }[];
    // Add other potential properties as needed
};

class SlackService {
    private _errorWebhook: string | undefined;
    private _infoWebhook: string | undefined;

    constructor() {
        void this.setSlackWebhooks();
    }

    private async setSlackWebhooks() {
        const coreConfWithError = await getCoreConf();

        const { error: coreConfError } = coreConfWithError;

        if (coreConfError !== null) return Error('MISSING_CORE_CONF');

        const { data: coreConf } = coreConfWithError;

        const { slackWebhookUrlError, slackWebhookUrlInfo } = coreConf;

        this._errorWebhook = slackWebhookUrlError;
        this._infoWebhook = slackWebhookUrlInfo;
    }

    async sendErrorToSlack(
        message: string,
        context?: LogContext,
    ): Promise<void> {
        try {
            if (!this._errorWebhook) return;

            // Format stack trace if available
            let stackTrace = '';
            if (context?.error instanceof Error && context.error.stack) {
                stackTrace = context.error.stack;
            }

            // Build Slack message payload according to Block Kit
            const payload: SlackMessage = {
                // Fallback text for notifications and clients that don't support blocks
                text: `Error: ${message}`,

                // Block Kit blocks with proper typing
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: '🔴 Error Alert',
                            emoji: true,
                        },
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*Message:* ${message}`,
                        },
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*Environment:*\n${deploymentEnv.MSS_DEPLOYMENT_TYPE}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Timestamp:*\n${new Date().toISOString()}`,
                            },
                        ],
                    },
                ] as SlackBlock[],
            };

            // Add context section if available
            if (context) {
                // Create a safe copy of context for JSON serialization

                payload.blocks.push({
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        // Limit context size to avoid exceeding Slack's message size limits
                        text: `*Context:*\n\`\`\`${JSON.stringify(context, null, 2).substring(0, 2000)}\`\`\``,
                    },
                });
            }

            // Add stack trace if available
            if (stackTrace) {
                payload.blocks.push({
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        // Limit stack trace size to avoid exceeding Slack's message size limits
                        text: `*Stack Trace:*\n\`\`\`${stackTrace.substring(0, 2000)}\`\`\``,
                    },
                });
            }

            // Add section instead of divider for separation
            payload.blocks.push({
                type: 'section',
                text: {
                    type: 'mrkdwn',
                    text: '---',
                },
            });

            // Send to Slack
            const response = await axios.post(this._errorWebhook, payload);

            // Log response for debugging
            if (response.status !== 200) {
                console.error(
                    'Slack webhook error:',
                    response.status,
                    response.statusText,
                );
            }
        } catch (err) {
            console.error('Failed to send error to Slack:', err);
        }
    }

    async sendInfoToSlack(
        message: string,
        context?: LogContext,
    ): Promise<void> {
        try {
            if (!this._infoWebhook) return;

            // Build Slack message payload according to Block Kit
            const payload: SlackMessage = {
                text: `Info: ${message}`,
                blocks: [
                    {
                        type: 'header',
                        text: {
                            type: 'plain_text',
                            text: '📋 Information Update',
                            emoji: true,
                        },
                    },
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `*Message:* ${message}`,
                        },
                    },
                    {
                        type: 'section',
                        fields: [
                            {
                                type: 'mrkdwn',
                                text: `*Environment:*\n${deploymentEnv.MSS_DEPLOYMENT_TYPE}`,
                            },
                            {
                                type: 'mrkdwn',
                                text: `*Timestamp:*\n${new Date().toISOString()}`,
                            },
                        ],
                    },
                ] as SlackBlock[],
            };

            // Add context section if available
            if (context) {
                payload.blocks.push({
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*Context:*\n\`\`\`${JSON.stringify(context, null, 2).substring(0, 2000)}\`\`\``,
                    },
                });
            }

            // Send to Slack
            const response = await axios.post(this._infoWebhook, payload);

            if (response.status !== 200) {
                console.error(
                    'Slack info webhook error:',
                    response.status,
                    response.statusText,
                );
            }
        } catch (err) {
            console.error('Failed to send info to Slack:', err);
        }
    }
}

export const slackService = new SlackService();
