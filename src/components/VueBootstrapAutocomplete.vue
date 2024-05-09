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
                ref="input"
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
                @focus="isFocused = true"
                @blur="handleFocusOut"
                @input="handleInput($event.target.value)"
                @keydown.esc="handleEsc($event.target.value)"
                @keyup="handleKeyUp($event)"
                @paste="$emit('paste', $event)"
            />
            <div v-if="$slots.append || append" class="input-group-append">
                <slot name="append">
                    <span class="input-group-text">{{ append }}</span>
                </slot>
            </div>
        </div>
        <vue-bootstrap-autocomplete-list
            v-show="isFocused && (data.length > 0 || !!$slots.noResultsInfo || !!noResultsInfo)"
            :id="`result-list-${id}`"
            ref="list"
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
            @hit="handleHit"
            @list-item-blur="handleChildBlur"
        >
            <!-- pass down all scoped slots -->
            <template v-for="(slot, slotName) in $slots" #[slotName]="{ data, htmlText }">
                <slot :name="slotName" v-bind="{ data, htmlText }"></slot>
            </template>
            <!-- below is the right solution, however if the user does not provide a scoped slot, vue will still set $slots.suggestion to a blank scope
      <template v-if="$slots.suggestion" slot="suggestion" slot-scope="{ data, htmlText }">
        <slot name="suggestion" v-bind="{ data, htmlText }" />
      </template>-->
        </vue-bootstrap-autocomplete-list>
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
.vbt-autocomplete-list >>> .vbt-matched-text {
  font-weight: bold;
}
</style>

<script lang="ts">
    import VueBootstrapAutocompleteList from './VueBootstrapAutocompleteList.vue';
    import ResizeObserver from 'resize-observer-polyfill';

    export default {
        name: 'VueBootstrapAutocomplete',

        components: {
            VueBootstrapAutocompleteList
        },

        props: {
            ariaLabelledBy: {
                type: String,
                default: null
            },
            size: {
                type: String,
                default: null,
                validator: (size : string) => [ 'lg', 'md', 'sm' ].indexOf(size) > -1
            },
            modelValue: String,
            disabled: {
                type: Boolean,
                default: false
            },
            data: {
                type: Array,
                required: true,
                validator: (d) => d instanceof Array
            },
            serializer: {
                type: Function,
                default: (d) => d,
                validator: (d) => d instanceof Function
            },
            // Don't call this method, use _screenReaderTextSerializer()
            // Using _screenReaderTextSerializer allows for defaulting based on .serializer
            screenReaderTextSerializer: {
                type: Function,
                validator: (d) => d instanceof Function
            },
            backgroundVariant: String,
            backgroundVariantResolver: {
                type: Function,
                default: (d) => d,
                validator: (d) => d instanceof Function
            },
            disabledValues: {
                type: Array,
                default: () => []
            },
            textVariant: String,
            inputClass: {
                type: String,
                default: ''
            },
            inputName: {
                type: String,
                default: undefined
            },
            maxMatches: {
                type: Number,
                default: 10
            },
            minMatchingChars: {
                type: Number,
                default: 2
            },
            disableSort: {
                type: Boolean,
                default: false
            },
            noResultsInfo: {
                type: String
            },
            showOnFocus: {
                type: Boolean,
                default: false
            },
            showAllResults: {
                type: Boolean,
                default: false
            },
            autoClose: {
                type: Boolean,
                default: true
            },
            ieCloseFix: {
                type: Boolean,
                default: true
            },
            placeholder: String,
            prepend: String,
            append: String,
            highlightClass: String,
            state: {
                type: Boolean,
                default: null
            }
        },
        emits: [ 'hit', 'input', 'keyup', 'focus', 'blur', 'paste', 'update:model-value' ],

        data() 
        {
            return {
                isFocused: false,
                inputValue: this.modelValue || ''
            };
        },

        computed: {
            id() 
            {
                return Math.floor(Math.random() * 100000);
            },
            inputGroupClasses() 
            {
                return this.size ? `input-group input-group-${ this.size }` : 'input-group';
            },

            formattedData() 
            {
                if(!(this.data instanceof Array)) 
                {
                    return [];
                }
                return this.data.map((d, i) => 
                {
                    return {
                        id: i,
                        data: d,
                        screenReaderText: this._screenReaderTextSerializer(d),
                        text: this.serializer(d)
                    };
                });
            }
        },

        watch: {
            value (val) 
            {
                this.inputValue = val;
            }
        },

        mounted() 
        {
            this.$_ro = new ResizeObserver((e) => 
            {
                this.resizeList(this.$refs.input);
            });
            this.$_ro.observe(this.$refs.input);
            this.$_ro.observe(this.$refs.list.$el);
        },

        beforeUnmount() 
        {
            this.$_ro.disconnect();
        },

        methods: {
            _screenReaderTextSerializer(d) 
            {
                if(typeof d === 'object' && !Array.isArray(d) && d !== null) 
                {
                    if(this.screenReaderTextSerializer) 
                    {
                        return this.screenReaderTextSerializer(d);
                    }
                    else 
                    {
                        return this.serializer(d);
                    }
                }
                else 
                {
                    return d;
                }
            },
            resizeList(el) 
            {
                const rect = el.getBoundingClientRect();
                const listStyle = this.$refs.list.$el.style;

                // Set the width of the list on resize
                listStyle.width = `${ rect.width }px`;

                // Set the margin when the prepend prop or slot is populated
                // (setting the "left" CSS property doesn't work)
                if(this.$refs.prependDiv) 
                {
                    const prependRect = this.$refs.prependDiv.getBoundingClientRect();
                    listStyle.marginLeft = `${ prependRect.width }px`;
                }
            },

            handleKeyUp(evt) 
            {
                this.$refs.list.handleParentInputKeyup(evt);
                this.$emit('keyup', evt);
            },

            handleHit(evt) 
            {
                if(typeof this.modelValue !== 'undefined') 
                {
                    this.$emit('update:model-value', evt.text);
                }

                this.inputValue = evt.text;
                this.$emit('hit', evt.data);

                if(this.autoClose) 
                {
                    this.$refs.input.blur();
                    this.isFocused = false;
                }
            },

            handleChildBlur() 
            {
                this.$refs.input.focus();
                this.isFocused = false;
            },

            runFocusOut(tgt) 
            {
                if(tgt && tgt.classList.contains('vbst-item')) 
                {
                    return;
                }

                if(this.$refs.list.$el.matches(':hover')) 
                {
                    return;
                }

                this.isFocused = false;
            },

            handleFocusOut(evt) 
            {
                const tgt = evt.relatedTarget;
                if(!!navigator.userAgent.match(/Trident.*rv:11\./) && this.ieCloseFix) 
                {
                    setTimeout(() => { this.runFocusOut(tgt); }, 300);
                }
                else 
                {
                    this.runFocusOut(tgt);
                }
            },

            handleInput(newValue) 
            {
                this.isFocused = true;
                this.inputValue = newValue;

                this.$refs.list.resetActiveListItem();

                // If v-model is being used, emit an input event
                if(typeof this.modelValue !== 'undefined') 
                {
                    this.$emit('update:model-value', newValue);
                }
            },

            handleEsc(inputValue) 
            {
                if(inputValue === '') 
                {
                    this.$refs.input.blur();
                    this.isFocused = false;
                }
                else 
                {
                    this.inputValue = '';
                }
            }
        }
    };
</script>
