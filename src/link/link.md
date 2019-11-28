# Link

> a, button

## Link Styles

* `default`: just text-like
* `solid`: filled background button
* `soft`: little bit filled background button by opacity
* `border`: aka ghost button
* `line`: underlined button
  
## Link Style Map Structure

```scss
$STYLES: (
    '[style-name]': (
        '[control-state]': (
            '[property]': '[style-value]'
        )
    )
);
```