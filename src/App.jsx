import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Coffee,
  Droplets,
  Factory,
  FileCheck2,
  Flame,
  Globe2,
  Mail,
  Menu,
  PackageCheck,
  Send,
  Snowflake,
  Sparkles,
  Sprout,
  ThermometerSun,
  Wind,
  X,
} from "lucide-react";
import { Navigate, Route, Routes, useLocation, useNavigationType, useParams } from "react-router-dom";
import ExperienceLayer from "./components/ExperienceLayer";
import FormatLab from "./components/FormatLab";
import InquiryProgress from "./components/InquiryProgress";
import { Link, NavLink } from "./components/TransitionLink";

const SITE_URL = String(import.meta.env.VITE_PUBLIC_SITE_URL || "https://mckendi.vercel.app").replace(/\/$/, "");
const CONTACT_EMAIL = String(import.meta.env.VITE_CONTACT_EMAIL || "").trim();

const text = {
  en: {
    nav: { products: "Products", process: "How it is made", applications: "Applications", contact: "Contact" },
    language: "Language",
    menuOpen: "Open navigation",
    menuClose: "Close navigation",
    inquiry: "Send an inquiry",
    explore: "Explore the three formats",
    view: "View format",
    back: "Back to products",
    imageNote: "Illustrative AI image · temporary until product photography is supplied",
    reference: "Educational process information is rewritten from public industry references and is not a Mckendi product specification. Final composition, quality, application fit, documentation and availability must be confirmed directly.",
    form: {
      eyebrow: "Product inquiry",
      title: "Tell us what you are developing.",
      copy: "Choose the format that interests you and share the market, application and approximate volume. Mckendi will use the brief to continue the conversation.",
      name: "Name", company: "Company", email: "Work email", market: "Country / market", product: "Format of interest", application: "Application", volume: "Indicative volume", message: "Your brief", consent: "I agree that Mckendi may use these details to respond to my inquiry.", submit: "Send inquiry", sending: "Sending", success: "Thank you. Your inquiry has been recorded.", error: "The inquiry could not be saved. Please try again later.",
    },
  },
  tr: {
    nav: { products: "Ürünler", process: "Nasıl üretilir", applications: "Kullanım alanları", contact: "İletişim" },
    language: "Dil",
    menuOpen: "Menüyü aç",
    menuClose: "Menüyü kapat",
    inquiry: "Talep gönder",
    explore: "Üç formatı keşfet",
    view: "Formatı incele",
    back: "Ürünlere dön",
    imageNote: "Temsili yapay zekâ görseli · ürün fotoğrafları sağlanana kadar geçicidir",
    reference: "Eğitici süreç bilgileri kamuya açık sektör kaynaklarından özgün biçimde yeniden yazılmıştır ve Mckendi ürün spesifikasyonu değildir. Nihai bileşim, kalite, kullanım uygunluğu, belgeler ve bulunabilirlik doğrudan teyit edilmelidir.",
    form: {
      eyebrow: "Ürün talebi",
      title: "Ne geliştirdiğinizi bize anlatın.",
      copy: "İlgilendiğiniz formatı seçin; pazar, kullanım alanı ve yaklaşık hacmi paylaşın. Mckendi bu özet üzerinden görüşmeyi sürdürecektir.",
      name: "Ad soyad", company: "Şirket", email: "İş e-postası", market: "Ülke / pazar", product: "İlgilenilen format", application: "Kullanım alanı", volume: "Tahmini hacim", message: "Talep özeti", consent: "Mckendi'nin talebime yanıt vermek için bu bilgileri kullanmasını kabul ediyorum.", submit: "Talebi gönder", sending: "Gönderiliyor", success: "Teşekkürler. Talebiniz kaydedildi.", error: "Talep kaydedilemedi. Lütfen daha sonra tekrar deneyin.",
    },
  },
};

