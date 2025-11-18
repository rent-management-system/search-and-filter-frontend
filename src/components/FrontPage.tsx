import { useTranslation } from "react-i18next";

const FrontPage = () => {
  const { t } = useTranslation();
  return (
    <div className="front md:h-screen mt-24 md:mt-0">
      <div className="front-child1">
        <p className="text-lg md:text-xl lg:text-4xl pl-8">
          {t("hero.title")} <span className="bate">{t("hero.beta")}</span>
        </p>
        <button className="order">
          <a href="#properties">{t("hero.addProperties")}</a>
        </button>
        <button className="view">
          <a href="#properties">{t("hero.viewProperties")}</a>
        </button>
      </div>

      <div className="front-child2">
        <img className="car car1 lg:max-w-[900px]" src="/hero-imag.png" alt="RentAI hero" />
        <img className="car car2" src="/hero-imag.png" alt="RentAI hero" />
      </div>
    </div>
  );
};

export default FrontPage;
