export function splitGraphemes(str) {
    if (typeof Intl !== "undefined" && Intl.Segmenter) {
        const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
        return [...segmenter.segment(str)].map(s => s.segment);
    }
    const regex = /(\P{M}\p{M}*|\s)/gu;
    return str.match(regex) || [];
}