const formats = [
  {
    id: "spray-dried",
    number: "01",
    icon: Wind,
    name: { en: "Spray dried coffee", tr: "Sprey kurutulmuş kahve" },
    short: { en: "Spray dried", tr: "Sprey kurutulmuş" },
    descriptor: { en: "Fine · uniform · versatile", tr: "İnce · homojen · çok yönlü" },
    intro: { en: "A fine, free-flowing soluble coffee powder created by dispersing concentrated coffee into a stream of warm air.", tr: "Konsantre kahvenin sıcak hava akımına dağıtılmasıyla elde edilen ince ve akışkan çözünebilir kahve tozudur." },
    process: { en: "Concentrated coffee is atomised into small droplets. Warm moving air removes water rapidly, leaving a fine powder.", tr: "Konsantre kahve küçük damlacıklara ayrılır. Hareketli sıcak hava suyu hızla uzaklaştırır ve geride ince bir toz bırakır." },
    appearance: { en: "Fine, even powder", tr: "İnce, homojen toz" },
    direction: { en: "A practical format for blends, beverages and applications where consistent dispersion matters.", tr: "Harmanlar, içecekler ve homojen dağılımın önemli olduğu uygulamalar için pratik bir formattır." },
    image: "/images/mckendi-spray-dried.webp",
    srcSet: "/images/mckendi-spray-dried-480.webp 480w, /images/mckendi-spray-dried-720.webp 720w, /images/mckendi-spray-dried-960.webp 960w",
    alt: { en: "Fine spray dried instant coffee powder in a bowl", tr: "Bir kâsede ince sprey kurutulmuş çözünebilir kahve tozu" },
  },
  {
    id: "agglomerated",
    number: "02",
    icon: Sparkles,
    name: { en: "Agglomerated coffee", tr: "Aglomere kahve" },
    short: { en: "Agglomerated", tr: "Aglomere" },
    descriptor: { en: "Porous · rounded · easy to handle", tr: "Gözenekli · yuvarlak · kullanımı kolay" },
    intro: { en: "A granulated soluble format made by gathering smaller spray-dried particles into larger, porous clusters.", tr: "Daha küçük sprey kurutulmuş parçacıkların daha büyük ve gözenekli kümeler hâlinde birleştirilmesiyle oluşan granül formattır." },
    process: { en: "Fine soluble particles are lightly re-moistened and brought together. The resulting clusters are dried into pourable granules.", tr: "İnce çözünebilir parçacıklar kontrollü biçimde yeniden nemlendirilip bir araya getirilir. Oluşan kümeler akışkan granüller hâlinde kurutulur." },
    appearance: { en: "Small, rounded porous granules", tr: "Küçük, yuvarlak ve gözenekli granüller" },
    direction: { en: "A familiar granulated presentation for retail, food-service and beverage preparation contexts.", tr: "Perakende, yiyecek-içecek hizmetleri ve içecek hazırlama ortamları için tanıdık granül sunumdur." },
    image: "/images/mckendi-agglomerated.webp",
    srcSet: "/images/mckendi-agglomerated-480.webp 480w, /images/mckendi-agglomerated-720.webp 720w, /images/mckendi-agglomerated-960.webp 960w",
    alt: { en: "Small agglomerated instant coffee granules in a bowl", tr: "Bir kâsede küçük aglomere çözünebilir kahve granülleri" },
  },
  {
    id: "freeze-dried",
    number: "03",
    icon: Snowflake,
    name: { en: "Freeze dried coffee", tr: "Dondurularak kurutulmuş kahve" },
    short: { en: "Freeze dried", tr: "Dondurularak kurutulmuş" },
    descriptor: { en: "Angular · airy · distinctive", tr: "Köşeli · hafif · ayırt edici" },
    intro: { en: "A crystalline soluble format produced by freezing concentrated coffee and removing water under vacuum.", tr: "Konsantre kahvenin dondurulup vakum altında suyunun uzaklaştırılmasıyla üretilen kristalimsi çözünebilir formattır." },
    process: { en: "Filtered coffee concentrate is frozen and divided into pieces. Under vacuum, frozen water is removed without returning to a liquid state, leaving airy crystals.", tr: "Filtrelenmiş kahve konsantresi dondurulur ve parçalara ayrılır. Vakum altında donmuş su sıvı hâle dönmeden uzaklaştırılır ve hafif kristaller kalır." },
    appearance: { en: "Large, irregular angular crystals", tr: "Büyük, düzensiz ve köşeli kristaller" },
    direction: { en: "A visually distinctive format for applications where crystal appearance is part of the intended presentation.", tr: "Kristal görünümün sunumun bir parçası olduğu uygulamalar için görsel olarak ayırt edici bir formattır." },
    image: "/images/mckendi-freeze-dried.webp",
    srcSet: "/images/mckendi-freeze-dried-480.webp 480w, /images/mckendi-freeze-dried-720.webp 720w, /images/mckendi-freeze-dried-960.webp 960w",
    alt: { en: "Angular freeze dried instant coffee crystals in a bowl", tr: "Bir kâsede köşeli dondurularak kurutulmuş kahve kristalleri" },
  },
];

function local(value, language) { return typeof value === "object" ? value[language] : value; }
function useMeta(title, description, path = "/") { useEffect(() => { document.title = title; document.querySelector('meta[name="description"]')?.setAttribute("content", description); document.querySelector('link[rel="canonical"]')?.setAttribute("href", `${SITE_URL}${path}`); }, [description, path, title]); }

function ScrollManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const positions = useRef(new Map());
  const currentKey = useRef(location.key);
  const ignoreScrollEvents = useRef(false);

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    const rememberPosition = () => {
      if (!ignoreScrollEvents.current) positions.current.set(currentKey.current, window.scrollY);
    };
    const rememberBeforeNavigation = () => {
      positions.current.set(currentKey.current, window.scrollY);
      ignoreScrollEvents.current = true;
    };
    const restoreAfterCache = (event) => {
      if (!event.persisted) return;
      ignoreScrollEvents.current = false;
      document.documentElement.classList.remove("is-restoring-scroll", "route-changing");
      positions.current.set(currentKey.current, window.scrollY);
    };

    window.history.scrollRestoration = "manual";
    window.addEventListener("scroll", rememberPosition, { passive: true });
    window.addEventListener("pagehide", rememberPosition);
    window.addEventListener("pageshow", restoreAfterCache);
    window.addEventListener("popstate", rememberBeforeNavigation);
    window.addEventListener("app:before-navigation", rememberBeforeNavigation);

    return () => {
      positions.current.set(currentKey.current, window.scrollY);
      window.history.scrollRestoration = previousRestoration;
      window.removeEventListener("scroll", rememberPosition);
      window.removeEventListener("pagehide", rememberPosition);
      window.removeEventListener("pageshow", restoreAfterCache);
      window.removeEventListener("popstate", rememberBeforeNavigation);
      window.removeEventListener("app:before-navigation", rememberBeforeNavigation);
    };
  }, []);

  useLayoutEffect(() => {
    currentKey.current = location.key;
    const savedPosition = navigationType === "POP" ? positions.current.get(location.key) : 0;
    const top = Number.isFinite(savedPosition) ? savedPosition : 0;
    const root = document.documentElement;
    root.classList.add("is-restoring-scroll");
    let settleFrame = 0;
    let remainingSettleFrames = navigationType === "POP" ? 4 : 1;
    const settlePosition = () => {
      window.scrollTo({ top, left: 0, behavior: "instant" });
      positions.current.set(location.key, top);
      remainingSettleFrames -= 1;
      if (remainingSettleFrames > 0) settleFrame = window.requestAnimationFrame(settlePosition);
    };
    settlePosition();
    const releaseTimer = window.setTimeout(() => {
      root.classList.remove("is-restoring-scroll");
      ignoreScrollEvents.current = false;
      positions.current.set(currentKey.current, window.scrollY);
    }, 700);

    return () => {
      window.clearTimeout(releaseTimer);
      if (settleFrame) window.cancelAnimationFrame(settleFrame);
      root.classList.remove("is-restoring-scroll");
    };
  }, [location.key, navigationType]);

  return null;
}

function Header({ language, setLanguage, copy }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigation = useRef(null);
  const menuButton = useRef(null);
  const menuWasOpen = useRef(false);
  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => { const restoreFromCache = () => setOpen(false); window.addEventListener("app:pageshow", restoreFromCache); return () => window.removeEventListener("app:pageshow", restoreFromCache); }, []);
  useEffect(() => {
    const key = (event) => { if (event.key === "Escape") setOpen(false); };
    document.body.classList.toggle("no-scroll", open);
    if (open) { document.addEventListener("keydown", key); requestAnimationFrame(() => navigation.current?.querySelector("a")?.focus()); }
    return () => { document.body.classList.remove("no-scroll"); document.removeEventListener("keydown", key); };
  }, [open]);
  useEffect(() => {
    const pageRegions = [document.querySelector("#main-content"), document.querySelector(".site-footer")].filter(Boolean);
    pageRegions.forEach((region) => { region.inert = open; });
    if (!open && menuWasOpen.current) menuButton.current?.focus();
    menuWasOpen.current = open;
    return () => pageRegions.forEach((region) => { region.inert = false; });
  }, [open]);
  const navigationItems = [[copy.nav.products, "/products"], [copy.nav.process, "/process"], [copy.nav.applications, "/applications"]];
  return <><header className="site-header"><Link className="brand" to="/" aria-label="Mckendi home"><img src="/mckendi-logo-320.webp" srcSet="/mckendi-logo-192.webp 192w, /mckendi-logo-320.webp 320w" sizes="150px" alt="Mckendi Sunrise — Real Coffee Experience" width="320" height="226" /></Link><nav className="desktop-nav" aria-label="Primary navigation">{navigationItems.map(([label, to]) => <NavLink key={to} to={to}>{label}</NavLink>)}</nav><div className="header-actions"><div className="language-switcher" aria-label={copy.language}>{["en","tr"].map((code) => <button key={code} type="button" className={language === code ? "is-active" : ""} onClick={() => setLanguage(code)} aria-pressed={language === code}>{code.toUpperCase()}</button>)}</div><Link className="button button--dark header-cta" to="/contact">{copy.inquiry}<ArrowRight aria-hidden="true" /></Link><button ref={menuButton} className="menu-button" type="button" aria-label={open ? copy.menuClose : copy.menuOpen} aria-controls="mobile-navigation" aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}</button></div></header><div ref={navigation} id="mobile-navigation" className={`mobile-navigation ${open ? "is-open" : ""}`} aria-hidden={!open} inert={!open ? true : undefined}><nav aria-label="Mobile navigation">{navigationItems.map(([label,to], index) => <NavLink key={to} to={to}><span>0{index + 1}</span>{label}<ArrowRight aria-hidden="true" /></NavLink>)}<NavLink to="/contact"><span>04</span>{copy.nav.contact}<ArrowRight aria-hidden="true" /></NavLink></nav><div className="mobile-navigation__note"><Coffee aria-hidden="true" /><p>{language === "tr" ? "Üç çözünebilir kahve formatı. Net bilgi. Doğrudan talep." : "Three soluble coffee formats. Clear information. Direct inquiry."}</p></div></div></>;
}

