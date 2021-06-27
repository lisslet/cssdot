# Guide Line

## Dependency Injection

### Distribution Files
* `scss.scss`   
Imports all base function and mixins.

* `#{$module}/only.scss`   
__Not imported__ the required modules.
cannot using before import required modules.

* `#{$module}/standalone.scss`      
__Imported__ the required modules.
can using when rightly after import this one.

* `#{$module}.scss`
an alias file of `#{$module}/only.scss`

## Naming

* `*-core`: ?
* `*-rule`:     generate rule
* `*-paint`: ?
* `-*` : alias function