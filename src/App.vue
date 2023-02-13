<script setup>
import VueTypeaheadBootstrap from './components/VueTypeaheadBootstrap.vue'
import '~bootstrap/scss/bootstrap.scss'

import { reactive } from 'vue'

const state = reactive({query : ''})

</script>

<template>

	<vue-typeahead-bootstrap
	v-model="state.query" 
	class="col-md-3"
	size='sm'
	placeholder="search"
    :data="['Canada', 'United States', 'Mexico', 'Netherlands']"
	/>
</template>