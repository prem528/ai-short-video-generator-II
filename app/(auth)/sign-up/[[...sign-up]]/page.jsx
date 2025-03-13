import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import signup from '../../../../public/signup.jpg'


export default function Page() {
  return (
    <div className='min-h-screen flex flex-col md:flex-row bg-white'>
    <div className="hidden md:block md:w-1/2 h-screen relative">
      <Image src={signup} 
      alt='login'  
      fill
      priority 
      className='object-cover'
      />
    </div>
    <div className='w-full md:w-1/2 min-h-screen flex justify-center items-center p-4'>
      <SignUp />
    </div>
  </div>
  );
}
