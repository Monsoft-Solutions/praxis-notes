import { useState, ReactNode, useEffect } from 'react';

import { Button } from '@ui/button.ui';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@ui/card.ui';

import { Check, ChevronLeft, ChevronRight } from 'lucide-react';

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

    const goToNextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent any default form submission
        e.preventDefault();

        if (currentStep < steps.length) {
            onStepChange(currentStep + 1);
        }
    };

    const goToPreviousStep = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent any default form submission
        e.preventDefault();

        if (currentStep > 1) {
            onStepChange(currentStep - 1);
        }
    };

    const handleComplete = (e: React.MouseEvent<HTMLButtonElement>) => {
        // Prevent any default form submission
        e.preventDefault();

        // Add the final step to completed steps if not already done
        if (!completedSteps.includes(steps.length)) {
            setCompletedSteps((prev) => [...prev, steps.length]);
        }
        onComplete();
    };

    const isLastStep = currentStep === steps.length;
    const currentStepData = steps[currentStep - 1];

    return (
        <div className="space-y-8">
            {/* Progress Indicator */}
            <div className="flex justify-between">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = completedSteps.includes(stepNumber);

                    return (
                        <div
                            key={index}
                            className="flex w-full flex-col items-center"
                        >
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                                    isActive
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : isCompleted
                                          ? 'border-primary bg-primary text-primary-foreground'
                                          : 'border-muted bg-background text-muted-foreground'
                                }`}
                            >
                                {isCompleted ? (
                                    <Check className="h-5 w-5" />
                                ) : (
                                    <span>{stepNumber}</span>
                                )}
                            </div>
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
                            {index < steps.length - 1 && (
                                <div
                                    className={`mt-5 h-0.5 w-full ${
                                        isCompleted ? 'bg-primary' : 'bg-muted'
                                    }`}
                                ></div>
                            )}
                        </div>
                    );
                })}
            </div>

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
                        onClick={goToPreviousStep}
                        disabled={currentStep === 1 || isSubmitting}
                        type="button"
                    >
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        Previous
                    </Button>
                    <div className="flex gap-2">
                        {!isLastStep && (
                            <Button
                                onClick={goToNextStep}
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
