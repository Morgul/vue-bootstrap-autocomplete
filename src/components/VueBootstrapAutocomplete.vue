<template>
    <div
        :id="`typeahead-${id}`"
        role="combobox"
        aria-haspopup="listbox"
        :aria-owns="`result-list-${id}`"
        :aria-expanded="isFocused && data.length > 0 ? 'true' : 'false'"
    >
        <div :class="inputGroupClasses">
            <div
                v-if="$slots.prepend || prepend"
                ref="prependDiv"
                class="input-group-prepend"
            >
                <slot name="prepend">
                    <span class="input-group-text">{{ prepend }}</span>
                </slot>
            </div>
            <input
                :id="`typeahead-input-${id}`"
                ref="inputRef"
                type="text"
                role="searchbox"
                :class="[ 'form-control', inputClass, state !== null && { 'is-invalid': state === false, 'is-valid': state === true } ]"
                :aria-labelledby="ariaLabelledBy"
                aria-multiline="false"
                aria-autocomplete="list"
                :aria-controls="`result-list-${id}`"
                :aria-activedescendant="`selected-option-${id}`"
                :name="inputName"
                :placeholder="placeholder"
                :aria-label="!ariaLabelledBy ? placeholder : null"
                :value="inputValue"
                :disabled="disabled"
                @focus="handleFocus"
                @blur="handleFocusOut"
                @input="handleInput($event.target.value)"
                @keydown.esc="handleEsc($event.target.value)"
                @keyup="handleKeyUp($event)"
                @paste="$emit('paste', $event)"
            ></input>
            <div v-if="$slots.append || append" class="input-group-append">
                <slot name="append">
                    <span class="input-group-text">{{ append }}</span>
                </slot>
            </div>
        </div>
        <VueBootstrapAutocompleteList
            v-show="isFocused && (data.length > 0 || !!$slots.noResultsInfo || !!noResultsInfo)"
            :id="`result-list-${id}`"
            ref="listRef"
            v-model:is-focused="isFocused"
            class="vbt-autocomplete-list"
            :query="inputValue"
            :data="formattedData"
            :background-variant="backgroundVariant"
            :background-variant-resolver="backgroundVariantResolver"
            :text-variant="textVariant"
            :max-matches="maxMatches"
            :min-matching-chars="minMatchingChars"
            :no-results-info="noResultsInfo"
            :disable-sort="disableSort"
            :show-on-focus="showOnFocus"
            :show-all-results="showAllResults"
            :highlight-class="highlightClass"
            :disabled-values="disabledValues"
            :vbt-unique-id="id"
            role="listbox"
            :auto-close="autoClose"
            @hit="handleHit"
            @list-item-blur="handleChildBlur"
        >
            <!-- pass down all scoped slots -->
            <!-- eslint-disable-next-line vue/no-template-shadow -->
            <template v-for="(slot, slotName) in $slots" #[slotName]="{ data, htmlText }">
                <slot :name="slotName" v-bind="{ data, htmlText }"></slot>
            </template>
            <!-- below is the right solution, however if the user does not provide a scoped slot, vue will still set $slots.suggestion to a blank scope
            <template v-if="$slots.suggestion" slot="suggestion" slot-scope="{ data, htmlText }">
                <slot name="suggestion" v-bind="{ data, htmlText }" />
            </template>-->
        </VueBootstrapAutocompleteList>
    </div>
</template>

<style scoped>
    .vbt-autocomplete-list {
        padding-top: 5px;
        position: absolute;
        max-height: 350px;
        -ms-overflow-style: -ms-autohiding-scrollbar;
        overflow-y: auto;
        z-index: 999;
    }
    .vbt-autocomplete-list:deep(.vbt-matched-text) {
        font-weight: bold;
    }
</style>

