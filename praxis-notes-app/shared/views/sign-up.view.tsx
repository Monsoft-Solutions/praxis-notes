import { ReactElement } from 'react';
import { useNavigate } from '@tanstack/react-router';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
    signUpFormSchema,
    type SignUpForm as SignUpFormType,
} from '@auth/schemas';

import { SignUpForm } from '@shared/components/sign-up-form.component';
import { api } from '@api/providers/web';
import { toast } from 'sonner';
// Sign up view
// Render sign up form
export function SignUpView(): ReactElement {
    const navigate = useNavigate();

    const { mutateAsync: signUp } = api.auth.signUp.useMutation();

    const form = useForm<SignUpFormType>({
        resolver: zodResolver(signUpFormSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
        },
    });

    const handleSubmit = async (data: SignUpFormType) => {
        console.log(data);

        const { error } = await signUp(data);

        if (error) {
            toast.error('Error signing up');
        }

        toast.success('Signed up successfully');

        await navigate({ to: '/auth/waiting-email-verification' });
    };

    return (
        <div className="grid h-screen items-center justify-center">
            <SignUpForm
                form={form}
                onSubmit={(data) => void handleSubmit(data)}
            />
        </div>
    );
}
