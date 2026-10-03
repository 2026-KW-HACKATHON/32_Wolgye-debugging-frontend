import { lazy, type ComponentType, type LazyExoticComponent } from 'react'
import type { PageId } from '../types/navigation'

type LazyPage = LazyExoticComponent<ComponentType>

export const pageComponents: Record<PageId, LazyPage> = {
  welcome: lazy(() => import('./onboarding/WelcomePage')),
  signup: lazy(() => import('./onboarding/SignupPage')),
  login: lazy(() => import('./onboarding/LoginPage')),
  'join-building': lazy(() => import('./onboarding/JoinBuildingPage')),
  'vehicle-register': lazy(() => import('./onboarding/VehicleRegisterPage')),
  home: lazy(() => import('./parking/HomePage')),
  'parking-register': lazy(() => import('./parking/ParkingRegisterPage')),
  departure: lazy(() => import('./parking/DeparturePage')),
  repeat: lazy(() => import('./parking/RepeatPage')),
  'vehicle-detail': lazy(() => import('./parking/VehicleDetailPage')),
  unavailable: lazy(() => import('./parking/UnavailablePage')),
  notifications: lazy(() => import('./parking/NotificationsPage')),
  move: lazy(() => import('./parking/MoveRequestPage')),
  'move-done': lazy(() => import('./parking/MoveDonePage')),
  share: lazy(() => import('./shared-parking/SharePage')),
  'garage-detail': lazy(() => import('./shared-parking/GarageDetailPage')),
  'request-result': lazy(() => import('./shared-parking/RequestResultPage')),
  'request-accepted': lazy(() => import('./shared-parking/RequestAcceptedPage')),
  'request-rejected': lazy(() => import('./shared-parking/RequestRejectedPage')),
  admin: lazy(() => import('./admin/AdminPage')),
  slots: lazy(() => import('./admin/SlotsPage')),
  'garage-register': lazy(() => import('./admin/GarageRegisterPage')),
  requests: lazy(() => import('./admin/RequestsPage')),
  vehicles: lazy(() => import('./settings/VehiclesPage')),
  profile: lazy(() => import('./settings/ProfilePage')),
  'role-guide': lazy(() => import('./settings/RoleGuidePage')),
}
