<script lang="ts">
    import { Card } from './';

    export let danger = false;
    export let hideOverflow = false;
</script>

<Card {danger}>
    <div class="common-section grid-1-2" class:hideOverflow>
        <div class="grid-1-2-col-1 u-flex u-flex-vertical u-gap-16">
            <slot />
        </div>
        <div class="grid-1-2-col-2 u-flex u-flex-vertical u-gap-16 u-min-width-0">
            <slot name="aside" />
        </div>
    </div>
    {#if $$slots.actions}
        <div class="common-section card-separator u-flex u-main-end">
            <slot name="actions" />
        </div>
    {/if}
</Card>

<style lang="scss">
    .hideOverflow > * {
        width: 100%;
        overflow: hidden;
    }
</style>