function ProductCard({ format, language, copy }) { const Icon = format.icon; return <article className="product-card"><Link className="product-card__media" to={`/products/${format.id}`}><img src={format.image} srcSet={format.srcSet} sizes="(max-width: 760px) calc(100vw - 34px), (max-width: 1100px) calc(50vw - 36px), 390px" alt={local(format.alt, language)} loading="lazy" decoding="async" width="960" height="960" style={{ viewTransitionName: `format-${format.id}` }} /><span className="product-card__number">{format.number}</span><span className="image-disclosure">{copy.imageNote}</span></Link><div className="product-card__content"><p className="eyebrow">{local(format.descriptor, language)}</p><h3><Link to={`/products/${format.id}`}>{local(format.name, language)}</Link></h3><p>{local(format.intro, language)}</p><dl><div><dt>{language === "tr" ? "Görünüm" : "Appearance"}</dt><dd>{local(format.appearance, language)}</dd></div><div><dt>{language === "tr" ? "Kullanım yönü" : "Application direction"}</dt><dd>{local(format.direction, language)}</dd></div></dl><Link className="text-link" to={`/products/${format.id}`}>{copy.view}<ArrowRight aria-hidden="true" /></Link></div></article>; }

function SectionHeading({ eyebrow, title, copy }) { return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{copy && <p>{copy}</p>}</div>; }

function HomePage({ language, copy }) {
  useMeta(language === "tr" ? "Mckendi — Üç çözünebilir kahve formatı" : "Mckendi — Three forms of instant coffee", language === "tr" ? "Sprey kurutulmuş, aglomere ve dondurularak kurutulmuş çözünebilir kahveyi keşfedin." : "Explore spray dried, agglomerated and freeze dried soluble coffee formats.");
  return <><section className="hero"><div className="shell hero__grid"><div className="hero__copy"><p className="eyebrow eyebrow--gold">{language === "tr" ? "Gerçek kahve deneyimi" : "Real coffee experience"}</p><h1>{language === "tr" ? "Çözünebilir kahve, üç farklı biçimde." : "Instant coffee, expressed in three distinct forms."}</h1><p>{language === "tr" ? "İnce tozdan gözenekli granüllere ve köşeli kristallere: görünümü şekillendiren son kurutma adımını keşfedin." : "From fine powder to porous granules and angular crystals, discover the final drying step that shapes each format."}</p><div className="hero__actions"><Link className="button button--gold" to="/products">{copy.explore}<ArrowRight aria-hidden="true" /></Link><Link className="button button--glass" to="/contact">{copy.inquiry}</Link></div><div className="hero__proof"><span><Factory aria-hidden="true" />{language === "tr" ? "Süreç odaklı bilgi" : "Process-led information"}</span><span><FileCheck2 aria-hidden="true" />{language === "tr" ? "Spesifikasyon talep üzerine" : "Specifications by inquiry"}</span></div></div><div className="hero__media" data-optical><img src="/images/mckendi-instant-hero.webp" srcSet="/images/mckendi-instant-hero-640.webp 640w, /images/mckendi-instant-hero-960.webp 960w, /images/mckendi-instant-hero-1280.webp 1280w" sizes="(max-width: 800px) calc(100vw - 34px), 48vw" alt={language === "tr" ? "Üç çözünebilir kahve dokusu ve hazırlanmış bir fincan" : "Three instant coffee textures and a prepared cup"} width="1280" height="853" fetchPriority="high" decoding="async" /><span className="material-lens" aria-hidden="true"><Coffee /></span><span className="hero__image-note">{copy.imageNote}</span><div className="hero__stamp"><span>03</span>{language === "tr" ? "FORMAT" : "FORMATS"}</div></div></div></section><section className="format-ribbon"><div className="shell">{formats.map((format) => { const Icon = format.icon; return <Link key={format.id} to={`/products/${format.id}`}><Icon aria-hidden="true" /><span>{format.number}</span><strong>{local(format.short, language)}</strong><ArrowRight aria-hidden="true" /></Link>; })}</div></section><FormatLab formats={formats} language={language} reference={copy.reference} LinkComponent={Link} /><section className="section shell"><SectionHeading eyebrow={language === "tr" ? "Üç format" : "Three formats"} title={language === "tr" ? "Farkı son kurutma adımı yaratır." : "The final drying step creates the visible difference."} copy={language === "tr" ? "Her format demlenmiş kahve ekstraktıyla başlar. Konsantrenin nasıl kurutulduğu nihai yapıyı belirler." : "Every format begins with brewed coffee extract. The way the concentrate is dried determines the final structure."} /><div className="product-grid">{formats.map((format) => <ProductCard key={format.id} format={format} language={language} copy={copy} />)}</div></section><section className="section section--green"><div className="shell process-feature"><div><p className="eyebrow eyebrow--gold">{language === "tr" ? "Ortak başlangıç" : "A shared beginning"}</p><h2>{language === "tr" ? "Çekirdekten ekstrakta, ekstraktan çözünebilir kahveye." : "From bean to extract, then from extract to soluble coffee."}</h2><p>{language === "tr" ? "Seçim, kavurma, ekstraksiyon, filtrasyon ve konsantrasyon adımlarından sonra kurutma yöntemi ürünün görünür biçimini oluşturur." : "After selection, roasting, extraction, filtration and concentration, the drying route creates the product’s visible form."}</p><Link className="button button--light" to="/process">{copy.nav.process}<ArrowRight aria-hidden="true" /></Link></div><ol><li><span>01</span><Coffee aria-hidden="true" /><strong>{language === "tr" ? "Demleme ve ekstraksiyon" : "Brew and extract"}</strong></li><li><span>02</span><Droplets aria-hidden="true" /><strong>{language === "tr" ? "Filtrele ve yoğunlaştır" : "Filter and concentrate"}</strong></li><li><span>03</span><ThermometerSun aria-hidden="true" /><strong>{language === "tr" ? "Formatı oluştur" : "Create the format"}</strong></li></ol></div></section><section className="section inquiry-cta"><div className="shell"><div><p className="eyebrow">{language === "tr" ? "Bir sonraki adım" : "The next step"}</p><h2>{language === "tr" ? "Uygulamanızı ve hedef formatı paylaşın." : "Share the application and the format you have in mind."}</h2><p>{language === "tr" ? "Formülasyon, numune, belge ve ticari ayrıntılar ancak doğrudan görüşmede teyit edilir." : "Formulation, samples, documentation and commercial details are confirmed only through direct discussion."}</p></div><Link className="button button--dark" to="/contact">{copy.inquiry}<ArrowRight aria-hidden="true" /></Link></div></section></>;
}

