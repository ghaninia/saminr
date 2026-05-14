import React, { useEffect, useState } from 'react';
import { adminApi } from '../../infrastructure/http/adminApi.js';
import { useAuth } from '../../application/auth/authContext.jsx';
import { useI18n } from '../../application/i18n/i18nContext.jsx';
import { StatWidget } from '../../shared/ui/statWidget.jsx';
import { IconUsers, IconBox, IconStar, IconTag, IconMail } from '../../shared/ui/dashboardIcons.jsx';

export function HomePage() {
    const { user } = useAuth();
    const { t } = useI18n();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminApi
            .get('/dashboard/stats')
            .then((res) => {
                setStats(res.data?.data ?? null);
            })
            .catch(() => {
                // silent
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div>
            <div className="text-lg font-semibold">{t('home.welcome')}</div>
            <div className="mt-1 text-sm text-[color:var(--dash-muted)]">{t('home.signedInAs', { email: user?.email })}</div>
            <div className="mt-6 text-sm text-[color:var(--dash-muted)]">
                {t('home.description')}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                <StatWidget
                    icon={IconUsers}
                    label={t('home.stats.totalUsers')}
                    value={stats?.users?.total}
                    unit="users"
                    loading={loading}
                    color="blue"
                />
                <StatWidget
                    icon={IconBox}
                    label={t('home.stats.totalProducts')}
                    value={stats?.products?.total}
                    unit="products"
                    loading={loading}
                    color="emerald"
                />
                <StatWidget
                    icon={IconStar}
                    label={t('home.stats.totalReviews')}
                    value={stats?.reviews?.total}
                    unit="reviews"
                    loading={loading}
                    color="amber"
                />
                <StatWidget
                    icon={IconTag}
                    label={t('home.stats.totalCategories')}
                    value={stats?.categories?.total}
                    unit="categories"
                    loading={loading}
                    color="purple"
                />
                <StatWidget
                    icon={IconMail}
                    label={t('home.stats.totalSubscribers')}
                    value={stats?.subscribers?.total}
                    unit="subscribers"
                    loading={loading}
                    color="cyan"
                />
                <StatWidget
                    icon={IconUsers}
                    label={t('home.stats.activeUsers')}
                    value={stats?.users?.active}
                    unit="active"
                    loading={loading}
                    color="blue"
                />
            </div>
        </div>
    );
}
