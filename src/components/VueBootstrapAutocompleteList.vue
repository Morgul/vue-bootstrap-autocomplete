<template>
    <ul ref="suggestionList" class="list-group shadow">
        <VueBootstrapAutocompleteListItem
            v-for="(item, id) in matchedItems"
            :id="isListItemActive(id) ? `selected-option-${vbtUniqueId}` : false"
            :key="id"
            :active="isListItemActive(id)"
            :data="item.data"
            :html-text="highlight(item.text)"
            role="option"
            :aria-selected="isListItemActive(id) ? 'true' : 'false'"
            :screen-reader-text="item.screenReaderText ? item.screenReaderText : item.text"
            :disabled="isDisabledItem(item)"
            :background-variant="backgroundVariant"
            :background-variant-resolver="backgroundVariantResolver"
            :text-variant="textVariant"
            v-bind="$attrs"
            @click.native="handleHit(item, $event)"
        >
            <template v-if="$slots.suggestion" #suggestion="{ data, htmlText }">
                <slot name="suggestion" v-bind="{ data, htmlText }"></slot>
            </template>
        </VueBootstrapAutocompleteListItem>
        <li
            v-if="matchedItems.length === 0 && (!!$slots.noResultsInfo || !!noResultsInfo)"
            id="noResultsInfo"
            class="vbst-item list-group-item list-group-item-action disabled"
            tabindex="-1"
            disabled="disabled"
            aria-selected="false"
        >
            <template v-if="$slots.noResultsInfo">
                <slot name="noResultsInfo" v-bind="{ data, htmlText }"></slot>
            </template>
            <template v-else>
                {{ noResultsInfo }}
            </template>
        </li>
    </ul>
</template>

