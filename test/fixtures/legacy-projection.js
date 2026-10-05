const valueOrEmpty = (value) => value.status === 'known' ? value.value : '';
/** Lossless projection for migration verification; the renderer uses arrays directly. */
export function toLegacyHuman(character) {
    const human = {
        name: character.name.text,
        nameKana: valueOrEmpty(character.name.reading),
        description: character.description,
        groupCode: character.legacyView.groupId,
        attribute1: character.legacyView.attribute,
        tldrType: character.legacyView.tldrType,
        kaigou: '', kaigouKana: '', zanpakuto: '', zanpakutoKana: '', bankai: '', bankaiKana: '',
        kaigou2: '', kaigou2Kana: '', zanpakuto2: '', zanpakuto2Kana: '', bankai2: '', bankai2Kana: '',
    };
    const assigned = new Set();
    for (const system of character.abilities) {
        for (const item of system.items) {
            if (!item.legacySlot)
                continue;
            if (assigned.has(item.legacySlot))
                throw new Error(`Duplicate legacy slot: ${item.legacySlot}`);
            assigned.add(item.legacySlot);
            human[item.legacySlot] = item.name.text;
            human[`${item.legacySlot}Kana`] = valueOrEmpty(item.name.reading);
        }
    }
    return human;
}
