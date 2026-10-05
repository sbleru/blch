"""One-time CSV migration. Uses only Python's standard library and a frozen ID map."""
import csv
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
COLUMNS = ['name', 'nameKana', 'description', 'kaigou', 'kaigouKana', 'zanpakuto', 'zanpakutoKana', 'bankai', 'bankaiKana', 'kaigou2', 'kaigou2Kana', 'zanpakuto2', 'zanpakuto2Kana', 'bankai2', 'bankai2Kana', 'groupCode', 'attribute1', 'tldrType']


def knowledge(value):
    return {'status': 'known', 'value': value} if value != '' else {'status': 'unrecorded'}


def timeline():
    return {'summaryStatus': 'unrecorded', 'referencePoint': knowledge(''),
            'validFrom': knowledge(''), 'validUntil': knowledge(''),
            'supersedes': [], 'sourceIndex': None, 'reviewStatus': 'needsReview'}


def migrate():
    ids = json.loads((ROOT / 'scripts/migration/character-ids.json').read_text())
    with (ROOT / 'test/fixtures/human.legacy.csv').open(newline='') as file:
        reader = csv.DictReader(file)
        assert reader.fieldnames == COLUMNS, 'Unexpected CSV header'
        rows = list(reader)
    assert len({row['name'] for row in rows}) == len(rows), 'Duplicate name'
    assert set(ids) == {row['name'] for row in rows}, 'ID mapping does not match CSV'
    assert len(set(ids.values())) == len(ids), 'Duplicate ID'
    characters = []
    for row in rows:
        assert set(row) == set(COLUMNS) and all(isinstance(v, str) for v in row.values()), 'Malformed row'
        character_id = ids[row['name']]
        items = []
        for slot in ['kaigou', 'zanpakuto', 'bankai', 'kaigou2', 'zanpakuto2', 'bankai2']:
            assert row[slot] or not row[slot + 'Kana'], 'Reading without name needs manual handling'
            if not row[slot]:
                continue
            section = {'kaigou': 'first', 'zanpakuto': 'second', 'bankai': 'third'}[slot.removesuffix('2')]
            # The CSV determines display classification only; do not infer new systems.
            kind = {'shinigami': {'first': 'releaseCommand', 'second': 'weapon', 'third': 'bankai'},
                    'hollow': {'first': 'releaseCommand', 'second': 'resurreccion', 'third': 'unclassified'},
                    'fullbringer': {'first': 'fullbring', 'second': 'technique', 'third': 'unclassified'},
                    'quincy': {'first': 'quincyAbility', 'second': 'unclassified', 'third': 'unclassified'}}[row['tldrType']][section]
            items.append({'id': character_id + '-' + slot, 'name': {'text': row[slot], 'reading': knowledge(row[slot + 'Kana'])},
                          'kind': kind, 'displaySection': section, 'timeline': timeline(), 'sourceIndex': 0, 'legacySlot': slot})
        system = {'id': character_id + '-ability-' + row['tldrType'], 'kind': row['tldrType'], 'items': items}
        if row['tldrType'] == 'quincy':
            system.update(schrift=knowledge(''), vollstandig=knowledge(''))
        characters.append({
            'id': character_id, 'name': {'text': row['name'], 'reading': knowledge(row['nameKana'])},
            'aliases': [], 'description': row['description'],
            'memberships': [{'id': character_id + '-' + row['groupCode'], 'groupId': row['groupCode'],
                             'divisionNumber': knowledge(int(row['attribute1'])) if row['groupCode'] == 'gotei13' and row['attribute1'] else knowledge(''),
                             'designation': knowledge(row['attribute1']) if row['groupCode'] == 'espada' else knowledge(''),
                             'role': knowledge(''), 'timeline': timeline(), 'sourceIndex': 0}],
            'abilities': [system],
            'sources': [{'kind': 'legacyCsv', 'locator': 'test/fixtures/human.legacy.csv#' + row['name'],
                         'revision': '30320db36d874fc690ba051f3f61ca201eb6868f', 'citation': None,
                         'reviewStatus': 'needsReview', 'notes': ['既存 CSV の転記のみ。原作の校正・最新話での所属と能力・時点の確認は未実施。']}],
            'legacyView': {'groupId': row['groupCode'], 'attribute': row['attribute1'], 'tldrType': row['tldrType']},
        })
    return {'schemaVersion': 1, 'characters': characters}


if __name__ == '__main__':
    (ROOT / 'data/characters.json').write_text(json.dumps(migrate(), ensure_ascii=False, indent=2) + '\n')
