# cssdot theme

## define theme

### color

```scss
$primary: blue;
$accent: skyblue;
$warn: deeppink;
```

> This makes it easy to use on global space

### palette

```scss
$palette: palette((
   'primary': $primary,
   'accent': $accent,
   'warn': $warn 
));
```

### theme

```scss
$theme: theme((
    'palette': $palette
));
```