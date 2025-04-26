import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { Button } from '@ui/button.ui';
import { Card, CardHeader, CardTitle, CardContent } from '@ui/card.ui';
import { ChevronDown, ChevronUp } from 'lucide-react';

import { Route } from '@routes/_private/_app/clients/$clientId/edit';
import { EditClientBasicInfo } from '../../components/edit-client-basic-info.component';
import { EditClientBehaviors } from '../../components/edit-client-behaviors.component';
import { EditClientReplacementPrograms } from '../../components/edit-client-replacement-programs.component';
import { EditClientInterventions } from '../../components/edit-client-interventions.component';

export const EditClientView = () => {
    const { clientId } = Route.useParams();
    const navigate = useNavigate();
    const [openCards, setOpenCards] = useState({
        basicInfo: true,
        behaviors: true,
        replacementPrograms: true,
        interventions: true,
    });

    const toggleCard = (card: keyof typeof openCards) => {
        setOpenCards((prev) => ({
            ...prev,
            [card]: !prev[card],
        }));
    };

    const handleCancel = () => {
        void navigate({
            to: '/clients/$clientId/sessions',
            params: { clientId },
        });
    };

    return (
        <div className="container mx-auto py-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit Client</h1>
                <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                </Button>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader
                        className="flex cursor-pointer flex-row items-center justify-between"
                        onClick={() => {
                            toggleCard('basicInfo');
                        }}
                    >
                        <CardTitle>Basic Information</CardTitle>
                        <Button variant="ghost" size="sm" className="p-0">
                            {openCards.basicInfo ? (
                                <ChevronUp />
                            ) : (
                                <ChevronDown />
                            )}
                        </Button>
                    </CardHeader>
                    {openCards.basicInfo && (
                        <CardContent>
                            <EditClientBasicInfo clientId={clientId} />
                        </CardContent>
                    )}
                </Card>

                <Card>
                    <CardHeader
                        className="flex cursor-pointer flex-row items-center justify-between"
                        onClick={() => {
                            toggleCard('behaviors');
                        }}
                    >
                        <CardTitle>Behaviors</CardTitle>
                        <Button variant="ghost" size="sm" className="p-0">
                            {openCards.behaviors ? (
                                <ChevronUp />
                            ) : (
                                <ChevronDown />
                            )}
                        </Button>
                    </CardHeader>
                    {openCards.behaviors && (
                        <CardContent>
                            <EditClientBehaviors clientId={clientId} />
                        </CardContent>
                    )}
                </Card>

                <Card>
                    <CardHeader
                        className="flex cursor-pointer flex-row items-center justify-between"
                        onClick={() => {
                            toggleCard('replacementPrograms');
                        }}
                    >
                        <CardTitle>Replacement Programs</CardTitle>
                        <Button variant="ghost" size="sm" className="p-0">
                            {openCards.replacementPrograms ? (
                                <ChevronUp />
                            ) : (
                                <ChevronDown />
                            )}
                        </Button>
                    </CardHeader>
                    {openCards.replacementPrograms && (
                        <CardContent>
                            <EditClientReplacementPrograms
                                clientId={clientId}
                            />
                        </CardContent>
                    )}
                </Card>

                <Card>
                    <CardHeader
                        className="flex cursor-pointer flex-row items-center justify-between"
                        onClick={() => {
                            toggleCard('interventions');
                        }}
                    >
                        <CardTitle>Interventions</CardTitle>
                        <Button variant="ghost" size="sm" className="p-0">
                            {openCards.interventions ? (
                                <ChevronUp />
                            ) : (
                                <ChevronDown />
                            )}
                        </Button>
                    </CardHeader>
                    {openCards.interventions && (
                        <CardContent>
                            <EditClientInterventions clientId={clientId} />
                        </CardContent>
                    )}
                </Card>
            </div>
        </div>
    );
};
