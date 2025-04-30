type SessionHeaderProps = {
    clientName: string;
    isEditing?: boolean;
};

export function SessionHeader({
    clientName,
    isEditing = false,
}: SessionHeaderProps) {
    return (
        <div className="space-y-2">
            {/* <nav className="flex items-center text-sm">
                <Link
                    href="/clients"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    Clients
                </Link>

                <ChevronRight className="text-muted-foreground mx-2 h-4 w-4" />

                <Link
                // to="/clients/$clientId"
                // params={{ clientId }}
                // className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    {clientName}
                </Link>

                <ChevronRight className="text-muted-foreground mx-2 h-4 w-4" />

                <span className="text-foreground font-medium">
                    {isEditing ? 'Edit Session' : 'New Session'}
                </span>
            </nav> */}

            <h1 className="text-2xl font-bold">
                {isEditing
                    ? `Edit Session for ${clientName}`
                    : `New Session for ${clientName}`}
            </h1>

            <p className="text-muted-foreground">
                {isEditing
                    ? 'Update the session information below.'
                    : 'Fill out the form below to record session data and generate notes.'}
            </p>
        </div>
    );
}
