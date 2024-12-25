import { SignUp } from "@clerk/nextjs";
import Image from "next/image";
import signup from '../../../../public/signup.jpg'


export default function Page() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2'>
    <div>
      <Image src={signup} 
      alt='login' width={500} height={500} 
      className='w-full h-screen object-contain'
      />
    </div>
    <div className='flex justify-center items-center h-screen'>
      <SignUp />
    </div>
  </div>
  );
}
