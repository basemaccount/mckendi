import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Gauge, Search, Sparkles, X } from "lucide-react";
import { useLocation } from "react-router";
import { Link } from "./TransitionLink";

const STORAGE_KEY = "makendi-coffee-experience-motion";
const RECENT_KEY = "makendi-coffee-recent-destinations";

const pages = {
  en: [
    ["Home", "The three soluble coffee forms", "/"],
    ["Product formats", "Compare powder, granule and crystal structures", "/products"],
    ["How it is made", "Follow the shared process and three drying routes", "/process"],
    ["Applications", "Explore practical application directions", "/applications"],
    ["Start an inquiry", "Prepare a clear product brief", "/contact"],
  ],
  tr: [
    ["Ana sayfa", "Üç çözünebilir kahve biçimi", "/"],
    ["Ürün formatları", "Toz, granül ve kristal yapıları karşılaştırın", "/products"],
    ["Nasıl üretilir", "Ortak süreci ve üç kurutma yolunu izleyin", "/process"],
    ["Kullanım alanları", "Uygulama yönlerini keşfedin", "/applications"],
    ["Talep oluştur", "Net bir ürün talebi hazırlayın", "/contact"],
  ],
};

function normalise(value) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("en");
}
function local(value, language) { return typeof value === "object" ? value[language] : value; }
function stored(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } }

