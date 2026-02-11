import { createHashRouter } from 'react-router'
import App from '@/App'
import {
  ExplorePage,
  HomePage,
  TypesPage,
  ChangelogPage,
  HowItWorksPage,
  NotFoundPage,
} from '@/pages'

export const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      // Home screen
      { index: true, element: <HomePage /> },
      // API browse with catch-all for deep linking
      { path: '_api/*', element: <ExplorePage /> },
      // Entity types
      { path: 'entity', element: <TypesPage /> },
      { path: 'entity/:typeName', element: <TypesPage /> },
      { path: 'entity/:typeName/func/:funcName', element: <TypesPage /> },
      // API changelog
      { path: 'api-diff', element: <ChangelogPage /> },
      { path: 'api-diff/:monthKey', element: <ChangelogPage /> },
      // How it works
      { path: 'how-it-works', element: <HowItWorksPage /> },
      // 404 catch-all
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
