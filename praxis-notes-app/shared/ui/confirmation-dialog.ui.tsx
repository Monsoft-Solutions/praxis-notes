import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { cn } from '@css/utils';

export type ConfirmationDialogProps = {
    /** Controls open/close state. */
    open: boolean;
    /** Called when the dialog is requested to close. */
    onOpenChange: (open: boolean) => void;
    /** Called when user confirms the action. */
    onConfirm?: () => void;
    /** Called when user cancels the action. */
    onCancel?: () => void;
    /** Title displayed at the top of the dialog. */
    title?: string;
    /** Description or message in the dialog body. */
    description?: string;
    /** Label for the confirm button. */
    confirmLabel?: string;
    /** Label for the cancel button. */
    cancelLabel?: string;
    /** If you want to highlight the destructive nature of action. */
    destructive?: boolean;
};

export function ConfirmationDialog({
    open,
    onOpenChange,
    onConfirm,
    onCancel,
    title = 'Are you sure?',
    description = 'This action cannot be undone.',
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    destructive = true,
}: Readonly<ConfirmationDialogProps>) {
    return (
        <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
            <AlertDialog.Portal>
                <AlertDialog.Overlay
                    className={cn(
                        'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                    )}
                />
                <AlertDialog.Content
                    className={cn(
                        'fixed inset-0 z-50 flex items-center justify-center p-4',
                        'data-[state=open]:animate-in data-[state=closed]:animate-out',
                        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                        'focus:outline-none',
                    )}
                >
                    <div
                        className={cn(
                            'relative w-full max-w-md',
                            'border-2 border-blue-200 bg-white shadow-xl',
                        )}
                        style={{
                            borderRadius: '25px 30px 20px 35px',
                            padding: '1.5rem',
                            paddingTop: '2rem',
                        }}
                    >
                        {/* Thumb tack decoration */}
                        <div className="absolute -top-2 left-1/2 h-4 w-4 -translate-x-1/2 transform">
                            <div className="h-full w-full rounded-full bg-blue-400 shadow-sm"></div>
                            <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"></div>
                        </div>

                        <AlertDialog.Title
                            className="font-quicksand mb-3 text-lg font-bold text-blue-900"
                            style={{
                                textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                            }}
                        >
                            {title}
                        </AlertDialog.Title>

                        <AlertDialog.Description className="font-nunito text-muted-foreground mb-6 text-sm leading-relaxed">
                            {description}
                        </AlertDialog.Description>

                        <div className="flex justify-end space-x-3">
                            <AlertDialog.Cancel
                                onClick={() => {
                                    onOpenChange(false);
                                    onCancel?.();
                                }}
                                className={cn(
                                    'font-nunito px-4 py-2 text-sm font-medium',
                                    'border-2 border-gray-200 bg-white text-gray-700',
                                    'hover:border-gray-300 hover:bg-gray-50 hover:shadow-md',
                                    'focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-1',
                                    'transition-all duration-200 hover:-translate-y-0.5',
                                )}
                                style={{
                                    borderRadius: '10px 12px 10px 14px',
                                }}
                            >
                                {cancelLabel}
                            </AlertDialog.Cancel>
                            <AlertDialog.Action
                                onClick={onConfirm}
                                className={cn(
                                    'font-quicksand px-4 py-2 text-sm font-semibold',
                                    'text-white focus:outline-none',
                                    'focus:ring-2 focus:ring-offset-1',
                                    'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
                                    destructive
                                        ? 'bg-orange-400 hover:bg-orange-500 focus:ring-orange-300'
                                        : 'bg-green-400 hover:bg-green-500 focus:ring-green-300',
                                )}
                                style={{
                                    borderRadius: '10px 12px 10px 14px',
                                }}
                            >
                                {confirmLabel}
                            </AlertDialog.Action>
                        </div>
                    </div>
                </AlertDialog.Content>
            </AlertDialog.Portal>
        </AlertDialog.Root>
    );
}
