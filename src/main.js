import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import whitelistedMintingABI from "../contract/whitelistedMinting.abi.json"

const ERC20_DECIMALS = 18
const WhitelistedMIntingAddress = "0xF0d3d91D1a4b0dF615251F03389966B08fbB03B3"


let kit
let contract

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      console.log(kit.defaultAccount)

      contract = new kit.web3.eth.Contract(whitelistedMintingABI, WhitelistedMIntingAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  const cUSDBalance = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)
  document.querySelector("#balance").textContent = cUSDBalance
}


function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getNumberOfWhitelisted()
  await returnAllWhitelistedAddressses()
  await returnContractBal()
  await returnTotalNo()
  await returnDeployerAddress();
  notificationOff()
});

/***********************Read******************************* */

//return the total number of people that i've been whitelisted
const getNumberOfWhitelisted = async () => {
  try {
    const result = await contract.methods.numAddressesWhitelisted().call()
    console.log("number: ", result)
    document.querySelector("#numOfAddress").textContent = result
     return result

  } catch (err) {
    console.error(err);
  }
};

//it returns all the address that has been whitelisted
const returnAllWhitelistedAddressses = async () => {
  try {
    let ulNode = document.querySelector("#addresses");

    const result = await contract.methods
    .allWhitelistedAddress().call()

    result = new Set(result);

    result.forEach(item => {
      const liTag = document.createElement('li');
      liTag.innerHTML = item;
      ulNode.appendChild(liTag);
    });
    document.body.appendChild(ulTag);

 
  } catch (err) {
    console.error(err);
  }
};

//it returns all the address that has been whitelisted
const returnContractBal = async () => {
  try {
    const result = await contract.methods
    .contractBal().call()
    console.log("contract balance: ", result)
     return result
  } catch (err) {
    console.error(err);
  }
};

//it returns the total number that can be whitelisted
const returnTotalNo = async () => {
  try {
    const result = await contract.methods
    .maximumWhitelistedAddresses().call()
    document.querySelector("#totalNo").textContent = result
     return result
  } catch (err) {
    console.error(err);
  }
};


//it returns the total number that can be whitelisted
const returnDeployerAddress = async () => {
  try {
    const result = await contract.methods
    .owner().call()
    document.querySelector("#deployerAddress").textContent = result
     return result
  } catch (err) {
    console.error(err);
  }
};

/**************************************************************/

/******************Write Function******************* */

//get whitelisted
document
  .querySelector("#join-whitelist")
  .addEventListener("click", async (e) => {
    notification(`⌛ ${kit.defaultAccount} joining...`)
    try {
      const result = await contract.methods
      .whitelistAddress()
      .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ already whitelisted...`);
      return;
    }
    notification(`🎉 You've been whitelisted successfully.`)
    await getNumberOfWhitelisted()
    await returnAllWhitelistedAddressses()
  })

  // mint token
  document
  .querySelector("#mint-token")
  .addEventListener("click", async (e) => {
    notification(`⌛ ${kit.defaultAccount} minting token...`)
    try {
      const result = await contract.methods
      .mint()
      .send({ from: kit.defaultAccount })
      console.log(result)
    } catch (error) {
      notification(`⚠️ already minted...`)
      return;
    }
    notification(`🎉 Token Minted succesfully successfully.`)
  })


    // increase whitelisted address 
    document
    .querySelector("#increase-whitelisted")
    .addEventListener("click", async (e) => {
      notification(`⌛ ${kit.defaultAccount} minting token...`)
      const input = document.getElementById("NewNumber").value
      console.log(input);
      try {
        const result = await contract.methods
        .increaseMaxwhitelistedAddress(input)
        .send({ from: kit.defaultAccount })
        console.log(result)
      } catch (error) {
        notification(`⚠️ ${error} not the deployer`)
        return;
      }
      notification(`🎉 Token increase successfully.`)
      await returnTotalNo();
    }) 