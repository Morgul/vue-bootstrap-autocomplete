import { beforeEach, describe, expect, it } from 'vitest';

import { shallowMount } from '@vue/test-utils';
import VueBootstrapAutocompleteListItem from '../../src/components/VueBootstrapAutocompleteListItem.vue';

describe('VueBootstrapAutocompleteListItem.vue', () =>
{
    let wrapper;

    beforeEach(() =>
    {
        // Create a shallow wrapper of the component
        wrapper = shallowMount(VueBootstrapAutocompleteListItem);
    });

    it('Mounts and renders a <li> tag', () =>
    {
        expect(wrapper.exists()).toBe(true);
        expect(wrapper.element.tagName.toLowerCase()).toBe('li');
    });

    it('Renders textVariant classes properly', async () =>
    {
        wrapper.setProps({ textVariant: 'dark' });
        await wrapper.vm.$nextTick();
        expect(wrapper.classes()).toEqual(expect.arrayContaining([ 'text-dark' ]));
    });

    it('Renders backgroundVariant classes properly', async () =>
    {
        wrapper.setProps({ backgroundVariant: 'light' });
        await wrapper.vm.$nextTick();
        expect(wrapper.classes()).toEqual(expect.arrayContaining([ 'list-group-item-light' ]));
    });

    it('Renders text classes properly when backgroundVariantResolver is not specified', async () =>
    {
        const baseClasses = [ ...wrapper.vm.baseTextClasses ];
        expect(wrapper.classes()).toHaveLength(baseClasses.length);
        expect(wrapper.classes()).toEqual(expect.arrayContaining([ ...baseClasses ]));
    });

    it('Renders text classes properly when backgroundVariantResolver returns non-string', async () =>
    {
        const baseClasses = [ ...wrapper.vm.baseTextClasses ];
        const resolver1 = () => [ 'light', 'dark' ];
        wrapper.setProps({ backgroundVariantResolver: resolver1 });
        await wrapper.vm.$nextTick();
        // the first resolver returns an array when it should be returning a string;
        // therefore the classes assigned to the wrapper should be the same as the
        // base classes.
        expect(wrapper.classes()).toHaveLength(baseClasses.length);
        expect(wrapper.classes()).toEqual(expect.arrayContaining([ ...baseClasses ]));
        const resolver2 = () => ({ class1: 'light', class2: 'dark' });
        wrapper.setProps({ backgroundVariantResolver: resolver2 });
        await wrapper.vm.$nextTick();
        // the second resolver returns an object, therefore the classes
        // assigned to the wrapper should also be the same as the base classes.
        expect(wrapper.classes()).toHaveLength(baseClasses.length);
        expect(wrapper.classes()).toEqual(expect.arrayContaining([ ...baseClasses ]));
    });

    it('Renders backgroundVariantResolver classes properly', async () =>
    {
        const baseClasses = [ ...wrapper.vm.baseTextClasses ];
        const testItems = [
            {
                data: { prop: 'light' },
                resolver: (item) => item.prop
            },
            {
                data: { prop: 'dark' },
                resolver: (item) => item.prop
            },
            {
                data: { prop: 'warning' },
                resolver: (item) => item.prop
            }
        ];
        // iterate through the test items which specify a classname to add
        // and a resolver to use.
        for(let i = 0; i < testItems.length; i++)
        {
            wrapper.setProps({
                backgroundVariantResolver: testItems[i].resolver,
                data: testItems[i].data
            });

            // eslint-disable-next-line no-await-in-loop
            await wrapper.vm.$nextTick();

            // this should be adding a single class to the baseClasses, should not be appending
            expect(wrapper.classes()).toHaveLength(baseClasses.length + 1);
            expect(wrapper.classes()).toEqual(expect.arrayContaining([ `list-group-item-${ [ testItems[i].data.prop ] }` ]));
        }
    });

    it('Favors backgroundVariantResolver class over backgroundVariant class', async () =>
    {
        const baseClasses = [ ...wrapper.vm.baseTextClasses ];
        const resolver1 = () => 'dark';
        // we are specifying both a backgroungVariant and a backgroundVariantResolver
        wrapper.setProps({
            backgroundVariant: 'light',
            backgroundVariantResolver: resolver1
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.classes()).toHaveLength(baseClasses.length + 1);
        expect(wrapper.classes()).toEqual(expect.arrayContaining([ `list-group-item-dark` ]));
    });

    it("emits 'listItemBlur' when the list items lose focus", async () =>
    {
        wrapper.find('.vbst-item').trigger('blur');
        expect(wrapper.emitted('listItemBlur')).toBeTruthy();
    });

    it("emits 'hitActiveListItem' event when keyup.enter event is triggered", async () =>
    {
        await wrapper.trigger('keyup.enter');

        // Expect the parent method to have been called
        expect(wrapper.emitted()).toHaveProperty('hitActiveListItem');
    });

    it("emits 'selectNextListItem' event when keyup.down event is triggered", async () =>
    {
        await wrapper.trigger('keyup.down');

        // Expect the parent method to have been called
        expect(wrapper.emitted()).toHaveProperty('selectNextListItem');
    });

    it("emits 'selectPreviousListItem' event when keyup.up event is triggered", async () =>
    {
        await wrapper.trigger('keyup.up');

        // Expect the parent method to have been called
        expect(wrapper.emitted()).toHaveProperty('selectPreviousListItem');
    });
});
