import express from "express";
import { prisma } from "../utils/prisma/index.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const router = express.Router();

router.post("/sign-up", async (req, res, next) => {
  const { email, password, name, age, gender, profileImage } = req.body;

  const isExistUser = await prisma.users.findFirst({
    where: { email },
  });

  if (isExistUser) {
    return res.status(409).json({ message: "이미 존재하는 이메일입니다." });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.users.create({
    data: { email, password: hashedPassword },
  });

  const userInfo = await prisma.usersInfos.create({
    data: {
      userId: user.userId,
      name,
      age,
      gender,
      profileImage,
    },
  });
  return res.status(201).json({ message: "회원가입이 완료되었습니다." });
});

// 1. `email`, `password`를 **body**로 전달받습니다.
// 2. 전달 받은 `email`에 해당하는 사용자가 있는지 확인합니다.
// 3. 전달 받은 `password`와 데이터베이스의 저장된 `password`를 bcrypt를 이용해 검증합니다.
// 4. 로그인에 성공한다면, 사용자에게 JWT를 발급합니다.

router.post("/sign-in", async (req, res, next) => {
  const { email, password } = req.body;
  const user = await prisma.users.findFirst({ where: { email } });

  if (!user)
    return res.status(401).json({ massage: "존재하지 않는 이메일입니다." });
  if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });

  const token = jwt.sign({ userId: user.userId }, "custom-secret-key");

  res.cookie("authorization", `Bearer ${token}`);
  return res.status(200).json({ message: "로그인에 성공하였습니다." });
});

export default router;