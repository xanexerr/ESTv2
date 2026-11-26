import React from "react";
import { prisma } from "@/lib/prisma";
import { RegisterFormClient } from "@/components/RegisterFormClient";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const universities = await prisma.university.findMany({
    orderBy: { code: "asc" },
    include: {
      faculties: {
        orderBy: { code: "asc" },
        include: {
          majors: {
            orderBy: { name: "asc" },
          },
        },
      },
    },
  });

  return <RegisterFormClient universities={universities} />;
}
