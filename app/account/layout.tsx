import IdleLogout from "@/components/IdleLogout";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IdleLogout timeoutMs={30 * 60 * 1000} logoutPath="/api/account/logout" loginPath="/login" />
      {children}
    </>
  );
}
