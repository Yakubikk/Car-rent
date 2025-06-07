import { Link } from "react-router-dom";
import { Car, MapPin, Smartphone, Zap, Shield, BarChart2 } from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

export default function MainPage() {
  const { user } = usePermissions();

  return (
    <div className="bg-gradient-to-br from-pink-light to-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 py-16 md:py-24 lg:py-32 flex flex-col items-center text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-pink-text mb-4 sm:mb-6">
            <img
              src="https://hello.by/_next/image?url=%2Fassets%2Flogo.png&w=1080&q=75"
              alt="Hello Car Sharing Logo"
              className="h-32 w-auto inline-block"
            />
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-pink-text max-w-2xl md:max-w-3xl mb-8 sm:mb-10">
            Свобода на четырёх колёсах. Арендуйте автомобиль за минуты и исследуйте город в своём ритме.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
            {user ? (
              <Link
                to="/catalog"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-pink-primary hover:bg-pink-hover font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                <span className="text-white">Выбрать авто</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-pink-primary hover:bg-pink-hover font-semibold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                <span className="text-white">Войти</span>
              </Link>
            )}
            <Link
              to="/about"
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white hover:bg-pink-light text-pink-text font-semibold rounded-lg shadow-md transition-all duration-300 text-sm sm:text-base"
            >
              Узнать больше
            </Link>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-pink-secondary rounded-full opacity-20 -mr-20 sm:-mr-32 -mt-20 sm:-mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-pink-light rounded-full opacity-10 -ml-32 sm:-ml-64 -mb-32 sm:-mb-64"></div>
      </header>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-pink-text mb-12 sm:mb-16">
            Почему выбирают Hello?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {[
              {
                icon: <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-pink-primary" />,
                title: "Мгновенное бронирование",
                desc: "Забронируйте автомобиль менее чем за минуту через наше приложение.",
              },
              {
                icon: <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-pink-primary" />,
                title: "Автомобили по всему городу",
                desc: "Сотни автомобилей доступны во всех районах города.",
              },
              {
                icon: <Car className="w-8 h-8 sm:w-10 sm:h-10 text-pink-primary" />,
                title: "Разнообразие моделей",
                desc: "От компактных автомобилей до внедорожников - выберите то, что вам нужно.",
              },
              {
                icon: <Smartphone className="w-8 h-8 sm:w-10 sm:h-10 text-pink-primary" />,
                title: "Мобильное приложение",
                desc: "Полный контроль со смартфона - откройте, поезжайте, верните.",
              },
              {
                icon: <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-pink-primary" />,
                title: "Полная страховка",
                desc: "Все аренды включают комплексное страховое покрытие.",
              },
              {
                icon: <BarChart2 className="w-8 h-8 sm:w-10 sm:h-10 text-pink-primary" />,
                title: "Прозрачные цены",
                desc: "Никаких скрытых платежей. Платите только за то, что используете.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-pink-light p-6 sm:p-8 rounded-xl hover:shadow-pink transition-shadow duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 mb-4 sm:mb-6 rounded-full bg-white mx-auto">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center mb-2 sm:mb-3 text-pink-text">
                  {feature.title}
                </h3>
                <p className="text-pink-text opacity-80 text-center text-sm sm:text-base">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-pink-primary">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Готовы отправиться в путь?</h2>
          <p className="text-lg sm:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto">
            Скачайте наше приложение и получите первые 30 минут бесплатно!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <button className="px-5 sm:px-6 py-2 sm:py-3 bg-white text-pink-primary font-semibold rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.6 13.4l-4.2-7.2c-.3-.5-.7-.7-1.2-.7-.5 0-.9.2-1.2.7l-4.2 7.2c-.3.5-.3 1.1 0 1.6.3.5.7.8 1.2.8h8.4c.5 0 .9-.3 1.2-.8.3-.5.3-1.1 0-1.6zM7 12l5-8.5 5 8.5H7z" />
              </svg>
              App Store
            </button>
            <button className="px-5 sm:px-6 py-2 sm:py-3 bg-white text-pink-primary font-semibold rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.9 12c0-1.7 1.4-3.1 3.1-3.1h4V3.1H7C3.1 3.1 0 6.2 0 10v2c0 3.9 3.1 7 7 7h4v-5.9H7c-1.7 0-3.1-1.4-3.1-3.1zM17 3.1h-4v5.9h4c1.7 0 3.1 1.4 3.1 3.1s-1.4 3.1-3.1 3.1h-4v5.9h4c3.9 0 7-3.1 7-7v-2c0-3.9-3.1-7-7-7z" />
              </svg>
              Google Play
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pink-dark py-10 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-6 md:mb-0">
              <h2 className="text-xl sm:text-2xl font-bold">Hello Car Sharing</h2>
              <p className="text-pink-light mt-1 sm:mt-2 text-sm sm:text-base">Будущее начинается сегодня</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-8 w-full md:w-auto">
              <div>
                <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Компания</h3>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link to="/about" className="text-pink-light hover:text-white text-xs sm:text-sm">
                      О нас
                    </Link>
                  </li>
                  <li>
                    <Link to="/careers" className="text-pink-light hover:text-white text-xs sm:text-sm">
                      Карьера
                    </Link>
                  </li>
                  <li>
                    <Link to="/press" className="text-pink-light hover:text-white text-xs sm:text-sm">
                      Пресса
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Поддержка</h3>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link to="/help" className="text-pink-light hover:text-white text-xs sm:text-sm">
                      Центр помощи
                    </Link>
                  </li>
                  <li>
                    <Link to="/safety" className="text-pink-light hover:text-white text-xs sm:text-sm">
                      Безопасность
                    </Link>
                  </li>
                  <li>
                    <Link to="/contact" className="text-pink-light hover:text-white text-xs sm:text-sm">
                      Контакты
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Правовая информация</h3>
                <ul className="space-y-1 sm:space-y-2">
                  <li>
                    <Link to="/terms" className="text-gray-400 hover:text-white text-xs sm:text-sm">
                      Условия
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-gray-400 hover:text-white text-xs sm:text-sm">
                      Конфиденциальность
                    </Link>
                  </li>
                  <li>
                    <Link to="/cookies" className="text-gray-400 hover:text-white text-xs sm:text-sm">
                      Cookies
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-xs sm:text-sm">
            <p>© {new Date().getFullYear()} Hello Car Sharing. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
