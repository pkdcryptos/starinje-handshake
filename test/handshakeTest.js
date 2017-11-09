// Contract to be tested
var Handshake = artifacts.require("./Handshake.sol");

const betTitle = 'someBet'
const betAmount = web3.toWei(1, "ether")
const betDescription = 'the patriots will win the superbowl'


// Test suite
contract('Handshake', async function(accounts) {
  var initiator = accounts[0];
  var matcher = accounts[1];

  const handshakeInstance = await Handshake.deployed()

  let contractBalance = web3.fromWei(await handshakeInstance.getBalance(), "ether").toNumber();
  let initiatorBalance = web3.fromWei(web3.eth.getBalance(initiator), "ether").toNumber();
  let matcherBalance = web3.fromWei(web3.eth.getBalance(matcher), "ether").toNumber();

  console.log(`contract balance before bet is placed: ${contractBalance}`)
  console.log(`initiator balance before bet is placed: ${initiatorBalance}`)
  console.log(`matcher balance before bet is placed: ${matcherBalance}`)
  console.log('')

 
    
  console.log('placing bet...')
  await handshakeInstance.placeBet(betTitle, betDescription, betAmount, 
    {
      from: initiator,
      value: betAmount
    }
  )
  let betId = await handshakeInstance.getBetCounter()
  
  contractBalance = web3.fromWei(await handshakeInstance.getBalance(), "ether").toNumber();
  initiatorBalance = web3.fromWei(web3.eth.getBalance(initiator), "ether").toNumber();
  matcherBalance = web3.fromWei(web3.eth.getBalance(matcher), "ether").toNumber();

  console.log(`contract balance after bet is placed: ${contractBalance}`)
  console.log(`initiator balance after bet is placed: ${initiatorBalance}`)
  console.log(`matcher balance after bet is placed: ${matcherBalance}`)
  console.log('')
  
  let betDetails = await handshakeInstance.getBet(betId)
  console.log(`betDetails: ${betDetails}`)
  console.log('')

  console.log('matching bet...')
  await handshakeInstance.matchBet(betId,
    {
      from: matcher,
      value: betAmount
    }
  )

  contractBalance = web3.fromWei(await handshakeInstance.getBalance(), "ether").toNumber();
  initiatorBalance = web3.fromWei(web3.eth.getBalance(initiator), "ether").toNumber();
  matcherBalance = web3.fromWei(web3.eth.getBalance(matcher), "ether").toNumber();

  console.log(`contract balance after bet is matched: ${contractBalance}`)
  console.log(`initiator balance after bet is matched: ${initiatorBalance}`)
  console.log(`matcher balance after bet is matched: ${matcherBalance}`)
  console.log('')

  await handshakeInstance.verifyBet(betId, 2,
    {
      from: initiator,
    }
  )
  
  await handshakeInstance.verifyBet(betId, 2,
    {
      from: matcher,
    }
  )

  contractBalance = web3.fromWei(await handshakeInstance.getBalance(), "ether").toNumber();
  initiatorBalance = web3.fromWei(web3.eth.getBalance(initiator), "ether").toNumber();
  matcherBalance = web3.fromWei(web3.eth.getBalance(matcher), "ether").toNumber();

  console.log(`contract balance after bet is verified: ${contractBalance}`)
  console.log(`initiator balance after bet is verified: ${initiatorBalance}`)
  console.log(`matcher balance after bet is verified: ${matcherBalance}`)
  console.log('')

});