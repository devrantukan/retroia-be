import {
  LoginLink,
  LogoutLink,
  RegisterLink,
  getKindeServerSession,
} from "@kinde-oss/kinde-auth-nextjs/server";
import { Button } from "@nextui-org/react";
import React from "react";
import UserProfilePanel from "./UserProfilePanel";
import prisma from "@/lib/prisma";

const signInPanel = async () => {
  const { isAuthenticated, getUser } = getKindeServerSession();
  if (await isAuthenticated()) {
    const user = await getUser();

    const { getAccessToken } = await getKindeServerSession();
    const accessToken: any = await getAccessToken();
    const role = accessToken?.roles?.[0]?.key;
    const dbUser = await prisma.user.findUnique({
      where: {
        id: user?.id,
      },
    });

    return <>{dbUser && <UserProfilePanel user={dbUser} role={role} />}</>;
  }

  return (
    <div className="flex gap-3">
      <Button color="primary">
        <LoginLink>Sign In</LoginLink>
      </Button>
      <Button>
        <RegisterLink>Sign Up</RegisterLink>
      </Button>
    </div>
  );
};
export default signInPanel;
