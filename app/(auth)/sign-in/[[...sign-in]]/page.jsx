import { SignIn } from '@clerk/nextjs'
import Image from 'next/image'
import login from '../../../../public/login.jpg'

export default function Page() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2'>
      <div>
        <Image src={login} 
        alt='login' width={500} height={500} 
        className='w-full h-screen object-contain'
        />
      </div>
      <div className='flex justify-center items-center h-screen'>
        <SignIn />
      </div>
    </div>
  )
}