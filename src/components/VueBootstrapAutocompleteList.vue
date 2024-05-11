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
            @list-item-blur="resetActiveListItem"
            @hit-active-list-item="hitActiveListItem"
            @select-next-list-item="selectNextListItem"
            @select-previous-list-item="selectPreviousListItem"
            @click="handleHit(item, $event)"
        >
            <!-- eslint-disable-next-line vue/no-template-shadow -->
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
    import { ref, computed, watch } from 'vue';
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
        autoClose : boolean;
        isFocused : boolean;
    }

    const props = withDefaults(defineProps<Props>(), {
        query: '',
        backgroundVariant: '',
        backgroundVariantResolver: () => null,
        disableSort: false,
        textVariant: '',
        maxMatches: 10,
        minMatchingChars: 1,
        disabledValues: () => [],
        noResultsInfo: 'No results found',
        showOnFocus: false,
        showAllResults: false,
        highlightClass: 'vbt-matched-text',
        htmlText: '',
        autoClose: false,
        isFocused: false
    });

    const emit = defineEmits<{
        hit : [item : any],
        'update:isFocused' : [isFocused: boolean]
    }>();

    //------------------------------------------------------------------------------------------------------------------
    // Helpers
    //------------------------------------------------------------------------------------------------------------------

    function sanitize(text : string) : string
    {
        return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function escapeRegExp(str : string) : string
    {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    function isDisabledItem(item : any) : boolean
    {
        return props.disabledValues.includes(item.text);
    }

    //------------------------------------------------------------------------------------------------------------------
    // Data
    //------------------------------------------------------------------------------------------------------------------

    const activeListItem = ref(-1);

    const escapedQuery = computed(() =>
    {
        return escapeRegExp(sanitize(props.query));
    });

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

    const matchedItems = computed(() =>
    {
        if(!props.showOnFocus && (props.query.trim() === '' || props.query.length < props.minMatchingChars))
        {
            return [];
        }

        const re = new RegExp(props.showAllResults ? '' : escapedQuery.value, 'gi');

        return props.data
            .filter((i) => i.text.match(re) !== null)
            .sort((aItem, bItem) =>
            {
                if(props.disableSort) { return 0; }

                const aIndex = aItem.text.indexOf(aItem.text.match(re)[0]);
                const bIndex = bItem.text.indexOf(bItem.text.match(re)[0]);

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

    const actionableItems = computed(() =>
    {
        return matchedItems.value.filter((matchedItem) =>
        {
            return !isDisabledItem(matchedItem);
        });
    });

    const suggestionList = ref<HTMLElement | null>(null);

    //------------------------------------------------------------------------------------------------------------------
    // Methods
    //------------------------------------------------------------------------------------------------------------------

    function isListItemActive(id : number) : boolean
    {
        return activeListItem.value === id;
    }

    function handleHit(item : any, evt : MouseEvent) : void
    {
        emit('hit', item);
        evt.preventDefault();
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

        let nextActiveIndex = itemsToSearch.findIndex((obj, index) =>
        {
            return !isDisabledItem(obj) && index > currentSelectedItem;
        });

        if(nextActiveIndex === -1)
        {
            nextActiveIndex = itemsToSearch.findIndex((item) =>
            {
                return !isDisabledItem(item);
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

    function handleParentInputKeyup(evt : KeyboardEvent) : void
    {
        const key = evt.key?.toLowerCase();
        switch (key)
        {
            case 'arrowdown': // down arrow
                selectNextListItem();
                break;
            case 'arrowup': // up arrow
                selectPreviousListItem();
                break;
            case 'enter': // enter
                hitActiveListItem();
                break;
        }
    }

    //------------------------------------------------------------------------------------------------------------------
    // Watch
    //------------------------------------------------------------------------------------------------------------------

    watch(() => activeListItem.value, (newValue, oldValue) =>
    {
        if(!props.autoClose && !props.isFocused)
        {
            emit('update:isFocused', true);
        }

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