function ProductsPage({ language, copy }) { useMeta(language === "tr" ? "Çözünebilir kahve formatları — Mckendi" : "Instant coffee formats — Mckendi", language === "tr" ? "Mckendi'nin üç çözünebilir kahve formatını keşfedin." : "Explore Mckendi’s three instant coffee formats.", "/products"); return <><PageHero eyebrow={language === "tr" ? "Ürün bilgileri" : "Product information"} title={language === "tr" ? "Bir ortak başlangıç. Üç farklı yapı." : "One shared starting point. Three distinct structures."} copy={language === "tr" ? "Sprey kurutulmuş, aglomere ve dondurularak kurutulmuş kahvenin görünümünü ve üretim mantığını inceleyin." : "Explore the appearance and production logic of spray dried, agglomerated and freeze dried coffee."} marker="03" /><section className="section shell"><div className="information-note"><FileCheck2 aria-hidden="true" /><p>{copy.reference}</p></div><div className="product-grid">{formats.map((format) => <ProductCard key={format.id} format={format} language={language} copy={copy} />)}</div></section></>; }

function ProductPage({ language, copy }) { const { productId } = useParams(); const format = formats.find(({id}) => id === productId); useMeta(format ? `${local(format.name, language)} — Mckendi` : "Instant coffee — Mckendi", format ? local(format.intro, language) : "Explore Mckendi instant coffee formats.", format ? `/products/${format.id}` : "/products"); if (!format) return <Navigate to="/products" replace />; const Icon = format.icon; return <><section className="product-detail"><div className="shell product-detail__grid"><div className="product-detail__media"><img src={format.image} srcSet={format.srcSet} sizes="(max-width: 760px) calc(100vw - 34px), 50vw" alt={local(format.alt, language)} width="960" height="960" fetchPriority="high" decoding="async" style={{ viewTransitionName: `format-${format.id}` }} /><span className="image-disclosure">{copy.imageNote}</span><strong>{format.number}</strong></div><div className="product-detail__copy"><Link className="breadcrumbs" to="/products">{copy.back}<ChevronRight aria-hidden="true" /></Link><p className="eyebrow">{local(format.descriptor, language)}</p><h1>{local(format.name, language)}</h1><p className="lede">{local(format.intro, language)}</p><dl><div><dt>{language === "tr" ? "Görünüm" : "Appearance"}</dt><dd>{local(format.appearance, language)}</dd></div><div><dt>{language === "tr" ? "Süreç özeti" : "Process summary"}</dt><dd>{local(format.process, language)}</dd></div><div><dt>{language === "tr" ? "Uygulama yönü" : "Application direction"}</dt><dd>{local(format.direction, language)}</dd></div></dl><Link className="button button--dark" to={`/contact?product=${format.id}`}>{copy.inquiry}<ArrowRight aria-hidden="true" /></Link><p className="source-note">{copy.reference}</p></div></div></section><section className="section shell"><SectionHeading eyebrow={language === "tr" ? "Süreç mantığı" : "Process logic"} title={language === "tr" ? "Bu format nasıl oluşur?" : "How does this format take shape?"} /><div className="explain-grid"><article><Icon aria-hidden="true" /><h2>{language === "tr" ? "Son kurutma adımı" : "The final drying step"}</h2><p>{local(format.process, language)}</p></article><article><PackageCheck aria-hidden="true" /><h2>{language === "tr" ? "Nelerin teyit edilmesi gerekir?" : "What still needs confirmation?"}</h2><p>{language === "tr" ? "Karışım, duyusal profil, yoğunluk, nem, çözünürlük, ambalaj ve belgeler gerçek ürün spesifikasyonuna göre doğrulanmalıdır." : "Blend, sensory profile, density, moisture, solubility, packaging and documentation must be verified against the actual product specification."}</p></article></div></section></>; }

