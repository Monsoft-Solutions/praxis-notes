import React from 'react';
import { ClientsOverview } from '../components';
import { SupportCard } from '@src/contact-center/components';
import { ViewContainer } from '@shared/ui';

export const DashboardView: React.FC = () => {
    return (
        <div className="relative h-full min-h-0 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50">
            {/* Enhanced background decorations */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {/* Hand-drawn irregular shapes with dashed borders */}
                <div
                    className="absolute left-10 top-20 hidden h-16 w-16 border-4 border-blue-300 opacity-40 sm:block"
                    style={{
                        borderStyle: 'dashed',
                        borderRadius: '60% 40% 65% 35%',
                        transform: 'rotate(-0.1deg)',
                    }}
                ></div>

                <div
                    className="border-3 absolute bottom-32 right-16 hidden h-12 w-12 border-purple-300 opacity-35 sm:block"
                    style={{
                        borderStyle: 'dashed',
                        borderRadius: '50% 60% 40% 70%',
                        transform: 'rotate(0.2deg)',
                    }}
                ></div>

                <div
                    className="absolute right-20 top-32 hidden h-10 w-10 border-2 border-orange-300 opacity-30 lg:block"
                    style={{
                        borderStyle: 'dotted',
                        borderRadius: '65% 35% 55% 45%',
                        transform: 'rotate(-0.15deg)',
                    }}
                ></div>

                {/* Puzzle piece style decorations */}
                <div className="absolute left-1/4 top-16 hidden h-6 w-6 rotate-12 transform rounded-sm bg-yellow-300 opacity-25 sm:block"></div>
                <div className="absolute bottom-40 right-1/4 hidden h-8 w-8 -rotate-6 transform rounded-sm bg-green-300 opacity-20 sm:block"></div>
                <div className="absolute bottom-20 left-20 hidden h-5 w-5 rotate-45 transform rounded-sm bg-blue-300 opacity-30 lg:block"></div>

                {/* Hand-drawn lines and squiggles */}
                <div
                    className="absolute left-1/3 top-1/4 hidden h-24 w-1 border-l-2 border-dashed border-purple-200 opacity-40 lg:block"
                    style={{ transform: 'rotate(15deg)' }}
                ></div>

                <div
                    className="absolute bottom-1/3 right-1/3 hidden h-1 w-20 border-t-2 border-dashed border-orange-200 opacity-35 lg:block"
                    style={{ transform: 'rotate(-10deg)' }}
                ></div>

                {/* Small colorful dots */}
                <div className="absolute bottom-20 left-1/4 hidden h-3 w-3 rounded-full bg-orange-400 opacity-50 lg:block"></div>
                <div className="absolute right-1/3 top-1/3 hidden h-2 w-2 rounded-full bg-purple-400 opacity-45 lg:block"></div>
                <div className="absolute bottom-1/4 left-1/2 hidden h-4 w-4 rounded-full bg-blue-400 opacity-40 lg:block"></div>
            </div>

            <ViewContainer>
                <div className="flex h-full min-h-0 overflow-hidden">
                    <div className="min-h-0 flex-1 overflow-auto">
                        <div className="space-y-8 pt-2">
                            <ClientsOverview />

                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                <SupportCard />
                                {/* Additional dashboard sections can be added here */}
                            </div>
                        </div>
                    </div>
                </div>
            </ViewContainer>
        </div>
    );
};
