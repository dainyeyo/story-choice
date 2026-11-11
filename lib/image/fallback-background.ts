import sharp from "sharp";

// A visibly labelled local background when the provider's daily allocation is
// exhausted. This is not presented as a successful Cloudflare generation.
export async function fallbackBackground(context: string) {
  const forest = /forest|woods|tree stump|숲|나무 그루터기/i.test(context);
  const home = /at home|window at home|집에|창가|방석/i.test(context);
  const dentist = !forest && !home && /dentist|dental|치과|진료/i.test(context);
  const content = forest ? `
    <path d="M0 300Q130 245 270 290T512 280V512H0Z" fill="#dbe9c8"/>
    <path d="M270 512Q180 425 270 306Q330 286 348 307Q248 385 430 512Z" fill="#eadbc0"/>
    <g fill="#bfdbb6" stroke="#8ead88" stroke-width="3"><path d="M25 330V144H51V330" fill="#bb9d7c"/>
    <circle cx="39" cy="140" r="92"/><circle cx="8" cy="205" r="65"/>
    <path d="M451 335V117H475V335" fill="#bb9d7c"/><circle cx="460" cy="123" r="94"/><circle cx="505" cy="207" r="66"/></g>
    <g fill="#fff6c1"><circle cx="98" cy="358" r="5"/><circle cx="435" cy="389" r="6"/><circle cx="72" cy="417" r="4"/></g>
    <path d="M374 330H438V385Q406 405 374 385Z" fill="#b89572"/><ellipse cx="406" cy="330" rx="33" ry="11" fill="#e0c4a2"/>`
    : dentist ? `
    <rect x="42" y="53" width="147" height="176" rx="18" fill="#fffdf3" stroke="#cbded6" stroke-width="5"/>
    <path d="M115 58V224M47 142H184" stroke="#cbded6" stroke-width="5"/>
    <rect x="330" y="225" width="151" height="113" rx="12" fill="#e4eade" stroke="#b9ccbf" stroke-width="4"/>
    <path d="M331 264H480M404 266V334" stroke="#b9ccbf" stroke-width="4"/>
    <rect x="367" y="161" width="63" height="42" rx="7" fill="#d0e4e3" stroke="#a7bdb7" stroke-width="5"/>
    <path d="M399 205V221" stroke="#a7bdb7" stroke-width="7"/>
    <g stroke="#a9c4b9" stroke-width="5"><path d="M381 421V365M340 429H424" fill="none"/>
    <path d="M338 266Q323 249 326 232L343 180Q348 165 367 171L390 182Q403 190 398 207L384 266Z" fill="#e8bbb0"/>
    <path d="M331 266H390Q408 266 415 284L443 334Q454 353 433 363H347Q326 360 326 340Z" fill="#eac9a9"/></g>`
    : `
    <rect x="325" y="51" width="135" height="183" rx="19" fill="#e0edf0" stroke="#c5d5cf" stroke-width="6"/>
    <path d="M393 55V229M329 145H456" stroke="#fffaf0" stroke-width="6"/>
    <path d="M317 42Q351 124 319 242M465 42Q432 124 468 242" fill="none" stroke="#ecd6bd" stroke-width="25"/>
    <rect x="337" y="315" width="118" height="17" rx="8" fill="#be9f7a"/>
    <path d="M348 331V408M442 331V408" stroke="#be9f7a" stroke-width="10"/>
    <rect x="365" y="290" width="53" height="24" rx="6" fill="#e3c66b"/>
    <ellipse cx="177" cy="422" rx="104" ry="31" fill="#d7d9e9"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    <defs><linearGradient id="wall" x2="0" y2="1"><stop stop-color="#faf2dd"/><stop offset="1" stop-color="#fffdf6"/></linearGradient>
    <radialGradient id="light"><stop stop-color="#ffffff" stop-opacity="0"/><stop offset="1" stop-color="#fffdf6" stop-opacity=".7"/></radialGradient></defs>
    <rect width="512" height="512" fill="url(#wall)"/><path d="M0 342Q250 319 512 342V512H0Z" fill="#ede8d9"/>
    ${content}<rect width="512" height="512" fill="url(#light)"/>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
