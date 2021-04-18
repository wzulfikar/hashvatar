import { mapValueToColor } from "./defs";
import { useHashAvatar, UseHashAvatarArgs } from "./useHashAvatar";

export function generateHashAvatarDataURL({
  radiusFactor = 0.42,
  hash = Array(64).fill("0").join(""),
  variant = "stagger",
  mapColor = mapValueToColor,
}: UseHashAvatarArgs) {
  const sections = useHashAvatar({
    radiusFactor,
    hash,
    variant,
    mapColor,
  });

  const svg = `<svg viewBox="-1 -1 2 2" xmlns="http://www.w3.org/2000/svg">${sections
    .map(
      (section) =>
        `<path stroke="black" stroke-width="0.02" stroke-linejoin="round" fill="${section.color}" d="${section.path}" />`
    )
    .join("")}</svg>`;

  return `data:image/svg+xml;utf8,${svg}`;
}
