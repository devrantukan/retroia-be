import PageTitle from "@/app/components/pageTitle";
import { getUserAsOfficeWorker, getUserById } from "@/lib/actions/user";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import React, { ReactNode } from "react";
import SectionTitle from "./_components/sectionTitle";
import { Avatar, Button, Card } from "@nextui-org/react";
import UploadAvatar from "./_components/UploadAvatar";
import Link from "next/link";
import prisma from "@/lib/prisma";
import UserProfileForm from "@/app/components/UserProfileForm";

const ProfilePage = async () => {
  const { getUser } = await getKindeServerSession();
  const user = await getUser();

  const { getAccessToken } = await getKindeServerSession();
  const accessToken: any = await getAccessToken();
  const role = accessToken?.roles?.[0]?.key;

  const dbUser = await getUserById(user ? user.id : "");
  // console.log("user is:", user);
  // console.log("dbuser is:", dbUser);
  // console.log("act", role);

  const officeWorker = await getUserAsOfficeWorker(user ? user.id : "");

  const propertyCount = await prisma.property.count({
    where: {
      agentId: officeWorker?.id,
    },
  });

  //console.log(officeWorker);

  return (
    <div>
      <PageTitle title="Profilim" />
      <Card className="m-4 p-4  flex flex-col gap-5">
        <SectionTitle title="Kullanıcı Bilgileri" />
        <div className="flex lg:flex-row flex-col">
          <div className="flex flex-col items-center lg:w-1/3 w-full mb-6">
            <div className="w-[150px] h-[150px] relative">
              <Avatar
                className="absolute w-[150px] h-[150px] border-1 border-gray-200 overflow-hidden"
                src={officeWorker?.avatarUrl ?? "/profile.png"}
                imgProps={{
                  className: "w-[150px] h-[200px]",
                }}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top center",
                }}
              />
            </div>
            <UploadAvatar userId={dbUser?.id!} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:w-2/3 w-full">
            <Attribute
              title="Adı Soyadı"
              value={`${dbUser?.firstName} ${dbUser?.lastName}`}
            />
            <Attribute title="E-posta" value={dbUser?.email} />
            <Attribute
              title="Kayıt Tarihi"
              value={dbUser?.createdAt.toLocaleDateString()}
            />

            <Attribute title="Kullanıcı Rolü" value={role} />
            <Attribute title="Emlak sayısı" value={propertyCount} />
          </div>
        </div>
      </Card>
      {role === "office-workers" && (
        <Card className="m-4 p-4  flex flex-col gap-5">
          <SectionTitle title="Danışman Bilgileri" />

          <UserProfileForm officeWorker={officeWorker} />
        </Card>
      )}
    </div>
  );
};
export default ProfilePage;

const Attribute = ({ title, value }: { title: string; value: ReactNode }) => (
  <div className="flex flex-col text-sm">
    <span className="text-slate-800 font-semibold">{title}</span>
    <span className="text-slate-600">{value}</span>
  </div>
);
