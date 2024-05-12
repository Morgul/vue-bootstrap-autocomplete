![Nodejs workflow status](https://github.com/morgul/vue-bootstrap-autocomplete/actions/workflows/nodejs.yml/badge.svg) [![npm version](https://badge.fury.io/js/@vue-bootstrap-components%2Fvue-bootstrap-autocomplete.svg)](https://badge.fury.io/js/@vue-bootstrap-components%2Fvue-bootstrap-autocomplete)

# ⚠ Beta Quality Fork ⚠

This is a fork of [drikusroor's](https://drikusroor.github.io/vue-bootstrap-autocomplete) fork of [mattzollinhofer's]
(https://github.com/mattzollinhofer/vue-typeahead-bootstrap) original project. The reason I forked it is that I 
needed a Vue 3 compatible version of the component that was compatible with Bootstrap 5. I have made some changes to the
components to move them to the Vue 3 composition API and clean up some of the slot mechanics (which are no longer 
needed in Vue 3, and I suspect were not needed in Vue 2 either). I did not have to make any changes to the CSS for 
Bootstrap 5 compatibility, though in the future I may if an issue is found.

Also worth noting, I've migrated to TypeScript as well, since I prefer it for Vue 3 projects. The Unit Tests (which 
run and pass) are still in JavaScript, but I may migrate them to TypeScript in the future (PRs welcome).

## Status

Currently, I've changed a lot of the original code, but haven't bothered migrating VuePress to Vue 3 yet. I'm not 
sure if I will do that (the Vue 3 version is in RC right now) or migrate to [VitePress](https://vitepress.dev/). I'm 
also not sure how much work I want to do maintaining this project. I'm happy to accept PRs, but I need it for 
exactly one side project, and I may even be factoring it out of that project eventually.

If there's interest in the project, I'm happy to maintain it; the first step would be fixing up the documentation 
(and this readme). If you're interested in helping with that, please let me know (via a PR).

## Contributing

The only real difference between this project and the original in terms of getting started locally is that you just 
need to run `npm run dev` to start the demo site. The rest of the instructions in the original readme should be the 
same.

## Why not a PR to the original project?

I did consider that, but I wanted to make a lot of changes to the project, and I wasn't sure if the original author
would be interested in those changes. I also wanted to make sure that I could publish the package under my own name
on npm, so that I didn't have to wait for an update version to move forward for my one use case. If the original project
is still active, I'm happy to contribute back to it, but I'm not sure if it is.

In terms of the mechanics of what needed to be updated, it wasn't _that_ hard to get it working with Vue 3, but it was
a bit of work. I'm happy to work with the original author if they're interested in updating the project, but don't 
want to just merge my work. (I made style change to files and such as well, which I'm not sure the original author 
would want.)

---

# Contributors and PRs welcome
Hello everyone. `vue-bootstrap-autocomplete` is a continuation of where [vue-typeahead-bootstrap](https://github.com/mattzollinhofer/vue-typeahead-bootstrap) left off. To move this project forward again, every contribution is welcome. Fixing bugs, adding features, improving documentation, every bit helps so don't be afraid to open a pull request. I won't bite, I promise.

# vue-bootstrap-autocomplete

A simple `list-group` based typeahead/autocomplete using Bootstrap 4 and Vue 2

<img src="https://raw.githubusercontent.com/drikusroor/vue-bootstrap-autocomplete/main/assets/screenshot.png" alt="Preview image of the vue-bootstrap-autocomplete component">

Here are some live examples, [give them a try here.](https://drikusroor.github.io/vue-bootstrap-autocomplete/examples/examples.html#custom-suggestion-slot)

## Getting Started
[Getting started guide is here.](https://drikusroor.github.io/vue-bootstrap-autocomplete/guide/gettingStarted.html#installation)

## Documentation
[Docs are here.](https://drikusroor.github.io/vue-bootstrap-autocomplete/)

## Contributing
Please note that active development is done on the `main` branch. PR's are welcome! Here are the basic steps to get going.

Here are the steps to getting the project to work locally:

1. Clone the repo: `git clone git@github.com:drikusroor/vue-bootstrap-autocomplete.git`
2. `npm ci`
3. `vuepress dev docs`
4. Open a browser and go to localhost:8080

* Then to run tests: `npm run test:unit`

## 2.13.0 Release - Migration Necessary
If you were using a version prior to 2.13.0, you'll need to change all references of `vue-bootstrap-typeahead` or `vue-typeahead-bootstrap` to `vue-bootstrap-autocomplete` and of `VueBootstrapTypeahead` or `VueTypeaheadBootstrap` to `VueBootstrapAutocomplete`.

### **tl;dr**
Replace old by new:
| Old | New |
| --- | --- |
| `vue-bootstrap-typeahead` | `vue-bootstrap-autocomplete` |
| `vue-typeahead-bootstrap` | `vue-bootstrap-autocomplete` |
| `VueBootstrapTypeahead` | `VueBootstrapAutocomplete` |
| `VueTypeaheadBootstrap` | `VueBootstrapAutocomplete` |

The original projects lost its maintainers, and we picked it up to keep it moving. 

More info here if you're interested:
* [vue-bootstrap-typeahead](https://github.com/alexurquhart/vue-bootstrap-typeahead/issues/60)
* [vue-typeahead-bootstrap](https://github.com/mattzollinhofer/vue-typeahead-bootstrap)

## Local Examples/Demo
Clone this repository and run `vuepress dev docs`. Then, navigate to http://localhost:8080/vue-bootstrap-autocomplete/ to launch the documentation and examples. The source is in `docs/README.md` and `docs/.vuepress`

## Lineage
* I want to acknowledge the original repository by Alex Urquhart for this work: https://github.com/alexurquhart/vue-bootstrap-typeahead.
* I also want to acknowledge the continuation of Matt Zollinhofer of this project: https://github.com/mattzollinhofer/vue-typeahead-bootstrap.
