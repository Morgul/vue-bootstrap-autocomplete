//----------------------------------------------------------------------------------------------------------------------

import { App } from 'vue';

import VueBootstrapAutocomplete from './components/VueBootstrapAutocomplete.vue';
import VueBootstrapAutocompleteList from './components/VueBootstrapAutocompleteList.vue';
import VueBootstrapAutocompleteListItem from './components/VueBootstrapAutocompleteListItem.vue';

//----------------------------------------------------------------------------------------------------------------------

const components = {
    VueBootstrapAutocomplete,
    VueBootstrapAutocompleteList,
    VueBootstrapAutocompleteListItem
};

function install(app : App) : void
{
    for (const key in components)
    {
        app.component(key, components[key])
    }
}

//----------------------------------------------------------------------------------------------------------------------

export default { install };
export { install, VueBootstrapAutocomplete, VueBootstrapAutocompleteList, VueBootstrapAutocompleteListItem };

//----------------------------------------------------------------------------------------------------------------------
