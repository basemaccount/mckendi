import { useState } from "react";
import { ArrowRight, Coffee, Factory } from "lucide-react";
import { Link as RouterLink } from "react-router-dom";

const local = (value, language) => typeof value === "object" && value !== null ? value[language] : value;

export default function FormatLab({ formats, language, reference, LinkComponent = RouterLink }) {
  const [activeId, setActiveId] = useState(formats[0]?.id);
  const activeIndex = Math.max(0, formats.findIndex(({ id }) => id === activeId));
  const active = formats[activeIndex] || formats[0];
  if (!active) return null;
  const ActiveIcon = active.icon;

  return (
    <section className="section format-lab" aria-labelledby="format-lab-title">
      <div className="shell">
        <div className="format-lab__header">
          <div>
            <p className="eyebrow eyebrow--gold">{language === "tr" ? "Etkileşimli malzeme laboratuvarı" : "Interactive material lab"}</p>
            <h2 id="format-lab-title">{language === "tr" ? "Üç yapı. Tek bir dokunsal alan rehberi." : "Three structures. One tactile field guide."}</h2>
          </div>
          <div className="format-lab__intro">
            <span>{language === "tr" ? "NUMUNE GÖRÜNÜMÜ" : "SPECIMEN VIEW"}</span>
            <p>{language === "tr" ? "Her formatın görünür yapısını, süreç mantığını ve uygulama sorusunu yan yana düşünmek için bir numune seçin." : "Choose a specimen to connect each format’s visible structure, process logic and application question."}</p>
          </div>
        </div>

        <div className="format-lab__workspace" data-format={active.id}>
          <div className="format-lab__controls" aria-label={language === "tr" ? "Bir format seçin" : "Choose a format"}>
            {formats.map((format) => {
              const Icon = format.icon;
              return (
                <button key={format.id} className={format.id === active.id ? "is-active" : ""} type="button" aria-pressed={format.id === active.id} onClick={() => setActiveId(format.id)}>
                  <span>{format.number}</span>
                  <Icon aria-hidden="true" />
                  <strong>{local(format.short, language)}</strong>
                  <small>{local(format.descriptor, language)}</small>
                </button>
              );
            })}
          </div>

          <div className="format-lab__visual" data-optical>
            <div className="format-lab__orbit" aria-hidden="true"><span /><span /><span /></div>
            <img key={active.id} src={active.image} srcSet={active.srcSet} sizes="(max-width: 760px) calc(100vw - 34px), 43vw" alt={local(active.alt, language)} width="960" height="960" loading="lazy" decoding="async" />
            <span className="material-lens" aria-hidden="true"><ActiveIcon /></span>
            <div className="format-lab__specimen"><span>{active.number}</span><strong>{local(active.short, language)}</strong></div>
          </div>

          <div key={active.id} className="format-lab__readout" aria-live="polite">
            <div className="format-lab__readout-top"><Factory aria-hidden="true" /><span>{language === "tr" ? "Format okuması" : "Format reading"}</span></div>
            <p className="eyebrow">{local(active.descriptor, language)}</p>
            <h3>{local(active.name, language)}</h3>
            <p>{local(active.intro, language)}</p>
            <dl>
              <div><dt>{language === "tr" ? "Görünür yapı" : "Visible structure"}</dt><dd>{local(active.appearance, language)}</dd></div>
              <div><dt>{language === "tr" ? "Süreç mantığı" : "Process logic"}</dt><dd>{local(active.process, language)}</dd></div>
            </dl>
            <LinkComponent className="button button--dark" to={`/products/${active.id}`}>{language === "tr" ? "Formatı aç" : "Open the format"}<ArrowRight aria-hidden="true" /></LinkComponent>
            <div className="format-lab__notice"><Coffee aria-hidden="true" /><p>{reference}</p></div>
          </div>
        </div>
      </div>
    </section>
  );
}
