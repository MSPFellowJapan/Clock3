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
                    events: {
                        "click .clock": "toggleReverse"
                    },
                    toggleReverse: function () {
                        var clock = this.element.querySelector(".clock");
                        clock.classList.toggle("reverse");
                    }
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
