import Script from "next/script";
import AknoDevisPdfBridge from "@/components/devis/AknoDevisPdfBridge";

const AKNO_MARK = (
  <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
    <symbol id="mark" viewBox="140 130 700 510">
      <g fill="currentColor">
        <path d="M388 145 620 628H545L388 305 235 628H155Z" />
        <path d="M500 400 718 180H818L615 390 828 628H730L565 448 530 482Z" />
        <path d="M340 628 428 505 460 570 425 628Z" />
      </g>
    </symbol>
  </svg>
);

export default function Home() {
  return (
    <>
      {AKNO_MARK}
      <div id="ptr" aria-hidden="true">
        <div className="ptr-ios">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <i key={i} />
          ))}
        </div>
      </div>
      <div id="app" />
      <div className="toast" id="toast" />
      <div id="layer" />
      <AknoDevisPdfBridge />
      <Script src="/akno/app.js" strategy="afterInteractive" />
    </>
  );
}
