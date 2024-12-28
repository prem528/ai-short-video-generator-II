import { SearchUsers } from "./_components/SearchUser";
import { clerkClient } from "@clerk/nextjs/server";
import { removeRole, setRole } from "@/app/api/setRole/route";
import UserTable from "./_components/UserTable";

export default async function Page({ searchParams }) {
  const query = (await searchParams).search;

  const client = await clerkClient();

  // Fetch users: Default to 20 most recent users if no query is provided
  const userList = query
    ? await client.users.getUserList({ query })
    : await client.users.getUserList({
        limit: 20,
        orderBy: "created_at",
        direction: "desc",
      });

  const users = userList.data;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-primary">Users</h1>
      <SearchUsers />
      <UserTable users={users} setRole={setRole} />
    </div>
  );
}