function ProcessPage({ language, copy }) { useMeta(language === "tr" ? "Çözünebilir kahve nasıl üretilir — Mckendi" : "How instant coffee is made — Mckendi", language === "tr" ? "Ekstraksiyondan üç kurutma yöntemine çözünebilir kahve sürecini öğrenin." : "Learn the instant coffee process from extraction to three drying routes.", "/process"); const steps = language === "tr" ? [["Seçim ve kavurma", "Yeşil kahve seçilir ve hedeflenen ekstraksiyon yaklaşımına göre kavrulur."], ["Ekstraksiyon", "Kavrulmuş kahvedeki çözünebilir bileşenler suyla alınarak kahve ekstraktı oluşturulur."], ["Filtrasyon ve konsantrasyon", "Ekstrakt filtrelenir; kurutma öncesinde suyun bir bölümü uzaklaştırılarak yoğunlaştırılır."], ["Son kurutma", "Sprey kurutma, aglomerasyon veya dondurarak kurutma nihai fiziksel yapıyı oluşturur."]] : [["Selection and roasting", "Green coffee is selected and roasted for the intended extraction approach."], ["Extraction", "Water draws soluble material from roasted coffee to create a coffee extract."], ["Filtration and concentration", "The extract is filtered and part of its water is removed before drying."], ["Final drying", "Spray drying, agglomeration or freeze drying creates the final physical structure."]]; return <><PageHero eyebrow={language === "tr" ? "Çekirdekten çözünebilir kahveye" : "From bean to soluble coffee"} title={language === "tr" ? "Üç format aynı temel sürecin sonunda ayrışır." : "The three formats diverge at the end of one shared process."} copy={language === "tr" ? "Bu genel bakış eğitim amaçlıdır. Gerçek üretim parametreleri ve ürün spesifikasyonları tedarikçiye ve ürüne göre değişir." : "This overview is educational. Actual production parameters and product specifications vary by supplier and product."} marker={language === "tr" ? "Süreç" : "Process"} /><section className="section shell"><ol className="process-steps">{steps.map(([title, description], index) => <li key={title}><span>0{index + 1}</span>{[Sprout, Flame, Droplets, Factory].map((Icon, iconIndex) => iconIndex === index && <Icon key={title} aria-hidden="true" />)}<h2>{title}</h2><p>{description}</p></li>)}</ol></section><section className="section drying-routes"><div className="shell"><SectionHeading eyebrow={language === "tr" ? "Son adım" : "The final step"} title={language === "tr" ? "Kurutma yolu görünür formu belirler." : "The drying route determines the visible form."} /> <div className="route-grid">{formats.map((format) => { const Icon = format.icon; return <Link key={format.id} to={`/products/${format.id}`}><span>{format.number}</span><Icon aria-hidden="true" /><h3>{local(format.short, language)}</h3><p>{local(format.process, language)}</p><ArrowRight aria-hidden="true" /></Link>; })}</div><div className="source-reference"><p>{copy.reference}</p><a href="https://www.cafea.com/en/products/instant-coffee" target="_blank" rel="noreferrer">{language === "tr" ? "Editoryal referans: Caféa çözünebilir kahve genel bakışı" : "Editorial reference: Caféa instant coffee overview"}<ArrowRight aria-hidden="true" /></a></div></div></section></>; }

function ApplicationsPage({ language }) { useMeta(language === "tr" ? "Kullanım alanları — Mckendi" : "Applications — Mckendi", language === "tr" ? "Çözünebilir kahve formatları için bilgi amaçlı kullanım alanları." : "Informational application pathways for soluble coffee formats.", "/applications"); const items = language === "tr" ? [["Perakende sunumu", "Kavanoz, poşet ve tek porsiyon formatları için ürün yapısı ve paketleme gereksinimleri birlikte değerlendirilir."], ["Yiyecek-içecek hizmetleri", "Hazırlama yöntemi, dozaj, ekipman ve servis hızı hedef formatın seçiminde rol oynar."], ["Otomat ve içecek sistemleri", "Akış, dozlama, çözünme ve depolama davranışı gerçek sistemle test edilmelidir."], ["Gıda ve içecek bileşeni", "Tarif, proses, tat hedefi ve düzenleyici gereklilikler uygulamaya özel doğrulama gerektirir."]] : [["Retail presentation", "Product structure and packaging requirements are considered together for jars, pouches and single-serve formats."], ["Food service", "Preparation method, dose, equipment and service speed all influence the suitable format."], ["Vending and beverage systems", "Flow, dosing, dissolution and storage behaviour should be tested in the actual system."], ["Food and beverage ingredient", "Recipe, process, flavour target and regulatory requirements require application-specific validation."]]; return <><PageHero eyebrow={language === "tr" ? "Uygulama bağlamı" : "Application context"} title={language === "tr" ? "Format seçimi, kullanım amacıyla birlikte yapılır." : "Format selection belongs with the intended application."} copy={language === "tr" ? "Bu alanlar ürün uygunluğu iddiası değil, ilk teknik görüşmeyi yönlendiren bilgi başlıklarıdır." : "These pathways are not suitability claims; they are information prompts for the first technical discussion."} marker={language === "tr" ? "Bilgi" : "Inform"} /><section className="section shell"><div className="application-grid">{items.map(([title, description], index) => <article key={title}><span>0{index + 1}</span>{[PackageCheck, Coffee, Factory, Sparkles].map((Icon, iconIndex) => iconIndex === index && <Icon key={title} aria-hidden="true" />)}<h2>{title}</h2><p>{description}</p></article>)}</div></section><section className="section section--green"><div className="shell application-questions"><div><p className="eyebrow eyebrow--gold">{language === "tr" ? "Talep öncesi" : "Before the inquiry"}</p><h2>{language === "tr" ? "Beş soruyla başlayın." : "Start with five questions."}</h2></div><ol><li>{language === "tr" ? "Hangi ürün veya içecek geliştiriliyor?" : "What product or beverage is being developed?"}</li><li>{language === "tr" ? "Hedeflenen kahve karakteri nedir?" : "What coffee character is intended?"}</li><li>{language === "tr" ? "Hazırlama veya üretim sistemi nedir?" : "What is the preparation or production system?"}</li><li>{language === "tr" ? "Hedef pazar ve tahmini hacim nedir?" : "What is the target market and indicative volume?"}</li><li>{language === "tr" ? "Hangi belgeler ve paketleme biçimi gereklidir?" : "What documentation and packaging route is required?"}</li></ol></div></section></>; }

