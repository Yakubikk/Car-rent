import { Routes, Route, BrowserRouter } from "react-router-dom"
import { HeaderComponent } from "./components/layout/header"
import { FooterComponent } from "./components/layout/footer"
import { HomePage, LoginPage, NotFoundPage } from "./pages"

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <HeaderComponent />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <FooterComponent />
      </div>
    </BrowserRouter>
  )
}

export default App