export default function DiscoveryDeck({ language = "en", formats = [] }) {
  const location = useLocation();
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const resultRefs = useRef([]);
  const triggerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [motion, setMotion] = useState(() => stored(STORAGE_KEY, "full"));
  const systemCalm = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const items = useMemo(() => [
    ...pages[language].map(([label, detail, to], index) => ({ id: `page-${to}`, label, detail, to, type: language === "tr" ? "Sayfa" : "Page", featured: index < 5, search: `${label} ${detail}` })),
    ...formats.map((format) => ({
      id: `format-${format.id}`,
      label: local(format.name, language),
      detail: `${local(format.descriptor, language)} · ${local(format.appearance, language)}`,
      to: `/products/${format.id}`,
      type: language === "tr" ? "Kahve formatı" : "Coffee format",
      number: format.number,
      kind: "format",
      featured: location.pathname.startsWith("/products"),
      search: `${local(format.name, "en")} ${local(format.name, "tr")} ${local(format.descriptor, language)} ${local(format.appearance, language)}`,
    })),
  ], [formats, language, location.pathname]);

  const results = useMemo(() => {
    const term = normalise(query.trim());
    if (term) return items.filter((item) => normalise(`${item.label} ${item.detail} ${item.search}`).includes(term)).slice(0, 9);
    let recent = [];
    try { recent = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { /* Recents are optional. */ }
    const ordered = [
      ...recent.map((path) => items.find((item) => item.to === path)).filter(Boolean),
      ...items.filter((item) => item.featured && item.to !== location.pathname),
    ];
    return [...new Map(ordered.map((item) => [item.id, item])).values()].slice(0, 8);
  }, [items, location.pathname, query]);

  const relatedFormats = useMemo(() => {
    if (!query.trim() || !results.length || results.length >= 3) return [];
    const resultIds = new Set(results.map((item) => item.id));
    return items.filter((item) => item.kind === "format" && !resultIds.has(item.id)).slice(0, 3 - results.length);
  }, [items, query, results]);

  useEffect(() => {
    document.documentElement.dataset.motion = systemCalm || motion === "calm" ? "calm" : "full";
    return () => delete document.documentElement.dataset.motion;
  }, [motion, systemCalm]);

  useEffect(() => {
    const show = (event) => { triggerRef.current = event.detail?.trigger || document.activeElement; setOpen(true); };
    const beforeNavigation = () => setOpen(false);
    const onKeyDown = (event) => {
      const target = event.target;
      const editing = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target?.isContentEditable;
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); show(event); }
      else if (!editing && event.key === "/") { event.preventDefault(); show(event); }
    };
    window.addEventListener("app:open-discovery", show);
    window.addEventListener("app:before-navigation", beforeNavigation);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("app:open-discovery", show);
      window.removeEventListener("app:before-navigation", beforeNavigation);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) { dialog.showModal(); document.body.classList.add("discovery-open"); requestAnimationFrame(() => inputRef.current?.focus()); }
    else if (!open && dialog.open) dialog.close();
    if (!open) document.body.classList.remove("discovery-open");
  }, [open]);
  useEffect(() => { if (!open) setQuery(""); }, [open, language]);

  const close = () => setOpen(false);
  const remember = (path) => {
    try {
      const previous = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
      localStorage.setItem(RECENT_KEY, JSON.stringify([path, ...previous.filter((item) => item !== path)].slice(0, 4)));
    } catch { /* Navigation remains available when storage is blocked. */ }
    close();
  };
  const toggleMotion = () => {
    if (systemCalm) return;
    const next = motion === "calm" ? "full" : "calm";
    setMotion(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* preference remains active for this visit */ }
  };
  const focusResult = (index) => resultRefs.current[Math.max(0, Math.min(results.length - 1, index))]?.focus();

  return (
    <dialog ref={dialogRef} className="discovery-deck" aria-labelledby="discovery-title" onCancel={(event) => { event.preventDefault(); close(); }} onClose={() => { setOpen(false); document.body.classList.remove("discovery-open"); triggerRef.current?.focus?.({ preventScroll: true }); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
      <div className="discovery-deck__surface">
        <header className="discovery-deck__header"><div><span><Sparkles aria-hidden="true" />{language === "tr" ? "Makendi format bulucu" : "Makendi format finder"}</span><h2 id="discovery-title">{language === "tr" ? "Doğru bilgiye tek adımda ulaşın." : "Reach the right information in one step."}</h2></div><button type="button" className="discovery-deck__close" onClick={close} aria-label={language === "tr" ? "Keşif panelini kapat" : "Close discovery deck"}><X aria-hidden="true" /></button></header>
        <label className="discovery-deck__search"><Search aria-hidden="true" /><span className="sr-only">{language === "tr" ? "Makendi.coffee'de ara" : "Search Makendi.coffee"}</span><input ref={inputRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); focusResult(0); } }} placeholder={language === "tr" ? "Format, yapı, proses veya sayfa ara…" : "Search format, structure, process or page…"} autoComplete="off" /><kbd>⌘ K</kbd></label>
        <div className="discovery-deck__meta"><span>{language === "tr" ? "03 format · iki dil" : "03 formats · bilingual"}</span><span>{query ? `${results.length} ${language === "tr" ? "sonuç" : "results"}` : language === "tr" ? "Önerilen ve son görüntülenenler" : "Suggested and recently viewed"}</span></div>
        <div className="discovery-deck__results" role="list">
          {results.map((item, index) => <Link ref={(node) => { resultRefs.current[index] = node; }} key={item.id} to={item.to} role="listitem" onClick={() => remember(item.to)} onKeyDown={(event) => { if (event.key === "ArrowDown") { event.preventDefault(); focusResult(index + 1); } if (event.key === "ArrowUp") { event.preventDefault(); index === 0 ? inputRef.current?.focus() : focusResult(index - 1); } }}><span className="discovery-deck__visual">{item.number || <Search aria-hidden="true" />}</span><span className="discovery-deck__copy"><small>{item.type}</small><strong>{item.label}</strong><em>{item.detail}</em></span><ArrowUpRight aria-hidden="true" /></Link>)}
          {!!relatedFormats.length && <nav className="discovery-deck__related" aria-label={language === "tr" ? "Diğer kahve formatları" : "Other coffee formats"}><div><Sparkles aria-hidden="true" /><span>{language === "tr" ? "Format yelpazesine devam edin" : "Continue through the format spectrum"}</span></div><p>{language === "tr" ? "Yapı, çözünme ve görünüm açısından diğer seçenekleri karşılaştırın." : "Compare the other structures by appearance, solubility and application direction."}</p><div className="discovery-deck__related-grid">{relatedFormats.map((item) => <Link key={`related-${item.id}`} to={item.to} onClick={() => remember(item.to)}><span>{item.number}</span><strong>{item.label}</strong><ArrowUpRight aria-hidden="true" /></Link>)}</div></nav>}
          {!results.length && <div className="discovery-deck__empty"><Search aria-hidden="true" /><strong>{language === "tr" ? "Eşleşme bulunamadı." : "No match found."}</strong><span>{language === "tr" ? "Başka bir format, yapı veya proses deneyin." : "Try another format, structure or process."}</span></div>}
        </div>
        <footer className="discovery-deck__footer"><button type="button" onClick={toggleMotion} disabled={systemCalm} aria-pressed={systemCalm || motion === "calm"}><Gauge aria-hidden="true" /><span><strong>{language === "tr" ? "Hareket" : "Motion"}</strong><small>{systemCalm ? (language === "tr" ? "Sistem: sakin" : "System: calm") : motion === "calm" ? (language === "tr" ? "Sakin" : "Calm") : (language === "tr" ? "Tam" : "Full")}</small></span></button><p><kbd>↑</kbd><kbd>↓</kbd>{language === "tr" ? "gezin" : "navigate"}<kbd>Esc</kbd>{language === "tr" ? "kapat" : "close"}</p></footer>
      </div>
    </dialog>
  );
}