<script setup lang="ts">
    import { ref, computed, defineProps, defineEmits, defineExpose, getCurrentInstance, watch } from 'vue';
    import VueBootstrapAutocompleteListItem from './VueBootstrapAutocompleteListItem.vue';

    //------------------------------------------------------------------------------------------------------------------
    // Component Definition
    //------------------------------------------------------------------------------------------------------------------

    interface Props {
        data : any[];
        query ?: string;
        vbtUniqueId : number;
        backgroundVariant ?: string;
        backgroundVariantResolver ?: (d : any) => string;
        disableSort ?: boolean;
        textVariant ?: string;
        maxMatches ?: number;
        minMatchingChars ?: number;
        disabledValues ?: any[];
        noResultsInfo ?: string;
        showOnFocus ?: boolean;
        showAllResults ?: boolean;
        highlightClass ?: string;
        htmlText ?: string;
    }

    const props = withDefaults(defineProps<Props>(), {
        query: '',
        backgroundVariant: '',
        backgroundVariantResolver: () => null,
        disableSort: false,
        textVariant: '',
        maxMatches: 10,
        minMatchingChars: 1,
        noResultsInfo: 'No results found',
        showOnFocus: false,
        showAllResults: false,
        highlightClass: 'vbt-matched-text',
        htmlText: '',

        // @ts-expect-error - TS doesn't like this, but it's correct
        disabledValues: []
    });

    const emit = defineEmits([ 'hit' ]);

    //------------------------------------------------------------------------------------------------------------------
    // Data
    //------------------------------------------------------------------------------------------------------------------

    const activeListItem = ref(-1);
    const vm = getCurrentInstance();

    const highlight = computed(() =>
    {
        return (text : string) =>
        {
            text = sanitize(text);
            if(props.query.length === 0)
            {
                return text;
            }

            const re = new RegExp(props.showAllResults ? '' : escapedQuery.value, 'gi');
            return text.replace(
                re,
                `<span class='${ props.highlightClass }'>$&</span>`
            );
        };
    });

    const escapedQuery = computed(() =>
    {
        return escapeRegExp(sanitize(props.query));
    });

    const actionableItems = computed(() =>
    {
        return matchedItems.value.filter((matchedItem) =>
        {
            return !isDisabledItem(matchedItem);
        });
    });

    const matchedItems = computed(() =>
    {
        if(!props.showOnFocus && (props.query.trim() === '' || props.query.length < props.minMatchingChars))
        {
            return [];
        }

        const re = new RegExp(props.showAllResults ? '' : escapedQuery.value, 'gi');

        return props.data
            .filter((i) => i.text.match(re) !== null)
            .sort((a, b) =>
            {
                if(props.disableSort) { return 0; }

                const aIndex = a.text.indexOf(a.text.match(re)[0]);
                const bIndex = b.text.indexOf(b.text.match(re)[0]);

                if(aIndex < bIndex)
                {
                    return -1;
                }
                if(aIndex > bIndex)
                {
                    return 1;
                }
                return 0;
            })
            .slice(0, props.maxMatches);
    });

    const suggestionList = ref<HTMLElement | null>(null);

    //------------------------------------------------------------------------------------------------------------------
    // Methods
    //------------------------------------------------------------------------------------------------------------------

    function sanitize(text : string) : string
    {
        return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function escapeRegExp(str : string) : string
    {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function handleParentInputKeyup(e : KeyboardEvent) : void
    {
        switch (e.key)
        {
            case 'ArrowDown': // down arrow
                selectNextListItem();
                break;
            case 'ArrowUp': // up arrow
                selectPreviousListItem();
                break;
            case 'Enter': // enter
                hitActiveListItem();
                break;
        }
    }

    function handleHit(item : any, evt : MouseEvent) : void
    {
        emit('hit', item);
        evt.preventDefault();
    }

    function hitActiveListItem() : void
    {
        if(activeListItem.value < 0)
        {
            selectNextListItem();
        }
        if(activeListItem.value >= 0)
        {
            emit('hit', matchedItems.value[activeListItem.value]);
        }
    }

    function isDisabledItem(item : any) : boolean
    {
        return props.disabledValues.includes(item.text);
    }

    function isListItemActive(id : number) : boolean
    {
        return activeListItem.value === id;
    }

    function resetActiveListItem() : void
    {
        activeListItem.value = -1;
    }

    function findIndexForNextActiveItem(itemsToSearch ?: any[], currentSelectedItem ?: any) : number
    {
        if(!itemsToSearch)
        {
            itemsToSearch = matchedItems.value;
        }
        if(currentSelectedItem === undefined)
        {
            currentSelectedItem = activeListItem.value;
        }

        let nextActiveIndex = itemsToSearch.findIndex((o, index) =>
        {
            return !isDisabledItem(o) && index > currentSelectedItem;
        });

        if(nextActiveIndex === -1)
        {
            nextActiveIndex = itemsToSearch.findIndex((o) =>
            {
                return !isDisabledItem(o);
            });
        }

        return nextActiveIndex;
    }

    function selectNextListItem() : boolean
    {
        if(actionableItems.value.length <= 0)
        {
            activeListItem.value = -1;
            return true;
        }

        activeListItem.value = findIndexForNextActiveItem();

        return false;
    }

    function selectPreviousListItem() : boolean
    {
        if(actionableItems.value.length <= 0)
        {
            activeListItem.value = -1;
            return true;
        }
        else if(activeListItem.value === 0)
        {
            activeListItem.value = -1;
        }

        const reversedList = [ ...matchedItems.value ].reverse();
        const currentReversedIndex = matchedItems.value.length - 1 - activeListItem.value;
        const nextReverseIndex = findIndexForNextActiveItem(
            reversedList,
            currentReversedIndex
        );

        activeListItem.value = matchedItems.value.length - 1 - nextReverseIndex;

        return false;
    }

    //------------------------------------------------------------------------------------------------------------------
    // Exports
    //------------------------------------------------------------------------------------------------------------------

    watch(() => activeListItem.value, (newValue, oldValue) =>
    {
        // TODO: Find a better way to get the type right here (or even better, don't use parent!)
        // const autoClose = (vm.parent as any).autoClose;
        // const isFocused = (vm.parent as any).isFocused;
        //
        // if(!autoClose.value && !isFocused.value)
        // {
        //     isFocused.value = true;
        // }

        if(newValue >= 0)
        {
            const scrollContainer = suggestionList.value;
            const listItem = scrollContainer.children[activeListItem.value];
            const scrollContainerHeight = scrollContainer.clientHeight;
            const listItemHeight = listItem.clientHeight;
            const visibleItems = Math.floor(scrollContainerHeight / (listItemHeight + 20));
            if(newValue >= visibleItems)
            {
                scrollContainer.scrollTop = listItemHeight * activeListItem.value;
            }
            else
            {
                scrollContainer.scrollTop = 0;
            }

            (listItem as HTMLElement).focus();
        }
    });

    //------------------------------------------------------------------------------------------------------------------
    // Exports
    //------------------------------------------------------------------------------------------------------------------

    defineExpose({
        handleParentInputKeyup,
        handleHit,
        hitActiveListItem,
        isDisabledItem,
        isListItemActive,
        resetActiveListItem,
        selectNextListItem,
        selectPreviousListItem
    });
</script>
