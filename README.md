ステップ３ 時計を作ろう３
===================
このステップでは私(github:iwate)が作成したライブラリというには大変おこがましいライブラリ（テストコードがなければ例外処理等が全くなされていない）を用いて時計を作成してみます．
[Skelton.js](https://github.com/iwate/skeleton-js)

このライブラリを使ってステップ２で作成したクロックを少し拡張したものを作ってみましょう．

##構造
----------------------
まずプロジェクトをClock3で作ります．
次にソリューションエクスプローラからClock3を右クリック->追加->新しいフォルダと新しくフォルダを作成します．
新しいフォルダを”Scripts”に変え，このフォルダに[Skelton.js](https://github.com/iwate/skeleton-js)のsrc/skeleton.jsをドラッグアンドドロップします．

HTMLはステップ2同様に書きますが先ほどのskeleton.jsを読み込んでいることに注意してください．

```
<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <meta charset="utf-8" />
    <title>Clock3</title>

    <!-- WinJS 参照 -->
    <link href="//Microsoft.WinJS.1.0/css/ui-dark.css" rel="stylesheet" />
    <script src="//Microsoft.WinJS.1.0/js/base.js"></script>
    <script src="//Microsoft.WinJS.1.0/js/ui.js"></script>
    
    <!-- 追加コード -->
    <script src="/Scripts/skeleton.js"></script>
    <!-- 追加コード -->

    <!-- Clock3 参照 -->
    <link href="/css/default.css" rel="stylesheet" />
    <script src="/js/default.js"></script>
</head>
<body>
    <!--追加コード-->
    <div id="clockTemplate" data-win-control="WinJS.Binding.Template">
        <p class="clock">
            <span data-win-bind="innerText: hours"></span>:
            <span data-win-bind="innerText: minutes"></span>:
            <span data-win-bind="innerText: seconds"></span>
        </p>
    </div>
    <!--追加コード-->
    <div data-win-control="WinJS.UI.ViewBox">
        <div id="container" class="fixedlayout">
        </div>
    </div>
</body>
</html>

```

次にスタイルをステップ2と同様に書き加えます．

```
html, body {
    height: 100%;
    margin: 0;
    padding: 0;
}

body {
    -ms-flex-align: center;
    -ms-flex-direction: column;
    -ms-flex-pack: center;
    display: -ms-flexbox;
}

.fixedlayout {
    -ms-grid-columns: 1fr;
    -ms-grid-rows: 1fr;
    display: -ms-grid;
    height: 768px;
    width: 1024px;
    display: -ms-flexbox;
    -ms-flex-align:center;
    -ms-flex-pack:center;
    font-size: 200px;
}

@media screen and (-ms-view-state: fullscreen-landscape) {
}

@media screen and (-ms-view-state: filled) {
}

@media screen and (-ms-view-state: snapped) {
}

@media screen and (-ms-view-state: fullscreen-portrait) {
}

```

##ロジック
-----------------------------
次にdefault.jsを以下のように編集します．

```
// 固定レイアウト テンプレートの概要については、次のドキュメントを参照してください:
// http://go.microsoft.com/fwlink/?LinkId=232508
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: このアプリケーションは新しく起動しました。ここでアプリケーションを
                // 初期化します。
            } else {
                // TODO: このアプリケーションは中断状態から再度アクティブ化されました。
                // ここでアプリケーションの状態を復元します。
            }
            //args.setPromise(WinJS.UI.processAll());
            /*---- 追加コード ----*/
            args.setPromise(WinJS.UI.processAll().done(function () {
                var Clock = Skeleton.Model.extend({
                    hours: "",
                    minutes: "",
                    seconds: ""
                }, {
                    update: function (date) {
                        var h, m, s;
                        h = date.getHours();
                        m = date.getMinutes();
                        s = date.getSeconds();
                        this.hours = "" + h;
                        this.minutes = ((m < 10) ? "0" : "") + m;
                        this.seconds = ((s < 10) ? "0" : "") + s;
                    },
                    start: function () {
                        var update, that = this;
                        update = function () {
                            that.update(new Date());
                            setTimeout(update, 1000);
                        }
                        update();
                    }
                });
                var ClockView = Skeleton.View.extend({
                    template: clockTemplate.winControl
                });
                var clock = new Clock();
                var view = new ClockView({
                    model: clock
                });
                view.renderTo(container);
                clock.start();
            }));
            /*---- 追加コード ----*/
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: このアプリケーションは中断しようとしています。ここで中断中に
        // 維持する必要のある状態を保存します。中断中に自動的に保存され、
        // 復元される WinJS.Application.sessionState オブジェクトを使用
        // できます。アプリケーションを中断する前に非同期操作を完了する
        // 必要がある場合は、args.setPromise() を呼び出して
        // args.setPromise().
    };

    app.start();
})();
```
これで実行してみるとステップ１，ステップ２同様の画面が表示されるかと思います．
さて，ステップ３ではこれに機能を追加してみます．クリックした文字が反転するという無駄な処理をつけてみましょう．

```
// 固定レイアウト テンプレートの概要については、次のドキュメントを参照してください:
// http://go.microsoft.com/fwlink/?LinkId=232508
(function () {
    "use strict";

    WinJS.Binding.optimizeBindingReferences = true;

    var app = WinJS.Application;
    var activation = Windows.ApplicationModel.Activation;

    app.onactivated = function (args) {
        if (args.detail.kind === activation.ActivationKind.launch) {
            if (args.detail.previousExecutionState !== activation.ApplicationExecutionState.terminated) {
                // TODO: このアプリケーションは新しく起動しました。ここでアプリケーションを
                // 初期化します。
            } else {
                // TODO: このアプリケーションは中断状態から再度アクティブ化されました。
                // ここでアプリケーションの状態を復元します。
            }
            //args.setPromise(WinJS.UI.processAll());
            args.setPromise(WinJS.UI.processAll().done(function () {
                var Clock = Skeleton.Model.extend({
                    hours: "",
                    minutes: "",
                    seconds: ""
                }, {
                    update: function (date) {
                        var h, m, s;
                        h = date.getHours();
                        m = date.getMinutes();
                        s = date.getSeconds();
                        this.hours = "" + h;
                        this.minutes = ((m < 10) ? "0" : "") + m;
                        this.seconds = ((s < 10) ? "0" : "") + s;
                    },
                    start: function () {
                        var update, that = this;
                        update = function () {
                            that.update(new Date());
                            setTimeout(update, 1000);
                        }
                        update();
                    }
                });
                var ClockView = Skeleton.View.extend({
                    template: clockTemplate.winControl,
                    /*---- 追加 ----*/
                    events: {
                        "click .clock": "toggleReverse"
                    },
                    toggleReverse: function () {
                        var clock = this.element.querySelector(".clock");
                        clock.classList.toggle("reverse");
                    }
                    /*---- 追加 ----*/
                });
                var clock = new Clock();
                var view = new ClockView({
                    model: clock
                });
                view.renderTo(container);
                clock.start();
            }));
        }
    };

    app.oncheckpoint = function (args) {
        // TODO: このアプリケーションは中断しようとしています。ここで中断中に
        // 維持する必要のある状態を保存します。中断中に自動的に保存され、
        // 復元される WinJS.Application.sessionState オブジェクトを使用
        // できます。アプリケーションを中断する前に非同期操作を完了する
        // 必要がある場合は、args.setPromise() を呼び出して
        // args.setPromise().
    };

    app.start();
})();
```

さらにスタイルも書き加えます

```
html, body {
    height: 100%;
    margin: 0;
    padding: 0;
}

body {
    -ms-flex-align: center;
    -ms-flex-direction: column;
    -ms-flex-pack: center;
    display: -ms-flexbox;
}

.fixedlayout {
    -ms-grid-columns: 1fr;
    -ms-grid-rows: 1fr;
    display: -ms-grid;
    height: 768px;
    width: 1024px;
    display: -ms-flexbox;
    -ms-flex-align:center;
    -ms-flex-pack:center;
    font-size: 200px;
}
/*---- 追加 ----*/
.clock {
    -ms-transform-origin-y:50%;
    transition:transform linear 0.5s;
}
    .clock.reverse {
        transform:rotateY(180deg)
    }
/*---- 追加 ----*/

@media screen and (-ms-view-state: fullscreen-landscape) {
}

@media screen and (-ms-view-state: filled) {
}

@media screen and (-ms-view-state: snapped) {
}

@media screen and (-ms-view-state: fullscreen-portrait) {
}
```

ここで起動して文字盤をクリックしてみてください．反転されたでしょうか．

##解説
-------------------------------------
Skeleton.jsはBackbone.jsライクなライブラリです．`Model`と`View`と`Collection`の3つのクラスが定義されいます．ここでは`Model`と`View`を使用します．`Model`の派生クラスのインスタンスはデフォルトでバインドオブジェクト化されます．`Model.extend`では引数が2つに分けられていますがここでは使用しない機能のために分離してあります．プロパティは第一引数，メソッドは第二引数という解釈で大丈夫です．

```
var Clock = Skeleton.Model.extend({
    hours: "",
    minutes: "",
    seconds: ""
}, {
    update: function (date) {
        var h, m, s;
        h = date.getHours();
        m = date.getMinutes();
        s = date.getSeconds();
        this.hours = "" + h;
        this.minutes = ((m < 10) ? "0" : "") + m;
        this.seconds = ((s < 10) ? "0" : "") + s;
    },
    start: function () {
        var update, that = this;
        update = function () {
            that.update(new Date());
            setTimeout(update, 1000);
        }
        update();
    }
});
```

次に`View`を派生して`ClockView`クラスを作成しています．
Viewを生成するときにテンプレートを使用するので`template`に設定しておきます．この時`winControl`を渡していることに注意してください．渡すのはあくまでも`WinJS.Binding.Template`オブジェクトです．また，`winControl`は`WinJS.UI.processAll()`のあとでないとアクセスできなかったことも念頭に置いといてください．
`toggleReverse`メソッドでは生成した要素の中でクラスに`clock`を持つ要素に`reverse`クラスをトグルします．
このメソッドをViewと紐づけます．これは`events`プロパティで設定します．keyに`"click .clock"`となっているのでクリックイベントに紐づけされます．クリックの後が`.clock`になっているのでクラスに`clock`を持つ要素です．このkeyにたいしてデータが`"toggleReverse"`になっているので`toggleReverse`を呼び出します．まとめると，このView内のクラスに`clock`を持つ要素がクリックされたとき, `toggleReverse`を実行する，となります．

```
var ClockView = Skeleton.View.extend({
    template: clockTemplate.winControl,
    events: {
        "click .clock": "toggleReverse"
    },
    toggleReverse: function () {
        var clock = this.element.querySelector(".clock");
        clock.classList.toggle("reverse");
    }
});
```

また，Viewは`new`でインスタンスを生成する際に`model`として`Clock`のインスタンスである`clock`を渡していることに注意しましょう．この`model`はテンプレートをレンダーする際にバインドするために使用されます．

最後CSSでは`.clock`と`.clock.reverse`に差を見た目の差をつけています.
`-ms-transform-origin-y:50%;`でY軸を中心にした変形の変形中心を要素の真ん中に設定します．
`transition:transform linear 0.5s;`では`transform`に変化があった場合は直線的に0.5秒かけて変化させることを定義します．

```
.clock {
    -ms-transform-origin-y:50%;
    transition:transform linear 0.5s;
}
```

`.clock.reverse`ではY軸を中心に180度回転させることを定義します．

```
.clock.reverse {
    transform:rotateY(180deg)
}
```

このようにCSSを使用すると簡単なアニメーションを少ないコードで設定できます．
今回はステップ1,2と違いクリックイベントでのアクションを加えました．ステップ1,2それぞれ
の実装方法ではどのようになるか試してみてください．

Skeleton.jsが便利そうだなと思った方は是非デバックをお願いいたします．テストコードなどいつでも待ってます．
