import { useState, ReactNode, useEffect, useCallback } from 'react';

import { Button } from '@ui/button.ui';

import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';

import { TourStepId } from '@shared/types/tour-step-id.type';

export type MultiStepFormStep = {
    title: string;
    description: string;
    content: ReactNode;
    isOptional?: boolean;
};

type MultiStepFormProps = {
    steps: MultiStepFormStep[];
    currentStep: number;
    onStepChange: (step: number) => void;
    onComplete: () => void;
    isSubmitting?: boolean;
    isLastStepSubmitEnabled?: boolean;
};

export function MultiStepForm({
    steps,
    currentStep,
    onStepChange,
    onComplete,
    isSubmitting = false,
    isLastStepSubmitEnabled = true,
}: MultiStepFormProps) {
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    // Mark current step as completed when navigating forward
    useEffect(() => {
        if (!completedSteps.includes(currentStep)) {
            setCompletedSteps((prev) => [...prev, currentStep]);
        }
    }, [currentStep, completedSteps]);

    const goToNextStep = useCallback(() => {
        if (currentStep < steps.length) {
            onStepChange(currentStep + 1);
        }
    }, [currentStep, steps.length, onStepChange]);

    const goToPreviousStep = useCallback(() => {
        if (currentStep > 1) {
            onStepChange(currentStep - 1);
        }
    }, [currentStep, onStepChange]);

    // Handle keyboard navigation
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Prevent navigation if focus is inside an input/textarea/select
            const target = event.target as HTMLElement;
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) {
                return;
            }

            if (event.key === 'ArrowRight') {
                event.preventDefault(); // Prevent potential browser scrolling
                goToNextStep();
            } else if (event.key === 'ArrowLeft') {
                event.preventDefault(); // Prevent potential browser scrolling
                goToPreviousStep();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [goToNextStep, goToPreviousStep]);

    const handleComplete = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent any default form submission
        e.preventDefault();

        // Add the final step to completed steps if not already done
        if (!completedSteps.includes(steps.length)) {
            setCompletedSteps((prev) => [...prev, steps.length]);
        }
        onComplete();
    };

    const handleStepClick = (stepNumber: number) => {
        // Allow clicking on any step number to navigate directly
        onStepChange(stepNumber);
    };

    const isLastStep = currentStep === steps.length;
    const currentStepData = steps[currentStep - 1];

    const indexToId = (index: number): TourStepId | undefined => {
        switch (index) {
            case 0:
                return 'client-form-basic-info-step';
            case 1:
                return 'client-form-behavior-step';
            case 2:
                return 'client-form-programs-step';
            case 3:
                return 'client-form-interventions-step';
            case 4:
                return 'client-form-review-step';
            default:
                return undefined;
        }
    };

    // Get thumb tack color based on step index
    const getThumbTackColor = (index: number) => {
        const colors = [
            'bg-blue-400',
            'bg-green-400',
            'bg-orange-400',
            'bg-yellow-400',
            'bg-purple-400',
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="space-y-8">
            {/* Progress Indicator - Hand-drawn style */}
            <div
                className="relative rounded-3xl border-2 border-green-200 bg-white p-6 shadow-lg"
                style={{
                    borderRadius: '20px 24px 18px 26px',
                }}
            >
                {/* Progress card thumb tack */}
                <div className="absolute -top-1.5 right-8 h-3 w-3 rotate-45 transform bg-green-400 shadow-sm"></div>

                <div className="pt-1">
                    <h2
                        className="font-quicksand mb-4 text-lg font-semibold text-gray-800"
                        style={{
                            textShadow: '1px 1px 2px rgba(0,0,0,0.1)',
                        }}
                    >
                        Progress
                    </h2>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {steps.map((step, index) => {
                            const stepNumber = index + 1;
                            const isCompleted =
                                completedSteps.includes(stepNumber);
                            const isCurrent = currentStep === stepNumber;
                            const isClickable =
                                isCompleted || stepNumber <= currentStep;

                            return (
                                <div
                                    key={stepNumber}
                                    className="flex items-center"
                                >
                                    <button
                                        onClick={() => {
                                            if (isClickable) {
                                                handleStepClick(stepNumber);
                                            }
                                        }}
                                        disabled={!isClickable}
                                        className={`font-quicksand relative flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                                            isCurrent
                                                ? 'border-blue-400 bg-blue-400 text-white shadow-lg'
                                                : isCompleted
                                                  ? 'border-green-400 bg-green-400 text-white'
                                                  : 'border-gray-300 bg-white text-gray-500'
                                        } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed'} `}
                                        style={{
                                            borderRadius: '40% 60% 50% 50%',
                                        }}
                                        id={indexToId(index)}
                                    >
                                        {isCompleted && !isCurrent ? (
                                            <CheckCircle className="h-5 w-5" />
                                        ) : (
                                            stepNumber
                                        )}
                                    </button>
                                    {index < steps.length - 1 && (
                                        <div
                                            className={`mx-2 h-0.5 w-8 ${
                                                completedSteps.includes(
                                                    stepNumber + 1,
                                                )
                                                    ? 'bg-green-400'
                                                    : 'bg-gray-300'
                                            }`}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Current step info */}
                    <div className="mt-4 text-center">
                        <h3 className="font-quicksand font-semibold text-gray-800">
                            Step {currentStep}: {currentStepData.title}
                        </h3>
                        <p className="font-nunito text-muted-foreground text-sm">
                            {currentStepData.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* Step Content Card */}
            <div
                className="relative rounded-3xl border-2 border-blue-200 bg-white shadow-lg"
                style={{
                    borderRadius: '25px 30px 20px 35px',
                }}
            >
                {/* Main content thumb tack */}
                <div className="absolute -top-2 left-8">
                    {(() => {
                        const colorClass = getThumbTackColor(currentStep - 1);
                        const borderColor = colorClass.replace(
                            'bg-',
                            'border-b-',
                        );
                        return (
                            <div
                                className={`h-0 w-0 border-b-4 border-l-2 border-r-2 border-l-transparent border-r-transparent ${borderColor}`}
                            />
                        );
                    })()}
                </div>

                <div className="p-8 pt-6">
                    {/* Step content */}
                    <div className="mb-6">{currentStepData.content}</div>

                    {/* Navigation buttons */}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={goToPreviousStep}
                            disabled={currentStep === 1}
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>

                        {isLastStep ? (
                            <Button
                                type="button"
                                onClick={handleComplete}
                                disabled={
                                    isSubmitting || !isLastStepSubmitEnabled
                                }
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {isSubmitting ? 'Creating...' : 'Complete'}
                            </Button>
                        ) : (
                            <Button type="button" onClick={goToNextStep}>
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
