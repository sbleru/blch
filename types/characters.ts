/** Shared character data. CSV migration records contain no inferred chronology. */
export type Knowledge<T> =
  | { status: 'known'; value: T }
  | { status: 'unrecorded' | 'unknown' | 'none' }

export interface NamedText {
  text: string
  /** Original display reading; may be kana or an alternative name. */
  reading: Knowledge<string>
}

export interface Citation {
  label: string
  volumeNumber: number | null
  chapterNumber: number | null
  pageNumber: number | null
}

export interface Source {
  kind: 'legacyCsv' | 'repository' | 'manga' | 'officialWebsite' | 'communityWebsite'
  locator: string
  revision: string | null
  citation: Citation | null
  reviewStatus: 'needsReview' | 'verified'
  notes: string[]
}

export type GroupId = 'gotei13' | 'espada' | 'visored' | 'karakuracho' | 'fullbringer' | 'sternritter' | 'arrancar'
export interface StoryPoint {
  label: string
  continuity: 'manga' | 'anime' | 'unrecorded'
  chapterNumber: number | null
}

/** Latest means latest at this explicit reference point, not latest in all media. */
export interface Timeline {
  summaryStatus: 'current' | 'past' | 'unrecorded'
  referencePoint: Knowledge<StoryPoint>
  validFrom: Knowledge<StoryPoint>
  validUntil: Knowledge<StoryPoint>
  /** Earlier records replaced in the summary, not proof the ability became unusable. */
  supersedes: string[]
  sourceIndex: number | null
  reviewStatus: 'needsReview' | 'verified'
}

export interface Membership {
  id: string
  groupId: GroupId
  divisionNumber: Knowledge<number>
  /** Espada labels such as 103 are retained, without inferring rank. */
  designation: Knowledge<string>
  role: Knowledge<string>
  timeline: Timeline
  sourceIndex: number
}

export type LegacySlot = 'kaigou' | 'zanpakuto' | 'bankai' | 'kaigou2' | 'zanpakuto2' | 'bankai2'
export interface AbilityItem {
  displaySection: 'first' | 'second' | 'third'
  id: string
  name: NamedText
  kind: 'releaseCommand' | 'weapon' | 'bankai' | 'resurreccion' | 'fullbring' | 'technique' | 'quincyAbility' | 'unclassified'
  timeline: Timeline
  sourceIndex: number
  /** Temporary migration mapping, not a limit on the number of abilities. */
  legacySlot: LegacySlot | null
}

interface AbilityBase {
  id: string
  items: AbilityItem[]
}
export type AbilitySystem =
  | (AbilityBase & { kind: 'shinigami' })
  | (AbilityBase & { kind: 'hollow' })
  | (AbilityBase & { kind: 'fullbringer' })
  | (AbilityBase & {
      kind: 'quincy'
      schrift: Knowledge<{ letter: string; name: NamedText | null }>
      vollstandig: Knowledge<NamedText[]>
    })

export interface Character {
  id: string
  name: NamedText
  aliases: NamedText[]
  description: string
  memberships: Membership[]
  abilities: AbilitySystem[]
  sources: Source[]
  /** Preserve today's selection and display; it is not the character's species. */
  legacyView: {
    groupId: Exclude<GroupId, 'arrancar'>
    attribute: string
    tldrType: 'shinigami' | 'hollow' | 'fullbringer' | 'quincy'
  }
}

export interface Poem {
  id: string
  volumeNumber: number
  text: string
  /** Reading printed in the original source, not TTS preprocessing. */
  reading: Knowledge<string>
  characterRelations: { characterId: string; kind: 'cover' | 'cardSubject' | 'speaker'; sourceIndex: number }[]
  sources: Source[]
}

export interface CardLink {
  repository: string
  revision: string
  cardId: string
  volumeNumber: number
  poemId: string
  characterId: string | null
  /** Only a reference to the external card; its text and TTS stay there. */
  sourcePath: string
  reviewStatus: 'needsReview' | 'verified'
}

export interface Examples {
  schemaVersion: 1
  characters: Character[]
  poems: Poem[]
  cardLinks: CardLink[]
}

export interface CharacterDataset {
  schemaVersion: 1 | 2
  characters: Character[]
}
