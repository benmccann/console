<script lang="ts">
    import { page } from '$app/stores';
    import { Alert, Modal } from '$lib/components';
    import { InputText, InputEmail, Button, FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { organization } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { isCloud } from '$lib/system';
    import { plansInfo } from '$lib/stores/billing';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    const url = `${$page.url.origin}/invite`;
    $: plan = $plansInfo?.get($organization?.billingPlan);

    let email: string, name: string, error: string;

    async function create() {
        try {
            const team = await sdk.forConsole.teams.createMembership(
                $organization.$id,
                ['owner'],
                email,
                undefined,
                undefined,
                url,
                name || undefined
            );
            await invalidate(Dependencies.ACCOUNT);
            await invalidate(Dependencies.ORGANIZATION);
            await invalidate(Dependencies.MEMBERS);

            showCreate = false;
            addNotification({
                type: 'success',
                message: `Invite has been sent to ${email}`
            });
            trackEvent(Submit.MemberCreate);
            dispatch('created', team);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MemberCreate);
        }
    }

    $: if (!showCreate) {
        error = null;
        email = null;
        name = null;
    }
</script>

<Modal title="Invite Member" {error} size="big" bind:show={showCreate} onSubmit={create}>
    {#if isCloud}
        <Alert type="info">
            {#if $organization?.billingPlan === BillingPlan.SCALE}
                You can add unlimited organization members on the {plan.name} plan at no cost.
            {:else if $organization?.billingPlan === BillingPlan.PRO}
                You can add unlimited organization members on the {plan.name} plan for
                <b>${plan.addons.member.price} each per billing period</b>.
            {/if}
        </Alert>
    {/if}
    <FormList>
        <InputEmail
            required
            id="email"
            label="Email"
            placeholder="Enter email"
            autofocus={true}
            bind:value={email} />
        <InputText
            id="member-name"
            label="Name (optional)"
            placeholder="Enter name"
            bind:value={name} />
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit>Send invite</Button>
    </svelte:fragment>
</Modal>