<script setup lang="ts">
    import { ref, computed, watch, onBeforeUnmount, onMounted } from 'vue';
    import VueBootstrapAutocompleteList from './VueBootstrapAutocompleteList.vue';
    import ResizeObserver from 'resize-observer-polyfill';

    //------------------------------------------------------------------------------------------------------------------
    // Component Definition
    //------------------------------------------------------------------------------------------------------------------

    interface Props {
        ariaLabelledBy ?: string;
        size ?: string;
        modelValue ?: string;
        disabled ?: boolean;
        data : any[];
        serializer ?: (d : any) => string;
        screenReaderTextSerializer ?: (d : any) => string;
        backgroundVariant ?: string;
        backgroundVariantResolver ?: (d : any) => string;
        disabledValues ?: any[];
        textVariant ?: string;
        inputClass ?: string;
        inputName ?: string;
        maxMatches ?: number;
        minMatchingChars ?: number;
        disableSort ?: boolean;
        noResultsInfo ?: string;
        showOnFocus ?: boolean;
        showAllResults ?: boolean;
        autoClose ?: boolean;
        ieCloseFix ?: boolean;
        placeholder ?: string;
        prepend ?: string;
        append ?: string;
        highlightClass ?: string;
        state ?: boolean;
    }

    const props = withDefaults(defineProps<Props>(), {
        modelValue: null,
        ariaLabelledBy: '',
        size: null,
        disabled: false,
        serializer: (text) => `${ text }`,
        screenReaderTextSerializer: null,
        backgroundVariant: null,
        backgroundVariantResolver: () => null,
        disabledValues: () => [],
        textVariant: null,
        inputClass: null,
        inputName: null,
        maxMatches: 10,
        minMatchingChars: 1,
        disableSort: false,
        noResultsInfo: null,
        showOnFocus: false,
        showAllResults: false,
        autoClose: true,
        ieCloseFix: false,
        placeholder: 'Search',
        prepend: null,
        append: null,
        highlightClass: 'vbt-matched-text',
        state: null
    });

    const emit = defineEmits<{
        hit : [value: any];
        input : [value: string];
        keyup : [value: KeyboardEvent];
        focus : [value: Event];
        blur : [value: FocusEvent];
        paste : [value: ClipboardEvent];
        'update:model-value' : [value: string];
    }>();

    //------------------------------------------------------------------------------------------------------------------
    // Helpers
    //------------------------------------------------------------------------------------------------------------------

    function _screenReaderTextSerializer(item)
    {
        if(typeof item === 'object' && !Array.isArray(item) && item !== null)
        {
            if(props.screenReaderTextSerializer)
            {
                return props.screenReaderTextSerializer(item);
            }
            else
            {
                return props.serializer(item);
            }
        }
        else
        {
            return item;
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Data
    //------------------------------------------------------------------------------------------------------------------

    const id = computed(() => Math.floor(Math.random() * 100000));

    const inputGroupClasses = computed(() =>
    {
        return props.size
            ? `input-group input-group-${ props.size }`
            : 'input-group';
    });

    const formattedData = computed(() =>
    {
        if(!(props.data instanceof Array))
        {
            return [];
        }
        return props.data.map((dataItem, idx) =>
        {
            return {
                id: idx,
                data: dataItem,
                screenReaderText: _screenReaderTextSerializer(dataItem),
                text: props.serializer(dataItem)
            };
        });
    });

    const isFocused = ref(false);
    const inputValue = ref(props.modelValue || '');

    const inputRef = ref<HTMLInputElement | null>(null);
    const listRef = ref<InstanceType<typeof VueBootstrapAutocompleteList> | null>(null);
    const prependDiv = ref<HTMLDivElement | null>(null);

    // This doesn't need to be reactive.
    let resizeObserver : ResizeObserver | null = null;

    //------------------------------------------------------------------------------------------------------------------
    // Methods
    //------------------------------------------------------------------------------------------------------------------

    function resizeList(el)
    {
        const rect = el.getBoundingClientRect();
        const listStyle = listRef.value.$el.style;

        // Set the width of the list on resize
        listStyle.width = `${ rect.width }px`;

        // Set the margin when the prepend prop or slot is populated
        // (setting the "left" CSS property doesn't work)
        if(prependDiv.value)
        {
            const prependRect = prependDiv.value.getBoundingClientRect();
            listStyle.marginLeft = `${ prependRect.width }px`;
        }
    }

    function handleKeyUp(evt)
    {
        listRef.value.handleParentInputKeyup(evt);
        emit('keyup', evt);
    }

    function handleHit(evt)
    {
        if(typeof props.modelValue !== 'undefined')
        {
            emit('update:model-value', evt.text);
        }

        inputValue.value = evt.text;
        emit('hit', evt.data);

        if(props.autoClose)
        {
            inputRef.value.blur();
            isFocused.value = false;
        }
    }

    function handleChildBlur()
    {
        inputRef.value.focus();
        isFocused.value = false;
    }

    function runFocusOut(tgt)
    {
        if(tgt && tgt.classList.contains('vbst-item'))
        {
            return;
        }

        if(listRef.value.$el.matches(':hover'))
        {
            return;
        }

        isFocused.value = false;
        emit('blur', tgt);
    }

    function handleFocusOut(evt)
    {
        const tgt = evt.relatedTarget;
        if(!!navigator.userAgent.match(/Trident.*rv:11\./) && props.ieCloseFix)
        {
            setTimeout(() => { runFocusOut(tgt); }, 300);
        }
        else
        {
            runFocusOut(tgt);
        }
    }

    function handleFocus(event)
    {
        emit('focus', event);
        isFocused.value = true;
    }

    function handleInput(newValue)
    {
        isFocused.value = true;
        inputValue.value = newValue;

        listRef.value.resetActiveListItem();

        // If v-model is being used, emit an input event
        if(typeof props.modelValue !== 'undefined')
        {
            emit('update:model-value', newValue);
        }
    }

    function handleEsc(input)
    {
        if(input === '')
        {
            inputRef.value.blur();
            isFocused.value = false;
        }
        else
        {
            inputValue.value = '';
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Lifecycle Hooks
    //------------------------------------------------------------------------------------------------------------------

    onMounted(() =>
    {
        resizeObserver = new ResizeObserver(() =>
        {
            resizeList(inputRef.value);
        });
        resizeObserver.observe(inputRef.value);
        resizeObserver.observe(listRef.value.$el);
    });

    onBeforeUnmount(() =>
    {
        resizeObserver?.disconnect();
    });

    //------------------------------------------------------------------------------------------------------------------
    // Watch
    //------------------------------------------------------------------------------------------------------------------

    watch(() => props.modelValue, (val) =>
    {
        inputValue.value = val;
    });

    //------------------------------------------------------------------------------------------------------------------
    // Exports
    //------------------------------------------------------------------------------------------------------------------

    defineExpose({
        handleKeyUp,
        handleHit,
        handleChildBlur,
        handleFocusOut,
        handleInput,
        handleEsc
    });
</script>
