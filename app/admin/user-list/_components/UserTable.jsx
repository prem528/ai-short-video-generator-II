import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function UserTable({ users, setRole }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const email = user.emailAddresses.find(
              (email) => email.id === user.primaryEmailAddressId
            )?.emailAddress;

            return (
              <TableRow key={user.id}>
                <TableCell>
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{email}</TableCell>
                <TableCell>{user.publicMetadata.role}</TableCell>
                <TableCell>
                  <form action={setRole} className="inline">
                    <input type="hidden" value={user.id} name="id" />
                    <input type="hidden" value="admin" name="role" />
                    <Button
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 mr-2"
                    >
                      Make Admin
                    </Button>
                  </form>
                  <form action={setRole} className="inline">
                    <input type="hidden" value={user.id} name="id" />
                    <input type="hidden" value="user" name="role" />
                    <Button
                      type="submit"
                      className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 mr-2"
                    >
                      Make User
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