function InquiryForm({ language, copy }) {
  const [state, setState] = useState({ status: "idle", message: "" });
  const formRef = useRef(null);
  const params = new URLSearchParams(useLocation().search);
  const selected = params.get("product") || "";
  const submit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setState({ status: "sending", message: "" });
    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: data.get("name"), company: data.get("company"), email: data.get("email"), market: data.get("market"), product: data.get("product"), application: data.get("application"), volume: data.get("volume"), message: data.get("message"), consent: data.get("consent") === "on", website: data.get("website") || "", language }),
      });
      if (!response.ok) throw new Error();
      form.reset();
      setState({ status: "success", message: copy.form.success });
    } catch {
      setState({ status: "error", message: copy.form.error });
    }
  };
  return <form ref={formRef} className="inquiry-form" onSubmit={submit} aria-busy={state.status === "sending"}><InquiryProgress formRef={formRef} language={language} /><div className="form-grid"><label><span>{copy.form.name}</span><input name="name" autoComplete="name" minLength="2" maxLength="80" required /></label><label><span>{copy.form.company}</span><input name="company" autoComplete="organization" minLength="2" maxLength="120" required /></label><label><span>{copy.form.email}</span><input name="email" type="email" autoComplete="email" maxLength="160" required /></label><label><span>{copy.form.market}</span><input name="market" autoComplete="country-name" maxLength="100" required /></label><label><span>{copy.form.product}</span><select name="product" defaultValue={formats.some(({ id }) => id === selected) ? selected : ""} required><option value="" disabled>{language === "tr" ? "Bir format seçin" : "Choose a format"}</option>{formats.map((format) => <option value={format.id} key={format.id}>{local(format.name, language)}</option>)}</select></label><label><span>{copy.form.application}</span><input name="application" maxLength="120" required /></label><label className="form-grid__wide"><span>{copy.form.volume}</span><input name="volume" maxLength="80" /></label><label className="form-grid__wide"><span>{copy.form.message}</span><textarea name="message" minLength="10" maxLength="2500" rows="6" required /></label><label className="consent-field form-grid__wide"><input name="consent" type="checkbox" required /><span>{copy.form.consent} <Link to="/privacy">{language === "tr" ? "Gizlilik" : "Privacy"}</Link></span></label><label className="bot-field" aria-hidden="true">Website<input name="website" tabIndex="-1" autoComplete="off" /></label></div><div className="form-submit"><button className="button button--gold" type="submit" disabled={state.status === "sending"}>{state.status === "sending" ? copy.form.sending : copy.form.submit}<Send aria-hidden="true" /></button>{state.message && <p className={`form-status is-${state.status}`} role="status">{state.message}</p>}</div></form>;
}

function ContactPage({ language, copy }) { useMeta(language === "tr" ? "İletişim ve ürün talebi — Mckendi" : "Contact and product inquiry — Mckendi", language === "tr" ? "Mckendi çözünebilir kahve ürün talebi gönderin." : "Send a Mckendi soluble coffee product inquiry.", "/contact"); return <><PageHero eyebrow={language === "tr" ? "İletişim" : "Contact"} title={language === "tr" ? "Talebinizi form üzerinden paylaşın." : "Share your inquiry through the form."} copy={language === "tr" ? "Ürün formatı, uygulama, pazar ve yaklaşık hacim, doğru takibin temelini oluşturur." : "Product format, application, market and indicative volume create the basis for the right follow-up."} marker={language === "tr" ? "İnsan desteği" : "Human follow-up"} /><section className="section shell contact-layout"><aside><div className="contact-card"><Mail aria-hidden="true" /><p className="eyebrow eyebrow--gold">{language === "tr" ? "İletişim yolu" : "Contact pathway"}</p><h2>{language === "tr" ? "Önce formu doldurun." : "Begin with the form."}</h2><p>{language === "tr" ? "Mckendi iletişim e-postası ve telefon bilgisi işletme sahibi tarafından teyit edildikten sonra yayımlanacaktır." : "Mckendi’s public email and phone details will be published after confirmation by the business owner."}</p>{CONTACT_EMAIL && <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>}</div><div className="contact-note"><FileCheck2 aria-hidden="true" /><p>{language === "tr" ? "Form şu anda güvenli kayıt yapılandırmasına bağlıdır; teslimat ayrıntıları yayından önce doğrulanacaktır." : "The form is connected to protected submission storage; delivery details will be verified before public launch."}</p></div></aside><div className="form-panel"><p className="eyebrow">{copy.form.eyebrow}</p><h2>{copy.form.title}</h2><p>{copy.form.copy}</p><InquiryForm language={language} copy={copy} /></div></section></>; }

