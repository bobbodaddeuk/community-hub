import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

// 1. `email`, `password`, `name`, `age`, `gender`, `profileImage`를 **body**로 전달받습니다.
// 2. 동일한 `email`을 가진 사용자가 있는지 확인합니다.
// 3. **Users** 테이블에 `email`, `password`를 이용해 사용자를 생성합니다.
// 4. **UserInfos** 테이블에 `name`, `age`, `gender`, `profileImage`를 이용해 사용자 정보를 생성합니다.

router.post("/sign-up", async (req, res, next) => {
  const { email, password, name, age, gender, profileImage } = req.body;

  const isExistUser = await prisma.users.findFirst({
    where: { email },
  });

  if (isExistUser) {
    return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
  }

  const user = await prisma.users.create({
    data: { email, password },
  });

  const userInfo = await prisma.userInfos.create({
    data: {
      userId: user.userId,
      name,
      age,
      gender: gender.toUpperCase(),
      profileImage,
    },
  });
  return res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

export default router;
