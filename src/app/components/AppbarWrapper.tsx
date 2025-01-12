import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import UserProfilePanel from "./UserProfilePanel";
import { prisma } from "@/lib/prisma";

interface Props {
  children: React.ReactNode;
}

export default async function AppbarWrapper({ children }: Props) {
  //   const { getUser, getAccessToken } = getKindeServerSession();
  //   const kindeUser = await getUser();
  //   const accessToken: any = await getAccessToken();
  //   const role = accessToken?.roles?.[0]?.key;

  //   console.log("rs", role);
  //   // Get user from database

  const { getUser } = getKindeServerSession();
  const kindeUser = await getUser();

  const { getAccessToken } = await getKindeServerSession();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;
  console.log("role isss:", role);

  const user = await prisma.user.findUnique({
    where: { id: kindeUser?.id },
  });

  if (!user) return null;

  return (
    <>
      <UserProfilePanel user={user} role={role} />
      {children}
    </>
  );
}
