<script lang="ts" setup>
    import '~bootstrap/scss/bootstrap.scss'

    import { reactive } from 'vue'
    import VueBootstrapAutocomplete from '@/library/components/VueBootstrapAutocomplete.vue';

    const state = reactive({query : ''})
</script>

<template>
    <div class="container">
        <div class="p-5 mb-4">
            <div class="container-fluid py-5">
                <h1 class="display-4 text-center">Vue Bootstrap Autocomplete</h1>
                <p class="offset-2 col-md-8 fs-2 text-center text-muted">
                    A simple autocomplete component for Vue 3 using Bootstrap 5
                </p>
            </div>
        </div>

        <hr>
        <div class="row mt-4 mb-5">
            <div class="col">
                <h3>BootstrapVue Compatible</h3>
                <p class="text-muted">
                    Works with the popular BootstrapVue bootstrap wrapper. (Also works with BootstrapVueNext.)
                </p>
            </div>
            <div class="col">
                <h3>Configurable</h3>
                <p class="text-muted">
                    Can be configured for many different use cases.
                </p>
            </div>
            <div class="col">
                <h3>Works well with JSON API's</h3>
                <p class="text-muted">
                    Easy to integrate with any JSON based API's.
                </p>
            </div>
        </div>

        <h4 class="mt-5">Try It Out:</h4>

        <div class="ps-1 pb-2 pt-3">Selected Country: {{state.query}}</div>
        <VueBootstrapAutocomplete
            v-model="state.query"
            class="mb-4"
            placeholder="search"
            :data="['Canada', 'United States', 'Mexico', 'Netherlands']"
            show-on-focus
        ></VueBootstrapAutocomplete>
    </div>
</template>