function PrivacyPage({ language }) { useMeta(language === "tr" ? "Gizlilik — Mckendi" : "Privacy — Mckendi", language === "tr" ? "Mckendi gizlilik bilgileri." : "Mckendi privacy information.", "/privacy"); return <section className="section shell policy"><p className="eyebrow">{language === "tr" ? "Gizlilik" : "Privacy"}</p><h1>{language === "tr" ? "Talep bilgileri yalnızca yanıt ve takip için kullanılır." : "Inquiry details are used only for response and follow-up."}</h1><p>{language === "tr" ? "Formda paylaşılan ad, şirket, e-posta, pazar ve ürün talebi bilgileri talebi değerlendirmek amacıyla işlenir. Ödeme bilgisi toplanmaz." : "The name, company, email, market and product-brief information submitted through the form is processed to evaluate the inquiry. No payment information is collected."}</p><p>{language === "tr" ? "Veri sorumlusu, saklama süresi ve iletişim bilgileri işletme sahibi tarafından teyit edildikten sonra bu sayfa güncellenecektir." : "Controller identity, retention period and privacy contact information will be completed after confirmation by the business owner."}</p></section>; }

function PageHero({eyebrow,title,copy,marker}) { return <section className="page-hero"><div className="shell page-hero__grid"><div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1></div><div><span>{marker}</span><p>{copy}</p></div></div></section>; }

function Footer({language,copy}) { return <footer className="site-footer"><div className="shell footer-lead"><div><p className="eyebrow eyebrow--gold">Mckendi</p><h2>{language === "tr" ? "Üç format. Net bilgi. Doğrudan talep." : "Three formats. Clear information. Direct inquiry."}</h2></div><Link className="button button--gold" to="/contact">{copy.inquiry}<ArrowRight aria-hidden="true" /></Link></div><div className="shell footer-grid"><div className="footer-brand"><img src="/mckendi-logo-320.webp" alt="Mckendi" width="320" height="226" loading="lazy" /><p>{language === "tr" ? "Sprey kurutulmuş, aglomere ve dondurularak kurutulmuş çözünebilir kahve için bilgi platformu." : "An information platform for spray dried, agglomerated and freeze dried soluble coffee."}</p></div><div><strong>{language === "tr" ? "Keşfet" : "Explore"}</strong><Link to="/products">{copy.nav.products}</Link><Link to="/process">{copy.nav.process}</Link><Link to="/applications">{copy.nav.applications}</Link></div><div><strong>{language === "tr" ? "İletişim" : "Contact"}</strong><Link to="/contact">{copy.nav.contact}</Link><Link to="/privacy">{language === "tr" ? "Gizlilik" : "Privacy"}</Link>{CONTACT_EMAIL && <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>}</div><div><strong>{language === "tr" ? "Durum" : "Status"}</strong><span>{language === "tr" ? "Bilgilendirme sitesi" : "Informational website"}</span><span>{language === "tr" ? "Çevrimiçi satış yoktur" : "No online sales"}</span><span>{language === "tr" ? "Ürün ayrıntıları talep üzerine" : "Product details by inquiry"}</span></div></div><div className="shell footer-base"><span>© {new Date().getFullYear()} Mckendi</span><span>{language === "tr" ? "Geçici yapay zekâ görselleri ürün fotoğraflarıyla değiştirilecektir" : "Temporary AI imagery will be replaced with product photography"}</span></div></footer>; }

function NotFound({language}) { return <section className="section shell not-found"><span>404</span><h1>{language === "tr" ? "Bu sayfa bulunamadı." : "This page could not be found."}</h1><Link className="button button--dark" to="/">{language === "tr" ? "Ana sayfaya dön" : "Return home"}</Link></section>; }

export default function App() { const [language,setLanguage] = useState(() => localStorage.getItem("mckendi-language") || "en"); const copy=text[language]||text.en; useEffect(()=>{document.documentElement.lang=language;localStorage.setItem("mckendi-language",language);},[language]); return <div className="app-shell"><a className="skip-link" href="#main-content">{language === "tr" ? "İçeriğe geç" : "Skip to content"}</a><ScrollManager/><ExperienceLayer language={language}/><Header language={language} setLanguage={setLanguage} copy={copy}/><main id="main-content"><Routes><Route path="/" element={<HomePage language={language} copy={copy}/>} /><Route path="/products" element={<ProductsPage language={language} copy={copy}/>} /><Route path="/products/:productId" element={<ProductPage language={language} copy={copy}/>} /><Route path="/process" element={<ProcessPage language={language} copy={copy}/>} /><Route path="/applications" element={<ApplicationsPage language={language}/>} /><Route path="/contact" element={<ContactPage language={language} copy={copy}/>} /><Route path="/privacy" element={<PrivacyPage language={language}/>} /><Route path="*" element={<NotFound language={language}/>} /></Routes></main><Footer language={language} copy={copy}/></div>; }
