import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div>
      <div className="flex justify-center items-center h-screen">
        <SignUp />
      </div>
    </div>
  );
}
