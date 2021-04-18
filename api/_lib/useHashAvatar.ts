import {
  ColorMapper,
  generateSectionPath,
  getSouls,
  mapValueToColor,
  Variants,
} from "./defs";

export interface UseHashAvatarArgs {
  hash: string;
  variant?: Variants;
  radiusFactor?: number;
  mapColor?: ColorMapper;
}

export function useHashAvatar({
  radiusFactor = 0.42,
  hash = Array(64).fill("0").join(""),
  variant = "normal",
  mapColor = mapValueToColor,
}: UseHashAvatarArgs) {
  const mix = (a: number, b: number) =>
    a * radiusFactor + b * (1 - radiusFactor);

  const r1 = variant === "flower" ? 0.75 : 0.99; // leave space for stroke
  const r2 = mix((r1 * Math.sqrt(3)) / 2, r1 * 0.75);
  const r3 = mix((r1 * Math.sqrt(2)) / 2, r1 * 0.5);
  const r4 = mix(r1 * 0.5, r1 * 0.25);

  const bytesPerSection = (hash?.length ?? 0) / 64; // 32 sections = 64 hex characters
  const charsPerSection = bytesPerSection * 2;
  const cutInBlocks = new RegExp(`.{1,${charsPerSection}}`, "g");
  const values = hash.match(cutInBlocks)?.map((block) => block) ?? [];
  const { hashSoul, circleSouls } = getSouls(hash);
  const outerRadii = [r1, r2, r3, r4];
  const sections = values.map((value, index) => {
    const circleIndex = Math.floor(index / 8);
    const outerRadius = outerRadii[circleIndex];
    const circleSoul = circleSouls[circleIndex];
    return {
      path: generateSectionPath({
        index,
        outerRadius,
        variant,
        circleSoul,
      }),
      color: mapColor({
        value: parseInt(value, 16),
        bitCount: bytesPerSection * 8,
        hashSoul,
        circleSoul,
      }),
    };
  });
  return sections;
}
