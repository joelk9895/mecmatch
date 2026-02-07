import SwipeDeck from '@/components/SwipeDeck'
import OnboardingGuide from '@/components/OnboardingGuide'

export default function AppPage() {
    return (
        <div className="h-full flex flex-col items-center justify-center relative">
            <OnboardingGuide />
            <SwipeDeck />
        </div>
    )
}
