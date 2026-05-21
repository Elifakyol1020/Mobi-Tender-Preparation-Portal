import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../component/Header";
import "../css/Home.css";
import { homeTranslations } from "../constants/i18n";

function Home() {
  const [lang, setLang] = useState("EN");
  const navigate = useNavigate();

  const handleLangToggle = () => {
    setLang((prev) => (prev === "EN" ? "TR" : "EN"));
  };

  const t = homeTranslations[lang];

  return (
    <div className="home-container">
      <Header
        lang={lang}
        onToggleLang={handleLangToggle}
        actionLabel={t.login}
        onAction={() => navigate("/login")}
      />

      <div className="home-shell">
        <section className="home-intro">
          <p className="home-eyebrow">{t.eyebrow}</p>
          <h1>{t.title}</h1>
          <p className="home-subtitle">{t.subtitle}</p>
          <div className="service-grid" aria-label={t.servicesTitle}>
            {t.services.map((service) => (
              <article className="service-card" key={service.title}>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Home;
