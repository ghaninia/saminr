import React from 'react';
import { useAuth } from '../../application/auth/authContext.jsx';
import { useI18n } from '../../application/i18n/i18nContext.jsx';

export function HomePage() {
    const { user } = useAuth();
    const { t } = useI18n();

    return (
        <div>
            <div className="text-lg font-semibold">{t('home.welcome')}</div>
            <div className="mt-1 text-sm text-[color:var(--dash-muted)]">{t('home.signedInAs', { email: user?.email })}</div>
            <div className="mt-6 text-sm text-[color:var(--dash-muted)]">
                {t('home.description')}
            </div>
        </div>
    );
}
