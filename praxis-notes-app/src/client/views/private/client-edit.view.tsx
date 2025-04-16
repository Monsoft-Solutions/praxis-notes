import React from 'react';
import { useParams } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';

import { Button } from '@shared/ui/button.ui';
import { Card } from '@shared/ui/card.ui';
import { ArrowLeft } from 'lucide-react';

import { ClientLocationEdit } from '@src/location/views/client-location-edit.component';

export const ClientEditView = () => {
    const { clientId } = useParams({
        from: '/_private/_app/clients/$clientId/edit/',
    });

    return (
        <div className="container mx-auto space-y-6 py-6">
            <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                    <Link
                        to="/clients/$clientId/sessions"
                        params={{ clientId }}
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Client
                    </Link>
                </Button>
            </div>

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit Client</h1>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card title="Client Information">
                    <p className="text-gray-500">
                        Client information form would go here.
                    </p>
                </Card>

                <ClientLocationEdit clientId={clientId} />
            </div>
        </div>
    );
};
