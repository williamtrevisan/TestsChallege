import exp from "constants";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();

    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
  });

  it("should not be able show user profile if the user not found", async () => {
    await expect(
      showUserProfileUseCase.execute("nonexistent_user_id")
    ).rejects.toEqual(new ShowUserProfileError());
  });

  it("should be able to show user profile", async () => {
    const user: ICreateUserDTO = {
      name: "User With Incorrect Password",
      email: "incorrect@password.com",
      password: "correct_password",
    };
    const userCreated = await inMemoryUsersRepository.create(user);

    const dataReturn = await showUserProfileUseCase.execute(userCreated.id);

    expect(dataReturn).toHaveProperty("id");
    expect(dataReturn.id).toEqual(userCreated.id);
    expect(dataReturn.name).toEqual("User With Incorrect Password");
  });
});
