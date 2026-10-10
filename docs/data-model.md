# データ構造の ER 図

[共有型](../types/characters.ts)と[データ管理](data.md)に対応する図です。実体は JSON の入れ子で、下の箱ごとに別ファイルやテーブルがあるわけではありません。実線は内包、点線は参照です。

## 人物データ（実装済み）

```mermaid
erDiagram
    CHARACTER_DATASET ||--o{ CHARACTER : "characters 配列"
    CHARACTER ||--o{ MEMBERSHIP : "memberships 配列"
    CHARACTER ||--o{ ABILITY_SYSTEM : "abilities 配列"
    ABILITY_SYSTEM ||--o{ ABILITY_ITEM : "items 配列"
    CHARACTER ||--|{ SOURCE : "sources 配列"
    CHARACTER ||--|| LEGACY_VIEW : "旧 CLI の表示設定"
    MEMBERSHIP ||--|| TIMELINE : "所属の時点"
    ABILITY_ITEM ||--|| TIMELINE : "能力の時点"
    SOURCE ||..o{ MEMBERSHIP : "sourceIndex で参照"
    SOURCE ||..o{ ABILITY_ITEM : "sourceIndex で参照"
    SOURCE |o..o{ TIMELINE : "根拠があれば sourceIndex で参照"
    SOURCE ||--o| CITATION : "citation"

    CHARACTER_DATASET {
        number schemaVersion "現在は 1"
    }
    CHARACTER {
        string id "固定 ID"
        NamedText name "名前と読み"
        NamedTextArray aliases "別名と読み"
        string description "説明"
    }
    MEMBERSHIP {
        string id "固定 ID"
        enum groupId "所属グループ"
        Knowledge divisionNumber "隊番号"
        Knowledge designation "番号などの呼称"
        Knowledge role "役職"
        number sourceIndex "人物内の出典配列の添字"
    }
    ABILITY_SYSTEM {
        string id "固定 ID"
        enum kind "死神・虚・完現術者・滅却師"
        Knowledge schrift "滅却師のみ：聖文字・能力名"
        Knowledge vollstandig "滅却師のみ：完聖体"
    }
    ABILITY_ITEM {
        string id "固定 ID"
        NamedText name "名称と読み"
        enum kind "解号・武器・卍解・帰刃・技など"
        enum displaySection "概要の表示区分"
        nullable_string legacySlot "移行元 CSV の欄名"
        number sourceIndex "人物内の出典配列の添字"
    }
    TIMELINE {
        enum summaryStatus "current・past・unrecorded"
        Knowledge referencePoint "判定の基準時点"
        Knowledge validFrom "適用開始"
        Knowledge validUntil "適用終了"
        stringArray supersedes "概要で置き換える過去要素の ID"
        nullable_number sourceIndex "時点判定の根拠"
        enum reviewStatus "未校正・確認済み"
    }
    SOURCE {
        enum kind "資料の種類"
        string locator "資料の所在"
        nullable_string revision "資料の版"
        enum reviewStatus "未校正・確認済み"
        stringArray notes "確認事項"
    }
    CITATION {
        string label "出典の表記"
        nullable_number volumeNumber "巻"
        nullable_number chapterNumber "話"
        nullable_number pageNumber "ページ"
    }
    LEGACY_VIEW {
        enum groupId "既存一覧の所属"
        string attribute "既存の補助番号"
        enum tldrType "既存概要の表示分類"
    }
```

一人が複数の所属・能力体系を持ち、各体系に複数の能力名を持てます。例えば恋次の卍解2件は、一つの死神体系の中の別々の `AbilityItem` です。体系の区別と名前の区別を分けています。

`Source` 自体には ID がありません。`sourceIndex: 0` は、その人物の `sources[0]` を参照します。別の人物の出典へは参照しません。`Timeline` も各所属・能力の中に個別に保存するもので、所属と能力が同じ時点オブジェクトを共有するわけではありません。`supersedes` は同じ人物内の過去の所属・能力の ID を参照します。

今回の73人は CSV の情報だけで移行したため、所属・能力体系は人物あたり一つ、時点は全件未入力です。複数所属や最新優先の判定を、新しい事実として追加したわけではありません。旧一覧と echo の選択は `legacyView` / `legacySlot` で保持しています。

## 名前・未入力の表現

| 型 | 内容 |
| --- | --- |
| `NamedText` | `text`（表記）と `reading`（読みの Knowledge） |
| `Knowledge<T>` | `known` なら `value` を持つ。`unrecorded`（未入力）、`unknown`（不明）、`none`（なし）は値を持たない |
| `StoryPoint` | 時点の `label`、原作／アニメ／未入力を表す `continuity`、分かれば `chapterNumber` |

`referencePoint` / `validFrom` / `validUntil` はそれぞれ独立した `Knowledge<StoryPoint>` です。CSV の空欄を「不明」や「なし」に推測で変換しません。

## 巻頭歌・骨牌との連携（型・試作のみ）

こちらは人物の本番 JSON にはまだ含めていません。巻頭歌の正式取り込みは、別途提供いただく情報を使います。

```mermaid
erDiagram
    POEM ||--o{ CHARACTER_RELATION : "characterRelations 配列"
    CHARACTER ||..o{ CHARACTER_RELATION : "characterId で参照"
    POEM ||--o{ POEM_SOURCE : "sources 配列"
    POEM_SOURCE ||..o{ CHARACTER_RELATION : "sourceIndex で参照"
    POEM ||..o{ CARD_LINK : "poemId で参照"
    CHARACTER |o..o{ CARD_LINK : "characterId がある場合"

    POEM {
        string id "巻頭歌の固定 ID"
        number volumeNumber "巻番号"
        string text "原文・空白・改行"
        Knowledge reading "原典の読み"
    }
    CHARACTER_RELATION {
        string characterId "人物の固定 ID"
        enum kind "表紙・カード対象・話者"
        number sourceIndex "巻頭歌内の出典配列の添字"
    }
    POEM_SOURCE {
        Source value "人物と同じ Source 型"
    }
    CARD_LINK {
        string repository "骨牌 repo"
        string revision "参照する版"
        string cardId "骨牌側のカード ID"
        number volumeNumber "カードの巻番号"
        string poemId "blch 側の巻頭歌 ID"
        nullable_string characterId "照合できた人物 ID"
        string sourcePath "骨牌側の原稿の所在"
        enum reviewStatus "未校正・確認済み"
    }
```

`POEM_SOURCE` は図の中で人物側の出典と区別した名前で、実際には同じ `Source` 型です。人物との関係は配列で、話者などを推測で登録しません。

巻頭歌 ID と骨牌 ID は別です。初期の対応例は `poem-003` と `vol_03` を巻番号3で照合し、`CardLink` に明示します。骨牌の印字・項目 ID・TTS 調整・音声・再生設定は骨牌 repo に置きます。カードの巻番号と、カードにある名言の出所巻番号も別の情報です。

## P3 の形式拡張

本番は版2です。版1の読み込みも維持します。滅却師の `schrift` が既知でも、その `value.name` は `null`（能力名未入力）を許容します。文字の確認と名称の確認を分け、未確認の名称を推測しません。出典種別に `communityWebsite` を追加し、非公式サイトを公式サイトと区別しました。新規人物の一覧分類は `sternritter` を使います。複数サイト照合の範囲・確認日・保留事項は人物内の出典に保存し、原作直接確認とは区別します。
