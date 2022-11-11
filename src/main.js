import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import whitelistedMintingABI from "../contract/whitelistedMinting.abi.json"

const ERC20_DECIMALS = 18
const WhitelistedMIntingAddress = "0xF0d3d91D1a4b0dF615251F03389966B08fbB03B3"


let kit
let contract
let userAccount

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
      userAccount = kit.defaultAccount
      console.log("user acct", userAccount)

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

  /*************************** */
  let adminAddress = "0x5E89De9a9b8394AEca6b2FeC399B32228a11B03B";
  
  function showIncreaseWhitelistButton() {
    console.log("kit defaault",  userAccount)
    if(userAccount !== adminAddress){
      document.querySelector("#incWHitelist").style.display="none"
    }
  }

  /******************************************* */

  adminAddress = "0x5E89De9a9b8394AEca6b2FeC399B32228a11B03B";
  
  function showAdminButton() {
    if(userAccount == adminAddress){
      let admin_div = document.querySelector("#admin-container")
      const template = AdminButton();
      admin_div.innerHTML = template;
    }
  }

function AdminButton() {
  return `<div class="d-flex justify-content-center">
  <!-- button to increase number of whitelisted -->
  <div>
    <a class="btn my-header rounded-pill txt-color" id="incWHitelist" data-bs-toggle="modal"
      data-bs-target="#addModal">
      Increase whitelisted address
    </a>
  </div>

  <!-- button for specialMInt -->
  <div class="mb-4" style="margin: 2rem">
  <a class="btn my-header rounded-pill txt-color" id="incWHitelist" data-bs-toggle="modal"
  data-bs-target="#newaddModal">
  Special Mint
</a>
  </div>
</div>`;
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
  showAdminButton()
  //showIncreaseWhitelistButton()
  notificationOff()
});

/***********************Read******************************* */

//return the total number of people that i've been whitelisted
const getNumberOfWhitelisted = async () => {
  try {
    const result = await contract.methods.numAddressesWhitelisted().call()
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

    //let filteredResult = new Set(result);
    ulNode.innerHTML = "";
    result.forEach(item => {
      const liTag = document.createElement('li');
      liTag.innerHTML = item;
      ulNode.appendChild(liTag);
    });

 
  } catch (err) {
    console.error(err);
  }
};

//it returns all the address that has been whitelisted
const returnContractBal = async () => {
  try {
    const result = await contract.methods
    .contractBal().call()
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
    await getBalance();
  })


    // increase whitelisted address
    document
    .querySelector("#increase-whitelisted")
    .addEventListener("click", async (e) => {
      //document.querySelector("#modal-tag").textContent = "Increase Allowance";
      const input = document.getElementById("NewNumber").value
      notification(`⌛ ${kit.defaultAccount} addresses allowed to mint increased by ${input}...`)
      
      try {
        const result = await contract.methods
        .increaseMaxwhitelistedAddress(input)
        .send({ from: kit.defaultAccount })
        console.log(result)
      } catch (error) {
        notification(`⚠️ ${error} not the Admin`)
        return;
      }
      notification(`🎉 Addresses increased successfully.`)
      await returnTotalNo();
    }) 
    

  // Special Mint Function
  document
  .querySelector("#special-mint")
  .addEventListener("click", async (e) => {
    const input = document.getElementById("amount-input").value
    notification(`⌛ ${kit.defaultAccount} special minting of ${input} tokens...`)
    try {
      const result = await contract.methods
      .specialMint(input)
      .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error} Not the Admin/insufficient balance`)
      return;
    }
    notification(`🎉 Token Minted succesfully.`)
    await getBalance();
  })