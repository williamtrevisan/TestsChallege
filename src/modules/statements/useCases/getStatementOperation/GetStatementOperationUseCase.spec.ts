import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let inMemoryUsersRepository: IUsersRepository;
let inMemoryStatementsRepository: IStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
};

describe('Get Statement Operation', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository
    );
  });

  it("should not be able to get statement operation if user not found", async () => {
    const request = {
      user_id: "nonexistentuser",
      statement_id: "nonexistentstatement",
    };

    await expect(
      getStatementOperationUseCase.execute(request)
    ).rejects.toEqual(new GetStatementOperationError.UserNotFound());
  });

  it("should not be able to get statement operation if statement operation not found", async () => {
    const user: ICreateUserDTO = {
      name: "User With Incorrect Password",
      email: "incorrect@password.com",
      password: "correct_password",
    };
    const userCreated = await inMemoryUsersRepository.create(user);
    const request = {
      user_id: userCreated.id,
      statement_id: "nonexistentstatement",
    };

    await expect(
      getStatementOperationUseCase.execute(request)
    ).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
  });

  it("should be able to get statement operation", async () => {
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
    const statementCreated = await inMemoryStatementsRepository.create(statement);
    const request = {
      user_id: userCreated.id,
      statement_id: statementCreated.id,
    };

    const dataReturn = await getStatementOperationUseCase.execute(request);

    expect(dataReturn.type).toEqual(OperationType.WITHDRAW);
  });
});
