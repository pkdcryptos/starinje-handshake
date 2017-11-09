App = {
  web3Provider: null,
  contracts: {},
  account: 0x0,
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // Initialize web3 and set the provider to the testRPC.
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // set the provider you want from Web3.providers
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }
    App.displayAccountInfo();
    return App.initContract();
  },

  displayAccountInfo: function() {
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#account").text(account);
        web3.eth.getBalance(account, function(err, balance) {
          if (err === null) {
            $("#accountBalance").text(web3.fromWei(balance, "ether") + " ETH");
          }
        });
      }
    });
  },

  initContract: function() {
    $.getJSON('handshake.json', function(handshakeArtifact) {
      // Get the necessary contract artifact file and use it to instantiate a truffle contract abstraction.
      App.contracts.handshake = TruffleContract(handshakeArtifact);

      // Set the provider for our contract.
      App.contracts.handshake.setProvider(App.web3Provider);

      // Listen for events
      App.listenToEvents();

      // Retrieve the article from the smart contract
      return App.reloadArticles();
    });
  },

  reloadArticles: function() {
    // avoid reentry
    if (App.loading) {
      return;
    }
    App.loading = true;

    // refresh account information because the balance may have changed
    App.displayAccountInfo();

    var handshakeInstance;

    App.contracts.handshake.deployed().then(function(instance) {
      handshakeInstance = instance;
      return handshakeInstance.getBets();
    }).then(function(betIds) {
      // Retrieve and clear the article placeholder
      var betsRow = $('#articlesRow');
      betsRow.empty();

      for (var i = 0; i < betIds.length; i++) {
        var betId = betIds[i];
        handshakeInstance.bets(betId).then(function(bet) {
          App.displayBet(
            bet[0],
            bet[1],
            bet[3],
            bet[4],
            bet[5]
          );
        });
      }
      App.loading = false;
    }).catch(function(err) {
      console.log(err.message);
      App.loading = false;
    });
  },

  displayArticle: function(id, seller, name, description, price) {
    // Retrieve the article placeholder
    var articlesRow = $('#articlesRow');

    var etherPrice = web3.fromWei(price, "ether");

    // Retrieve and fill the article template
    var articleTemplate = $('#articleTemplate');
    articleTemplate.find('.panel-title').text(name);
    articleTemplate.find('.article-description').text(description);
    articleTemplate.find('.article-price').text(etherPrice + " ETH");
    articleTemplate.find('.btn-buy').attr('data-id', id);
    articleTemplate.find('.btn-buy').attr('data-value', etherPrice);

    // seller?
    if (seller == App.account) {
      articleTemplate.find('.article-seller').text("You");
      articleTemplate.find('.btn-buy').hide();
    } else {
      articleTemplate.find('.article-seller').text(seller);
      articleTemplate.find('.btn-buy').show();
    }

    // add this new article
    articlesRow.append(articleTemplate.html());
  },

  sellArticle: function() {
    // retrieve details of the article
    var _article_name = $("#article_name").val();
    var _description = $("#article_description").val();
    var _price = web3.toWei(parseFloat($("#article_price").val() || 0), "ether");

    if ((_article_name.trim() == '') || (_price == 0)) {
      // nothing to sell
      return false;
    }

    App.contracts.ChainList.deployed().then(function(instance) {
      return instance.sellArticle(_article_name, _description, _price, {
        from: App.account,
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },

  // Listen for events raised from the contract
  listenToEvents: function() {
    App.contracts.ChainList.deployed().then(function(instance) {
      instance.sellArticleEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        $("#events").append('<li class="list-group-item">' + event.args._name + ' is for sale' + '</li>');
        App.reloadArticles();
      });

      instance.buyArticleEvent({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        $("#events").append('<li class="list-group-item">' + event.args._buyer + ' bought ' + event.args._name + '</li>');
        App.reloadArticles();
      });
    });
  },

  buyArticle: function() {
    event.preventDefault();

    // retrieve the article price
    var _articleId = $(event.target).data('id');
    var _price = parseFloat($(event.target).data('value'));

    App.contracts.ChainList.deployed().then(function(instance) {
      return instance.buyArticle(_articleId, {
        from: App.account,
        value: web3.toWei(_price, "ether"),
        gas: 500000
      });
    }).then(function(result) {

    }).catch(function(err) {
      console.error(err);
    });
  },

  placeBet: function() {

    console.log('inside placeBet function...')

    // retrieve details of the bet
    var _bet_title = $("#bet_title").val();
    var _bet_terms= $("#bet_terms").val();
    var _bet_amount = web3.toWei(parseFloat($("#bet_amount").val() || 0), "ether");

    console.log("bet title is: ", _bet_title)
    console.log("bet amount is: ", _bet_amount)
    console.log("bet terms are: ", _bet_terms)

    // need to get deployed contract instance and send it a placeBet transaction

    // if ((_article_name.trim() == '') || (_price == 0)) {
    //   // nothing to sell
    //   return false;
    // }

    // App.contracts.ChainList.deployed().then(function(instance) {
    //   return instance.sellArticle(_article_name, _description, _price, {
    //     from: App.account,
    //     gas: 500000
    //   });
    // }).then(function(result) {

    // }).catch(function(err) {
    //   console.error(err);
    // });
  },






};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
