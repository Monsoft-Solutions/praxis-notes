import { useState, ReactNode, useEffect, useCallback } from 'react';

import { Button } from '@ui/button.ui';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@ui/card.ui';

import { ChevronLeft, ChevronRight } from 'lucide-react';

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

    return (
        <div className="space-y-8">
            {/* Progress Indicator */}
            <ol className="flex justify-between" role="list">
                {' '}
                {/* Use <ol> for semantic list */}
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = completedSteps.includes(stepNumber);
                    const isLast = stepNumber === steps.length;

                    return (
                        <li
                            key={step.title}
                            className={`relative flex w-full items-center ${
                                !isLast
                                    ? isCompleted
                                        ? "after:border-primary after:inline-block after:h-1 after:w-full after:border-4 after:border-b after:content-['']"
                                        : "after:border-muted after:inline-block after:h-1 after:w-full after:border-4 after:border-b after:content-['']"
                                    : ''
                            } ${isCompleted || isActive ? 'text-primary' : 'text-muted-foreground'}`}
                        >
                            <button
                                type="button"
                                aria-label={`Go to step ${stepNumber}: ${step.title}`}
                                aria-current={isActive ? 'step' : undefined}
                                onClick={() => {
                                    handleStepClick(stepNumber);
                                }}
                                className={`focus-visible:ring-primary flex cursor-pointer flex-col items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`} // Use focus-visible for ring
                            >
                                <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                                        isActive
                                            ? 'border-primary text-primary ring-primary font-bold ring-2 ring-offset-2' // Ring already here for active
                                            : isCompleted
                                              ? 'border-primary text-primary'
                                              : 'border-muted text-muted-foreground'
                                    }`}
                                >
                                    <span
                                        className={isActive ? 'font-bold' : ''}
                                    >
                                        {stepNumber}
                                    </span>
                                </span>
                                <div className="mt-2 w-full text-center">
                                    <div className="text-sm font-medium">
                                        {step.title}
                                    </div>
                                    {isActive && (
                                        <div className="text-muted-foreground hidden text-xs sm:block">
                                            {step.description}
                                        </div>
                                    )}
                                </div>
                            </button>
                        </li>
                    );
                })}
            </ol>

            {/* Current Step Content */}
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>{currentStepData.title}</CardTitle>
                    <CardDescription>
                        {currentStepData.description}
                    </CardDescription>
                </CardHeader>
                <CardContent>{currentStepData.content}</CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={(e) => {
                            e.preventDefault();
                            goToPreviousStep();
                        }} // Keep preventDefault for button clicks
                        disabled={currentStep === 1 || isSubmitting}
                        type="button"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Previous
                    </Button>
                    <div className="flex gap-2">
                        {!isLastStep && (
                            <Button
                                onClick={(e) => {
                                    e.preventDefault();
                                    goToNextStep();
                                }} // Keep preventDefault for button clicks
                                disabled={isSubmitting}
                                type="button"
                            >
                                Next
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                        {isLastStep && (
                            <Button
                                onClick={handleComplete}
                                disabled={
                                    isSubmitting || !isLastStepSubmitEnabled
                                }
                                type="button"
                            >
                                {isSubmitting ? 'Submitting...' : 'Complete'}
                            </Button>
                        )}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
}
