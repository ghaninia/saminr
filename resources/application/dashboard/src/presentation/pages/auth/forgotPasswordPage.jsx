import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authRepository } from '../../../infrastructure/auth/authRepository.js';
import { getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';
import { Button } from '../../../shared/ui/button.jsx';
import { Card } from '../../../shared/ui/card.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { ThemeToggle } from '../../../shared/ui/themeToggle.jsx';
import { useI18n } from '../../../application/i18n/i18nContext.jsx';

export function ForgotPasswordPage() {
    const navigate = useNavigate();
    const { t } = useI18n();
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    return (
        <div className="dash-bg min-h-screen grid place-items-center px-4">
            <Card className="w-full max-w-md p-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <div className="text-lg font-semibold">{t('auth.resetPassword')}</div>
                        <div className="mt-1 text-sm text-[color:var(--dash-muted)]">{t('auth.resetPasswordHint')}</div>
                    </div>
                    <ThemeToggle />
                </div>

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
                    <Field label={t('auth.email')}>
                        <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </Field>

                    {message ? <div className="text-sm text-emerald-400">{message}</div> : null}
                    {error ? <div className="text-sm text-red-400">{error}</div> : null}

                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? t('auth.sending') : t('auth.sendResetLink')}
                    </Button>

                    <div className="text-sm text-[color:var(--dash-muted)]">
                        <button
                            type="button"
                            className="underline hover:text-[color:var(--dash-fg)]"
                            onClick={() => navigate('/login')}
                        >
                            {t('auth.backToSignIn')}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
