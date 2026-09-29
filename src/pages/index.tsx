import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { PageId } from '../types/navigation'

type LazyPage = LazyExoticComponent<ComponentType>

export const pageComponents: Record<PageId, LazyPage> = {
  welcome: lazy(() => import('./WelcomePage')),
  signup: lazy(() => import('./SignupPage')),
  login: lazy(() => import('./LoginPage')),
  alley: lazy(() => import('./AlleyPage')),
  'vehicle-register': lazy(() => import('./VehicleRegisterPage')),
  home: lazy(() => import('./HomePage')),
  'parking-register': lazy(() => import('./ParkingRegisterPage')),
  departure: lazy(() => import('./DeparturePage')),
  repeat: lazy(() => import('./RepeatPage')),
  'vehicle-detail': lazy(() => import('./VehicleDetailPage')),
  unavailable: lazy(() => import('./UnavailablePage')),
  move: lazy(() => import('./MoveRequestPage')),
  share: lazy(() => import('./SharePage')),
  'garage-detail': lazy(() => import('./GarageDetailPage')),
  'request-result': lazy(() => import('./RequestResultPage')),
  'request-accepted': lazy(() => import('./RequestAcceptedPage')),
  'request-rejected': lazy(() => import('./RequestRejectedPage')),
  admin: lazy(() => import('./AdminPage')),
  slots: lazy(() => import('./SlotsPage')),
  'garage-register': lazy(() => import('./GarageRegisterPage')),
  requests: lazy(() => import('./RequestsPage')),
  vehicles: lazy(() => import('./VehiclesPage')),
  profile: lazy(() => import('./ProfilePage')),
}
