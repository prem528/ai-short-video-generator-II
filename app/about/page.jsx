import React from 'react'

import BackgroundLayout from '../pages/BackgroundLayout'
import HeroSection from './_components/HeroSection'

import { Nav } from './_components/Nav'
import TeamSection from './_components/TeamSection'
import ReviewSection from './_components/ReviewSection'
import Footer from '../pages/Footer'


const page = () => {
  return (
    <div>
      <BackgroundLayout>
        <Nav />
        <div className='py-20'>
          <HeroSection />
        </div>
        <TeamSection/>
        <div className='px-24'>
          <ReviewSection/>
        </div>
        <Footer/>
        
      </BackgroundLayout>
    </div>
  )
}

export default page
