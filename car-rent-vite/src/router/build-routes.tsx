import type { RouteObject } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ProtectedRoute } from "../components/rbac/ProtectedRoute";
import { getRouteConfig } from "../config/routes";

type RouteWithLayout = RouteObject & {
  layout?: React.ComponentType<{ children: React.ReactNode }>;
};

export function buildRoutes(): RouteObject[] {
  const pages = import.meta.glob("../app/**/page.tsx", { eager: false }) as Record<
    string,
    () => Promise<{ default: React.ComponentType }>
  >;

  const layouts = import.meta.glob("../app/**/layout.tsx", { eager: false }) as Record<
    string,
    () => Promise<{ default: React.ComponentType<{ children: React.ReactNode }> }>
  >;

  const notFound = import.meta.glob("../app/not-found.tsx", { eager: false }) as Record<
    string,
    () => Promise<{ default: React.ComponentType }>
  >;

  const routes: RouteWithLayout[] = [];
  let NotFoundComponent: React.ComponentType | null = null;

  // Обрабатываем все страницы
  for (const pagePath in pages) {
    // Формируем route path
    let routePath = pagePath
      .replace("../app/", "")
      .replace(/\/page\.tsx$/, "")
      .replace(/\/index$/, "") // Удаляем /index
      .replace(/^index$/, ""); // Удаляем корневой index

    // Обрабатываем динамические сегменты
    routePath = routePath.replace(/\[([^\]]+)\]/g, ":$1");

    // Специальная обработка для корневого пути
    if (routePath === "(main)" || routePath === "") {
      routePath = "";
    }

    const finalPath = routePath === "" ? "/" : `/${routePath.replace(/\([^)]+\)\//g, "")}`;

    // Находим соответствующий layout
    const layoutPath = findClosestLayout(pagePath, Object.keys(layouts));
    const LayoutComponent = layoutPath ? lazy(layouts[layoutPath]) : undefined;

    const PageComponent = lazy(pages[pagePath]);

    // Получаем конфигурацию маршрута для проверки разрешений
    const routeConfig = getRouteConfig(finalPath);

    // Создаем элемент страницы с Suspense внутри Layout
    const pageElement = LayoutComponent ? (
      <LayoutComponent>
        <Suspense fallback={<LoadingSpinner />}>
          <PageComponent />
        </Suspense>
      </LayoutComponent>
    ) : (
      <Suspense fallback={<LoadingSpinner />}>
        <PageComponent />
      </Suspense>
    );

    // Создаем элемент с защитой маршрута
    const elementWithProtection = routeConfig?.isPublic ? (
      pageElement
    ) : (
      <ProtectedRoute
        requiredPermissions={routeConfig?.requiredPermissions}
        requiredRoles={routeConfig?.requiredRoles}
        requireAuth={!routeConfig?.isPublic}
        requireActive={routeConfig?.requireActive}
      >
        {pageElement}
      </ProtectedRoute>
    );

    routes.push({
      path: finalPath,
      element: elementWithProtection,
    });
  }

  // Добавляем 404 (должен быть последним)
  if (Object.keys(notFound).length > 0) {
    const notFoundPath = Object.keys(notFound)[0];
    NotFoundComponent = lazy(notFound[notFoundPath]);

    routes.push({
      path: "*",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <NotFoundComponent />
        </Suspense>
      ),
    });
  }

  return routes;
}

function findClosestLayout(pagePath: string, layoutPaths: string[]): string | undefined {
  const dirs = pagePath.split("/").slice(0, -1); // Удаляем имя файла

  // Ищем от самой вложенной директории к корню
  for (let i = dirs.length - 1; i >= 0; i--) {
    const currentPath = dirs.slice(0, i + 1).join("/");

    // Проверяем несколько возможных вариантов пути к layout
    const possibleLayoutPaths = [
      `${currentPath}/layout.tsx`, // Точное совпадение с (group)
      `${currentPath.replace(/\([^)]+\)\//g, "")}/layout.tsx`, // Без (group)
    ];

    for (const possiblePath of possibleLayoutPaths) {
      if (layoutPaths.includes(possiblePath)) {
        return possiblePath;
      }
    }
  }

  return undefined;
}
