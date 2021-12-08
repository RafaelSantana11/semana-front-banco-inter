import 'express-async-errors';
import { getRepository } from 'typeorm';
import md5 from 'crypto-js/md5';
import { sign } from 'jsonwebtoken';
import { User } from '../../entity/User';
import { UserSignIn } from './dtos/user.signin.dtos';
import { UserSignUp } from './dtos/user.signup.dtos';
import AppError from '../../shared/error/AppError';
import authConfig from '../../config/auth';

export default class UserService {
  async signin(user: UserSignIn) {
    const userRepository = getRepository(User);

    const { email, password } = user;
    const passwordHash = md5(password).toString();

    const existUser = await userRepository.findOne({
      where: { email, password: passwordHash },
    });

    if (!existUser) {
      throw new AppError('Usuário não encontrado', 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign(
      {
        firstName: existUser.firstName,
        lastName: existUser.lastName,
        accountNumber: existUser.accountNumber,
        accountDigit: existUser.accountDigit,
        wallet: existUser.wallet,
      },
      secret,
      {
        subject: existUser.id,
        expiresIn,
      },
    );

    // @ts-expect-error
    delete existUser.password;

    return { accessToken: token };
  }

  async signup(user: UserSignUp) {
    const userRepository = getRepository(User);

    const { email } = user;
    const existUser = await userRepository.findOne({
      where: { email },
    });

    if (existUser) {
      throw new AppError('Já existe usuário cadastrado com este e-mail', 401);
    }

    const userData = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: md5(user.password).toString(),
      wallet: 5000,
      accountNumber: Math.floor(Math.random() * 9999999),
      accountDigit: Math.floor(Math.random() * 99),
    };

    const userCreate = await userRepository.save(userData);

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign(
      {
        firstName: user.firstName,
        lastName: user.lastName,
        accountNumber: userData.accountNumber,
        accountDigit: userData.accountDigit,
        wallet: userData.wallet,
      },
      secret,
      {
        subject: userCreate.id,
        expiresIn,
      },
    );

    if (existUser) {
      //@ts-expect-error
      delete existUser.password;
    }

    return { accessToken: token };
  }
}
