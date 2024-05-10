<!--------------------------------------------------------------------------------------------------------------------->

<template>
    <li
        tabindex="0"
        href="#"
        :class="textClasses"
        @keydown.tab="listItemBlur"
        @keydown.esc.stop.prevent="listItemBlur"
        @keydown.down.prevent
        @keydown.up.prevent
        @keyup.enter="hitActiveListItem"
        @keyup.down="selectNextListItem"
        @keyup.up="selectPreviousListItem"
        @blur="processFocusOut"
    >
        <div class="visually-hidden">
            {{ screenReaderText }}
        </div>
        <div aria-hidden="true">
            <slot name="suggestion" v-bind="{ data: data, htmlText: htmlText }">
                <span v-html="htmlText"></span>
            </slot>
        </div>
    </li>
</template>

<!--------------------------------------------------------------------------------------------------------------------->

<style scoped>
    li:not(.disabled) {
        cursor: pointer;
    }
    li.disabled {
        cursor: not-allowed;
        pointer-events: none;
    }
</style>

<!--------------------------------------------------------------------------------------------------------------------->

<script setup lang="ts">
    import { computed } from 'vue';

    //------------------------------------------------------------------------------------------------------------------
    // Component Definition
    //------------------------------------------------------------------------------------------------------------------

    interface Props {
        active ?: boolean;
        data ?: any;
        screenReaderText ?: string;
        htmlText ?: string;
        disabled ?: boolean;
        backgroundVariant ?: string;
        backgroundVariantResolver ?: (d : any) => string;
        textVariant ?: string;
    }

    const props = withDefaults(defineProps<Props>(), {
        data: {},
        disabled: false,
        backgroundVariantResolver: () => null
    });

    const emit = defineEmits<{
        listItemBlur : [],
        hitActiveListItem : [event: KeyboardEvent],
        selectNextListItem : [event: KeyboardEvent],
        selectPreviousListItem : [event: KeyboardEvent],
    }>();

    //------------------------------------------------------------------------------------------------------------------
    // Data
    //------------------------------------------------------------------------------------------------------------------

    const baseTextClasses = [ 'vbst-item', 'list-group-item', 'list-group-item-action' ];

    const textClasses = computed(() =>
    {
        const classes = [ ...baseTextClasses ];

        // Resolve the background variant
        const resolvedBackgroundVariant = props.backgroundVariantResolver(props.data);
        const backgroundVariant = resolvedBackgroundVariant?.trim?.() || props.backgroundVariant;

        // Add background variant class if it exists
        if(backgroundVariant)
        {
            classes.push(`list-group-item-${ backgroundVariant }`);
        }

        // Add text variant class if it exists
        if(props.textVariant)
        {
            classes.push(`text-${ props.textVariant }`);
        }

        // Add 'disabled' class if the prop is true
        if(props.disabled)
        {
            classes.push('disabled');
        }

        return classes.join(' ');
    });

    //------------------------------------------------------------------------------------------------------------------
    // Methods
    //------------------------------------------------------------------------------------------------------------------

    const processFocusOut = (evt) =>
    {
        const tgt = evt.relatedTarget;
        if(tgt && tgt.classList.contains('vbst-item'))
        {
            return;
        }

        emit('listItemBlur');
    };

    const listItemBlur = () =>
    {
        emit('listItemBlur');
    };

    const hitActiveListItem = (event) =>
    {
        emit('hitActiveListItem', event);
    };

    const selectNextListItem = (event) =>
    {
        emit('selectNextListItem', event);
    };

    const selectPreviousListItem = (event) =>
    {
        emit('selectPreviousListItem', event);
    };

    //------------------------------------------------------------------------------------------------------------------
    // Exports
    //------------------------------------------------------------------------------------------------------------------

    defineExpose({
        baseTextClasses
    });
</script>

<!--------------------------------------------------------------------------------------------------------------------->
