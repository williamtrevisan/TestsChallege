import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
  });

  it("should not be able authenticated a nonexistent user", async () => {
    const user = {
      email: "nonexistent@user.com",
      password: "nonexistent_user",
    }

    await expect(
      authenticateUserUseCase.execute(user)
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });

  it("should not be able authenticated an user with incorrect password", async () => {
    const user: ICreateUserDTO = {
      name: "User With Incorrect Password",
      email: "incorrect@password.com",
      password: "correct_password",
    };
    await inMemoryUsersRepository.create(user);

    await expect(
      authenticateUserUseCase.execute({
        email: user.email,
        password: "incorrect_password"
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });

  it("should be able to authenticate an user", async () => {
    const user: ICreateUserDTO = {
      name: "User With All Correct Data",
      email: "correct@user.com",
      password: "correct_password",
    };
    const userCreated = await createUserUseCase.execute(user);

    const dataReturn = await authenticateUserUseCase.execute({
      email: "correct@user.com",
      password: "correct_password"
    });

    expect(dataReturn).toHaveProperty("token");
    expect(dataReturn.user.id).toEqual(userCreated.id);
  });
});
