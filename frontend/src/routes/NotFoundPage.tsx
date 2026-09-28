import { Link } from 'react-router'
import { buttonClassName, Card, EmptyState } from '../components'

/** Shown for any URL that isn't a screen. Offers one way back, to the viewer's home screen. */
export function NotFoundPage({ home }: { home: string }) {
  return (
    <div className="mx-auto max-w-[1120px] px-4 pt-10 pb-8 sm:px-8">
      <h1 className="sr-only">Page not found</h1>
      <Card>
        <EmptyState
          icon="alertTriangle"
          title="This page doesn't exist."
          description="The address may be mistyped, or the screen may not be built yet."
        />
        <div className="flex justify-center pb-6">
          <Link to={home} className={buttonClassName({ variant: 'primary' })}>
            Go to home screen
          </Link>
        </div>
      </Card>
    </div>
  )
}
