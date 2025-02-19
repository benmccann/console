import { Dependencies } from '$lib/constants';
import { failedInvoice } from '$lib/stores/billing';
import { isCloud } from '$lib/system';
import { sdk } from '$lib/stores/sdk';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import Breadcrumbs from './breadcrumbs.svelte';
import Header from './header.svelte';
import { headerAlert } from '$lib/stores/headerAlert';
import ProjectsAtRisk from '$lib/components/billing/alerts/projectsAtRisk.svelte';
import { get } from 'svelte/store';
import { preferences } from '$lib/stores/preferences';

export const load: LayoutLoad = async ({ params, depends }) => {
    depends(Dependencies.ORGANIZATION);
    depends(Dependencies.MEMBERS);
    depends(Dependencies.PAYMENT_METHODS);

    if (isCloud) {
        await failedInvoice.load(params.organization);

        if (!get(failedInvoice)) {
            headerAlert.add({
                show: true,
                component: ProjectsAtRisk,
                id: 'projectsAtRisk',
                importance: 1
            });
        }
    }

    try {
        const prefs = await sdk.forConsole.account.getPrefs();
        const newPrefs = { ...prefs, organization: params.organization };
        sdk.forConsole.account.updatePrefs(newPrefs);
        preferences.loadTeamPrefs(params.organization);
        return {
            header: Header,
            breadcrumbs: Breadcrumbs,
            organization: await sdk.forConsole.teams.get(params.organization),
            members: await sdk.forConsole.teams.listMemberships(params.organization)
        };
    } catch (e) {
        const prefs = await sdk.forConsole.account.getPrefs();
        const newPrefs = { ...prefs, organization: null };
        sdk.forConsole.account.updatePrefs(newPrefs);
        localStorage.removeItem('organization');
        throw error(e.code, e.message);
    }
};
