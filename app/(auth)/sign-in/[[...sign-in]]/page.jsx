import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div>
      <div className="flex justify-center items-center h-screen">
        <SignIn />
      </div>
    </div>
  );
}
