const SAMPLE_DOCUMENT = `
Property Inspection Manual - Section 7: Water Damage and Mold Assessment

7.1 Initial Assessment:
Upon identifying potential water damage, the inspector's first priority is to determine the source and extent of the moisture intrusion. Common sources include plumbing leaks, roof damage, foundation cracks, and HVAC condensation. Use a moisture meter to map the affected area, testing drywall, flooring, and structural wood. Document all readings with photographic evidence. All visible signs of water staining, discoloration, or warping must be noted.

7.2 Categorization of Water:
Water is categorized into three types. Category 1 is 'Clean Water' from sources like supply lines, posing no substantial harm. Category 2 is 'Gray Water', which is contaminated and can cause sickness; sources include dishwasher or washing machine discharge. Category 3 is 'Black Water', which is grossly contaminated and may contain pathogens and toxins; sources include sewage backup and floodwaters. Proper identification is critical for remediation protocols.

7.3 Mold Identification:
Visible mold growth is a direct indicator of prolonged moisture. It can appear in various colors (black, green, white, orange) and textures. A musty odor is also a strong indicator of microbial growth, even if not visible. Air sampling may be necessary in cases of suspected hidden mold, such as behind walls or in crawl spaces. However, direct visual confirmation is the primary method of identification. Do not disturb potential mold colonies, as this can release spores into the air.

7.4 Structural Integrity Checks:
Prolonged water exposure can compromise structural components. Wood framing may be subject to rot and decay, losing its load-bearing capacity. Check for soft, spongy wood by probing with a screwdriver or awl. Metal fasteners and connectors may rust and fail. Gypsum board (drywall) will swell, weaken, and disintegrate. The inspector must assess the integrity of joists, beams, and subflooring in the affected areas. Any signs of sagging or deflection must be reported immediately as a major safety concern.

7.5 Reporting Protocol:
All findings related to water damage and mold must be clearly detailed in the inspection report. Include the location, extent of damage, moisture meter readings, water category, and photographic evidence. If mold is present, recommend a professional mold remediation company. If structural damage is suspected, recommend a licensed structural engineer for further evaluation. Do not provide cost estimates for repairs.
`;

// Simple chunking by splitting into paragraphs.
const documentChunks = SAMPLE_DOCUMENT.trim().split(/\n\s*\n/);

/**
 * A simple keyword-based search engine for the document chunks.
 * It scores chunks based on the number of unique query words they contain.
 * @param query The user's search query.
 * @returns The most relevant document chunk as a string.
 */
export const search = (query: string): string => {
  console.log(`Performing RAG search for query: "${query}"`);

  if (!query) {
    return "No relevant information found for an empty query.";
  }

  const queryWords = new Set(query.toLowerCase().match(/\w+/g) || []);
  if (queryWords.size === 0) {
    return "No relevant information found for the provided query.";
  }

  let bestChunk = '';
  let maxScore = -1;

  documentChunks.forEach(chunk => {
    const chunkWords = new Set(chunk.toLowerCase().match(/\w+/g) || []);
    let score = 0;
    queryWords.forEach(word => {
      if (chunkWords.has(word)) {
        score++;
      }
    });

    if (score > maxScore) {
      maxScore = score;
      bestChunk = chunk;
    }
  });

  if (maxScore > 0) {
    console.log(`Found best chunk with score ${maxScore}:`, bestChunk);
    return `From the manual: "${bestChunk}"`;
  } else {
    console.log("No relevant chunks found.");
    return "I couldn't find specific information on that topic in the manual.";
  }
};