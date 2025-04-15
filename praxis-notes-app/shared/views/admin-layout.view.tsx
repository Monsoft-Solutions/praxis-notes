import { Separator } from '@ui/separator.ui';

export const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Admin</h2>
                <p className="text-muted-foreground">
                    Manage system settings and configuration
                </p>
            </div>

            <Separator />

            <div>{children}</div>
        </div>
    );
};
