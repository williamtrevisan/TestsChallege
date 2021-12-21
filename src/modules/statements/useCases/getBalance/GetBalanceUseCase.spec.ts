import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let inMemoryStatementsRepository: IStatementsRepository;
let inMemoryUsersRepository: IUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
};

describe('Get Balance', () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository
    );
  });

  it("should not be able to get an user balance if user not found", async () => {
    const user = {
      id: "nonexistentuser"
    }

    await expect(
      getBalanceUseCase.execute({ user_id: user.id })
    ).rejects.toEqual(new GetBalanceError());
  });

  it("should be able to get an user balance", async () => {
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
    await inMemoryStatementsRepository.create(statement);

    const dataReturn = await getBalanceUseCase.execute({ user_id: userCreated.id });

    expect(dataReturn).toHaveProperty("balance");
    expect(dataReturn.balance).toEqual(100);
    expect(dataReturn.statement[0].type).toEqual(OperationType.DEPOSIT);
    expect(dataReturn.statement[0].user_id).toEqual(userCreated.id);
  });
});
