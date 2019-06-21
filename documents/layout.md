# cssdot layout


## 문제 해결

`#dot-foot`을 하단에 고정하는 규칙 때문에, 바깥 여백의 음수 설정을 통한 규칙은 적용 되지 않습니다.
```html
<div id="dots">
    <header id="dot-head" style="height:100px">
    </header>
    <main id="dot-main">
        <!-- 적용되지 않는 규칙 -->
        <div style="margin: -100px"></div>
    </main>
</div>
```