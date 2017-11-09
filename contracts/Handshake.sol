pragma solidity ^0.4.11;

import "./Owned.sol";

contract Handshake is Owned {
  // Custom types
  struct Bet {
    uint id;
    address initiator;
    address matcher;
    string title;
    string description;
    uint256 amount;
    uint outcomeClaimInitiator;
    uint outcomeClaimMatcher;
  }

  mapping(uint => Bet) public bets;
  uint betCounter;

  // place a bet
  function placeBet(string _title, string _description, uint256 _amount) payable {
    
    betCounter++;

    bets[betCounter] = Bet(
         betCounter,
         msg.sender,
         0x0,
         _title,
         _description,
         _amount,
         0,
         0
    );
  }

  function matchBet(uint _id) payable {

    require(bets[_id].amount == msg.value);
    
    // update the .matcher field with the msg.sender
    bets[_id].matcher = msg.sender;

  }

  function verifyBet(uint _id, uint _outcomeClaim) payable {

    // bets can only be verified if they have been matched
    require(bets[_id].matcher != 0x0);
    
    if (msg.sender == bets[_id].initiator) {
      bets[_id].outcomeClaimInitiator = _outcomeClaim;
    }
      
    if (msg.sender == bets[_id].matcher) {
      bets[_id].outcomeClaimMatcher = _outcomeClaim;
    }

    // check if both outcomes match

    if (bets[_id].outcomeClaimInitiator == bets[_id].outcomeClaimMatcher) {
      if (bets[_id].outcomeClaimInitiator == 2) {
        bets[_id].initiator.transfer(bets[_id].amount * 2);
      }
      if (bets[_id].outcomeClaimInitiator == 1) {
        bets[_id].matcher.transfer(bets[_id].amount * 2);
      }
    }
  }

  function getBalance () constant returns (uint) {
		return this.balance;
	}

  function getBetCounter () constant returns (uint) {
    return betCounter;
	}

  function getBet (uint betId) constant returns (address, address, string, string, uint256) {
    return (bets[betId].initiator, bets[betId].matcher, bets[betId].title, bets[betId].description, bets[betId].amount);
	}

  // kill the smart contract
  function kill() onlyOwner {
    selfdestruct(owner);
  }
}
