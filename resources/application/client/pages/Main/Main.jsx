import HeroSection from './sections/components/HeroSection'
import ProcessSection from './sections/components/ProcessSection'
import ProductsSection from './sections/components/ProductsSection'
import CategoriesSection from './sections/components/CategoriesSection'
import VideoSection from './sections/components/VideoSection'
import TestimonialsSection from './sections/components/TestimonialsSection'
import AppSection from './sections/components/AppSection'
import TimelineSection from './sections/components/TimelineSection.jsx'
import './Main.css'

function Main() {
  return (
    <>
        <HeroSection />
        <ProductsSection />
        <CategoriesSection />
        <ProcessSection />
        <TimelineSection/>
        <VideoSection />
        <TestimonialsSection />
        <AppSection />
    </>
  )
}

export default Main

