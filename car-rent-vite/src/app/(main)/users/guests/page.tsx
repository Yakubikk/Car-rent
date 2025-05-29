import GuestUsersTable from "@/components/guest-users/GuestUsersTable";

export default function GuestUsersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Пользователи, ожидающие подтверждения</h1>
      <GuestUsersTable />
    </div>
  );
}
