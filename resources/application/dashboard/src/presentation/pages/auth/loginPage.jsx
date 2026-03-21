import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../application/auth/authContext.jsx';
import { Button } from '../../../shared/ui/button.jsx';
import { Card } from '../../../shared/ui/card.jsx';
import { Field } from '../../../shared/ui/field.jsx';
import { Input } from '../../../shared/ui/input.jsx';
import { getApiErrorMessage } from '../../../infrastructure/http/adminApi.js';

export function LoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) navigate('/', { replace: true });
    }, [user, navigate]);

    return (
        <div className="dash-bg min-h-screen text-neutral-100 grid place-items-center px-4">
            <Card className="w-full max-w-md p-6">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-neutral-800 grid place-items-center text-xs tracking-wider text-neutral-200">
                        ADM
                    </div>
                    <div>
                        <div className="text-lg font-semibold">Sign in</div>
                        <div className="mt-0.5 text-sm text-neutral-400">Admin access only.</div>
                    </div>
                </div>

                <form
                    className="mt-6 space-y-3"
                    onSubmit={async (e) => {
                        e.preventDefault();
                        setSubmitting(true);
                        setError('');

                        try {
                            await login(email, password);
                            const from = location.state?.from ?? '/';
                            navigate(from, { replace: true });
                        } catch (err) {
                            setError(getApiErrorMessage(err, 'Unable to sign in.'));
                        } finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    <Field label="Email">
                        <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </Field>
                    <Field label="Password">
                        <Input
                            type="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Field>

                    {error ? <div className="text-sm text-red-400">{error}</div> : null}

                    <Button type="submit" disabled={submitting} className="w-full">
                        {submitting ? 'Signing in…' : 'Sign in'}
                    </Button>

                    <div className="text-sm text-neutral-400 flex items-center justify-between">
                        <Link className="underline hover:text-neutral-200" to="/forgot-password">
                            Forgot password?
                        </Link>
                        <div className="text-xs text-neutral-500">v1</div>
                    </div>
                </form>
            </Card>
        </div>
    );
}
