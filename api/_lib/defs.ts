export type Variants = "normal" | "stagger" | "spider" | "flower" | "gem";

export interface Point {
  x: number;
  y: number;
}

export function polarPoint(radius: number, angle: number): Point {
  // Angle is expressed as [0,1[
  // Note: we subtract pi / 2 to start at noon and go clockwise
  // Trigonometric rotation + inverted Y axis = clockwise rotation, nifty!
  return {
    x: radius * Math.cos(2 * Math.PI * angle - Math.PI / 2),
    y: radius * Math.sin(2 * Math.PI * angle - Math.PI / 2),
  };
}

function formatNumber(value: number, precision: number) {
  if (Number.isInteger(value)) {
    return value.toString();
  }
  const format = Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
  });
  return format.format(value).replace(/,/g, "");
}

// SVG Path functions --

export function moveTo({ x, y }: Point) {
  return `M ${formatNumber(x, 6)} ${formatNumber(y, 6)}`;
}

export function lineTo({ x, y }: Point) {
  return `L ${formatNumber(x, 6)} ${formatNumber(y, 6)}`;
}

export function arcTo({ x, y }: Point, radius: number = 0, invert = false) {
  return [
    "A",
    formatNumber(radius, 6),
    formatNumber(radius, 6),
    0,
    0,
    invert ? 0 : 1,
    formatNumber(x, 6),
    formatNumber(y, 6),
  ].join(" ");
}

// --

export function getSouls(hash: string) {
  const bytes = hash.match(/.{1,2}/g)?.map((byte) => byte) ?? [];
  const circleSize = Math.round(bytes.length / 4);
  const circles = [
    bytes.slice(0, circleSize),
    bytes.slice(1 * circleSize, 2 * circleSize),
    bytes.slice(2 * circleSize, 3 * circleSize),
    bytes.slice(3 * circleSize, 4 * circleSize),
  ];
  const xor = (xor: number, byte: string) => xor ^ parseInt(byte, 16);
  return {
    hashSoul: (bytes.reduce(xor, 0) / 0xff) * 2 - 1,
    circleSouls: circles.map(
      (circle) => (circle.reduce(xor, 0) / 0xff) * 2 - 1
    ),
  };
}

// Space mapping --

export interface GenerateSectionArgs {
  index: number;
  outerRadius: number;
  circleSoul: number;
  variant?: Variants;
}

export function generateSectionPath({
  index,
  outerRadius,
  circleSoul,
  variant = "normal",
}: GenerateSectionArgs) {
  const circleIndex = Math.floor(index / 8);
  const staggering =
    variant === "gem" || variant === "flower"
      ? circleIndex % 2 === 0
        ? 0.5
        : 0
      : variant === "stagger"
      ? circleSoul
      : 0;

  const angleA = index / 8;
  const angleB = (index + 1) / 8;
  const angleOffset = staggering / 8;

  const arcRadius =
    variant === "gem"
      ? 0
      : variant === "flower"
      ? 0.25 * outerRadius
      : outerRadius;

  const path = [
    moveTo({ x: 0, y: 0 }),
    lineTo(polarPoint(outerRadius, angleA + angleOffset)),
    arcTo(
      polarPoint(outerRadius, angleB + angleOffset),
      arcRadius,
      variant === "spider"
    ),
    "Z", // close the path
  ].join(" ");

  return path;
}

// Color mapping --

export type ColorMapper = (args: {
  value: number; // [0; 2 ^ bitCount - 1]
  bitCount: number;
  hashSoul: number; // [0-1]
  circleSoul: number; // [0-1]
}) => string;

export const mapValueToColor: ColorMapper = ({
  value,
  hashSoul,
  bitCount,
  circleSoul,
}) => {
  const halfMask = 2 ** (bitCount / 2) - 1;
  const quarterMask = 2 ** (bitCount / 4) - 1;
  const colorH = value >> (bitCount / 2);
  const colorS = (value >> (bitCount / 4)) & quarterMask;
  const colorL = value & quarterMask;
  const normH = colorH / halfMask;
  const normS = colorS / quarterMask;
  const normL = colorL / quarterMask;
  const h = 360 * hashSoul + 120 * circleSoul + 30 * normH;
  const s = 50 + 50 * normS;
  const l = 40 + 30 * normL;
  return `hsl(${formatNumber(h, 2)}, ${formatNumber(s, 4)}%, ${formatNumber(
    l,
    4
  )}%)`;
};
