import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authRepository } from '../../../infrastructure/auth/authRepository.js';
import { getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Card } from '../../../shared/ui/card.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    return (
        <div className="dash-bg min-h-screen text-neutral-100 grid place-items-center px-4">
            <Card className="w-full max-w-md p-6">
                <div className="text-lg font-semibold">Reset password</div>
                <div className="mt-1 text-sm text-neutral-400">We will email you a reset link.</div>

                <form
                    className="mt-6 space-y-3"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setSubmitting(true);
                        setMessage('');
                        setError('');

                        try {
                            const text = await authRepository.forgotPassword(email);
                            setMessage(text);
                        } catch (err) {
                            setError(getApiErrorMessage(err, 'Unable to request password reset.'));
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    <Field label="Email">
                        <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </Field>

                    {message ? <div className="text-sm text-emerald-400">{message}</div> : null}
                    {error ? <div className="text-sm text-red-400">{error}</div> : null}

                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? 'Sending…' : 'Send reset link'}
                    </Button>

                    <div className="text-sm text-neutral-400">
                        <button type="button" className="underline hover:text-neutral-200" onClick={() => navigate('/login')}>
                            Back to sign in
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
