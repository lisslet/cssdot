# cssdot theme

## define theme

### color

color is just color

```scss
$primary: blue;
$accent: skyblue;
$warn: deeppink;
```

> this is not required step, but this will makes it easy to use on global space

### palette

palette is collection of color as map

```scss
$palette: palette((
   'primary': $primary,
   'accent': $accent,
   'warn': $warn 
));
```

### theme

theme is the collection of palette or color as map type

```scss
$theme: theme((
    'palette': $palette
));
```