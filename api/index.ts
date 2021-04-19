import crypto from "crypto";
import { IncomingMessage, ServerResponse } from "http";
import { b64, utf8, base64ToHex } from "@47ng/codec";

import { createSvg } from "./_lib/createSvg";

function sendFile(res: ServerResponse, svg: string) {
  res.statusCode = 200;

  res.setHeader("Content-Type", `image/svg+xml`);
  res.setHeader("Content-Length", Buffer.byteLength(svg, "utf8"));
  res.setHeader(
    "Cache-Control",
    `public, immutable, no-transform, s-maxage=31536000, max-age=31536000`
  );
  res.end(svg);
}

function getHandlerHash(handler: string) {
  return crypto.createHash("sha256").update(handler).digest("hex");
}

const variants = ["normal", "stagger", "spider", "flower", "gem"];

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  const pathname = req.url;

  let handler = pathname.substr(1).trim().replace(".svg", "");

  // Type can be normal, stagger, spider, flower, gem
  let variant = "stagger";

  if (handler.includes("/")) {
    const split = handler.split("/");
    handler = split[0];

    if (variants.includes(split[1])) {
      variant = split[1];
    }
  }

  const handlerHash = getHandlerHash(handler);

  console.log("handler:", { handler, hash: handlerHash });

  const svg = createSvg({
    hash: handlerHash,
    variant: variant as any,
  });

  sendFile(res, svg);
  try {
  } catch (e) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/html");
    res.end("<h1>Internal Error</h1><p>Sorry, there was a problem</p>");
    console.error(e);
  }
}
