# Staking contract for NRFX token with ability to change staking logic settings
Contract address - 0x17E117Ed9929Ed8e37B369c87dE1613377Ca07c6

Etherscan virified - https://bscscan.com/address/0x17E117Ed9929Ed8e37B369c87dE1613377Ca07c6#code

Staking logic: contract recieve LP tokens and afrer x minutes charge reward tokens to account.
Available functions: stake(amount), unstake(), claim(), changeStakingSettings()

Available task:

```shell
  accounts      Prints the list of accounts
  check         Check whatever you need
  claim         Claim all reward tokens
  clean         Clears the cache and deletes all artifacts
  compile       Compiles the entire project, building all artifacts
  console       Opens a hardhat console
  coverage      Generates a code coverage report for tests
  flatten       Flattens and prints contracts and their dependencies
  help          Prints this message
  initialize    Initialize staking contract
  node          Starts a JSON-RPC server on top of Hardhat Network
  run           Runs a user-defined script after compiling the project
  stake         Stakes amount of tokens
  test          Runs mocha tests
  typechain     Generate Typechain typings for compiled contracts
  unstake       Unstakes all staked tokens
  verify        Verifies contract on Etherscan
```
