# blch

「BLEACH」のキャラクター概要表示Utility。

こちらのスプレッドシートの情報を扱っています。
人物追加・編集・修正はこちらから自由にしていただいて構いません。
https://docs.google.com/spreadsheets/d/1e7Ms9sX2m1xu_4r20AgyIZHFgByRQp1s93ZE2PZlEaM/edit#gid=0

#### 人物リスト表示 - human

キャラクターをリスト表示します。
オプション指定により、護廷十三隊、仮面の軍勢(ヴァイザード)、十刃(エスパーダ)などのリスト表示ができます。

```
blch human --gotei13
```

![output.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/149698/ae04b48b-a258-7bea-7838-6e29931b6aa4.gif)


#### 概要表示 - tldr

登場人物の解号・斬魄刀・卍解を表示します。

```
blch tldr 黒崎一護
```

![output2.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/149698/e5417009-4e1d-1766-4230-6e0b2b8a9775.gif)

非常にお世話になっている`tldr`コマンドから着想を得ています。  
shellコマンドの説明と使用方法を数行で紹介してくれます。  
`brew install tldr`で。  
https://github.com/tldr-pages/tldr

#### 始解・卍解 - echo

echoコマンドにより、始解または卍解を行います。

```
blch echo --shikai 朽木白哉
blch echo --bankai 朽木白哉
```

![output3.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/149698/291cb253-4fd3-f37a-5e38-f049881bd4c6.gif)


#### コマンド組み合わせ

![output4.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/149698/6f46e846-fbea-b7c9-f16d-8da83a716908.gif)

### 参考文献

https://bleachyashiki.com/%E3%83%96%E3%83%AA%E3%83%BC%E3%83%81-%E6%96%AC%E9%AD%84%E5%88%80/
