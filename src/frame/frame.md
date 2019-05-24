# Frame

## Shell Elements for default outline.

`<article>`의 `<header>`, `<main>`, `<footer>` 구조에 따라 아래의 구조를 따라 작성 되어야 합니다.
각 요소는 문서내 유일 하기에 `id` 선택자가 사용 됩니다.


* `div#-wrap`: 전체를 감싸는 요소
    * `header#-head`
        * `div#-head-wrap`
    * `main#-main`
        * `div#-main-wrap`
    * `footer#-foot`
        * `div#-foot-wrap`
        
* `*.-width`

```html
<article id="dot-wrap">
    <header id="dot-head">
        <div id="dot-head-wrap">
        </div>
    </header>
        
    <main id="dot-main">
        <div id="dot-main-wrap">
        </div>
    </main>
        
    <footer id="dot-head">
        <div id="dot-foot-wrap">
        </div>
    </header>        
</article>
```

### Suffixes