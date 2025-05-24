import React from "react";

// Импорт изображений
import AuroraArcImg from "@/images/h2-tumbslider-img-1.png";
import ChargeboltzImg from "@/images/h2-slider-img-2.png";
import FluxdriveProImg from "@/images/h2-slider-img-5.png";
import VolutaxiImg from "@/images/h2-tumbslider-img-1.png";
import EclipseGlideImg from "@/images/h2-slider-img-6.png";

interface Car {
  name: string;
  motto: string;
  title: string;
  description: string;
  image: string;
}

const carData: Car[] = [
  {
    name: "AURORA ARC",
    motto: "Будущее электромобильности",
    title: "Инновационный электрический кроссовер",
    description:
      "Мощный и экологичный кроссовер с запасом хода до 500 км. Просторный салон и передовые технологии безопасности.",
    image: AuroraArcImg,
  },
  {
    name: "CHARGEBOLTZ",
    motto: "Заряжайся молниеносно",
    title: "Рекордная скорость зарядки",
    description: "Уникальная система быстрой зарядки позволяет зарядить батарею на 80% всего за 15 минут.",
    image: ChargeboltzImg,
  },
  {
    name: "FLUXDRIVE PRO",
    motto: "Преодолей границы",
    title: "Спортивный электромобиль",
    description: "Разгон до 100 км/ч за 3.2 секунды. Аэродинамический дизайн и интеллектуальная система управления.",
    image: FluxdriveProImg,
  },
  {
    name: "VOLTURAXI",
    motto: "Умный городской транспорт",
    title: "Электрический городской автомобиль",
    description: "Компактные габариты, маневренность и экономичность - идеальный выбор для города.",
    image: VolutaxiImg,
  },
  {
    name: "ECLIPSE GLIDE",
    motto: "Тишина и комфорт",
    title: "Премиальный электрический седан",
    description: "Роскошные материалы отделки, бесшумный ход и инновационная система климат-контроля.",
    image: EclipseGlideImg,
  },
];

const RentalsSwiperBlock: React.FC = () => {
  return (
    <></>
  );
};

export { RentalsSwiperBlock };
export default RentalsSwiperBlock;
