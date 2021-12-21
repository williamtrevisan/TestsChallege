import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let inMemoryUsersRepository: IUsersRepository;
let inMemoryStatementsRepository: IStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
};

describe('Create Statement', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should not be able to create a new statement if user not found", async () => {
    const statement: ICreateStatementDTO = {
      user_id: "incorrect_user",
      description: "Description",
      amount: 100.00,
      type: OperationType.DEPOSIT
    };

    await expect(
      createStatementUseCase.execute(statement)
    ).rejects.toEqual(new CreateStatementError.UserNotFound());
  });

  it("should not be able to create a new statement withdraw type if an user haven't insufficient funds", async () => {
    const user: ICreateUserDTO = {
      name: "User With Incorrect Password",
      email: "incorrect@password.com",
      password: "correct_password",
    };
    const userCreated = await inMemoryUsersRepository.create(user);
    const statement: ICreateStatementDTO = {
      user_id: userCreated.id,
      description: "Description",
      amount: 100.00,
      type: OperationType.WITHDRAW
    };

    await expect(
      createStatementUseCase.execute(statement)
    ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
  });

  it("should be able to create a new statement", async () => {
    const user: ICreateUserDTO = {
      name: "User With Incorrect Password",
      email: "incorrect@password.com",
      password: "correct_password",
    };
    const userCreated = await inMemoryUsersRepository.create(user);
    const statement: ICreateStatementDTO = {
      user_id: userCreated.id,
      description: "Description",
      amount: 100.00,
      type: OperationType.DEPOSIT
    };

    const dataReturn = await createStatementUseCase.execute(statement);

    expect(dataReturn).toHaveProperty("id");
    expect(dataReturn.user_id).toEqual(userCreated.id);
    expect(dataReturn.amount).toEqual(100);
  });
});
